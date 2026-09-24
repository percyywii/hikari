"use client";

import { streamingService } from "@/services/streamingService";
import { useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

export const WatchAreaContext = createContext();

export function WatchAreaContextProvider({ children, AnimeInfo }) {
  const searchparam = useSearchParams();
  const requestIdRef = useRef(0);

  const [episode, setEpisode] = useState(() => {
    const epFromSearch = parseInt(searchparam.get("ep"), 10);
    return !isNaN(epFromSearch) && epFromSearch > 0 ? epFromSearch : 1;
  });
  const [watchInfo, setWatchInfo] = useState({ loading: true });
  const [isDub, setIsDub] = useState(false);
  const [episodes, setEpisodes] = useState("loading");
  const [server, setServer] = useState("sub");
  const [playerState, setPlayerState] = useState("idle");
  const [playerError, setPlayerError] = useState("");
  const [sourceIndex, setSourceIndex] = useState(0);
  const [serverStatuses, setServerStatuses] = useState({});
  const [audioTrack, setAudioTrack] = useState("jpn");
  const [availableAudioTracks, setAvailableAudioTracks] = useState([
    { id: "jpn", label: "Japanese (Sub)" },
    { id: "eng", label: "English (Dub)" },
  ]);
  const [retryKey, setRetryKey] = useState(0);
  const artInstanceRef = useRef(null);

  const episodeLists = useMemo(() => {
    if (episodes === "loading" || !Array.isArray(episodes)) return { sub: [], dub: [] };
    return {
      sub: episodes.filter((item) => item?.isSubbed !== false),
      dub: episodes.filter((item) => item?.isDubbed !== false),
    };
  }, [episodes]);
  const { sub, dub } = episodeLists;

  const markPlayerReady = useCallback(() => {
    setWatchInfo((current) =>
      current?.watchData ? { ...current, loading: false, error: "" } : current
    );
    setPlayerState("ready");
    setPlayerError("");
    setServerStatuses((prev) => ({ ...prev, [sourceIndex]: "ready" }));
  }, [sourceIndex]);

  const markPlayerLoading = useCallback(() => {
    setWatchInfo((current) =>
      current?.watchData ? { ...current, loading: true, error: "" } : current
    );
    setPlayerState("loading");
    setPlayerError("");
    setServerStatuses((prev) => ({ ...prev, [sourceIndex]: "connecting" }));
  }, [sourceIndex]);

  const markPlayerError = useCallback((message) => {
    const error =
      typeof message === "string"
        ? message
        : message?.message && typeof message.message === "string"
        ? message.message
        : "Unable to play this episode.";
    setWatchInfo((current) => ({ ...current, loading: false, error }));
    setPlayerState("error");
    setPlayerError(error);
    setServerStatuses((prev) => ({ ...prev, [sourceIndex]: "failed" }));
  }, [sourceIndex]);

  const setPlayerErrorSafe = useCallback((err) => {
    const safeStr =
      typeof err === "string"
        ? err
        : err?.message && typeof err.message === "string"
        ? err.message
        : err
        ? "Playback error occurred."
        : "";
    setPlayerError(safeStr);
  }, []);

  const retryWatch = useCallback(() => {
    setRetryKey((current) => current + 1);
    setSourceIndex(0);
    setPlayerState("idle");
    setPlayerError("");
    setServerStatuses({});
    setWatchInfo((current) => ({ ...current, watchData: null, loading: true, error: "" }));
  }, []);

  const switchServer = useCallback((newIndex) => {
    const sources = watchInfo?.watchData?.sources || [];
    if (newIndex >= 0 && newIndex < sources.length) {
      setSourceIndex(newIndex);
      setServerStatuses((prev) => ({ ...prev, [newIndex]: "connecting" }));
      setPlayerState("loading");
      setPlayerError("");
    }
  }, [watchInfo?.watchData]);

  const tryNextSource = useCallback(
    (message = "Unable to play from the current server.") => {
      const safeMessage =
        typeof message === "string"
          ? message
          : message?.message && typeof message.message === "string"
          ? message.message
          : "Unable to play from the current server.";
      const sources = watchInfo?.watchData?.sources || [];
      const failedIndex = sourceIndex;
      setServerStatuses((prev) => ({ ...prev, [failedIndex]: "failed" }));

      const nextIndex = failedIndex + 1;
      if (nextIndex < sources.length) {
        console.warn(`[Hikari Player] Falling back to server ${nextIndex + 1}: ${sources[nextIndex]?.serverName || "Alternate"}`);
        setSourceIndex(nextIndex);
        setServerStatuses((prev) => ({ ...prev, [nextIndex]: "connecting" }));
        markPlayerLoading();
        return;
      }
      markPlayerError(safeMessage);
    },
    [watchInfo?.watchData, sourceIndex, markPlayerLoading, markPlayerError]
  );

  // Synchronize audio track switching with HLS player instance
  const handleSelectAudioTrack = useCallback((trackId) => {
    setAudioTrack(trackId);
    const wantDub = trackId === "eng";
    setIsDub(wantDub);
    setServer(wantDub ? "dub" : "sub");

    const art = artInstanceRef.current;
    if (art?.hls?.audioTracks?.length) {
      const tracks = art.hls.audioTracks;
      let targetIndex = -1;
      if (wantDub) {
        targetIndex = tracks.findIndex(
          (t) =>
            (t.lang || "").toLowerCase().includes("en") ||
            (t.name || "").toLowerCase().includes("eng") ||
            (t.name || "").toLowerCase().includes("dub")
        );
      } else {
        targetIndex = tracks.findIndex(
          (t) =>
            (t.lang || "").toLowerCase().includes("jp") ||
            (t.name || "").toLowerCase().includes("nat") ||
            (t.name || "").toLowerCase().includes("sub")
        );
      }
      if (targetIndex >= 0) {
        art.hls.audioTrack = targetIndex;
      }
    }
  }, []);

  // Fetch watch data on episode or server mode change immediately without waterfall
  useEffect(() => {
    if (!AnimeInfo?.id) return;

    const requestId = ++requestIdRef.current;
    let cancelled = false;

    const fetchData = async () => {
      try {
        setWatchInfo((current) => ({ ...current, watchData: null, loading: true, error: "" }));
        setPlayerState("loading");
        setPlayerError("");
        setSourceIndex(0);
        setServerStatuses({ 0: "connecting" });

        // If episodes explicitly loaded as empty array
        if (Array.isArray(episodes) && episodes.length === 0) {
          const message = "No episodes are available from the streaming provider.";
          toast.warn(message);
          if (!cancelled && requestId === requestIdRef.current) {
            setWatchInfo({ loading: false, error: message });
            setPlayerState("error");
            setPlayerError(message);
          }
          return;
        }

        const isDubRequested = Boolean(isDub || server === "dub");
        const activeEpisodes = Array.isArray(episodes)
          ? (isDubRequested && dub.length > 0 ? dub : sub)
          : [];
        const currentEpisode = activeEpisodes.find((item) => item?.number === episode) || {
          number: episode,
          id: `ep:${AnimeInfo.id}:${episode}`,
        };

        const [watchData, episodeData] = await Promise.all([
          streamingService.fetchWatchData(currentEpisode.id, isDubRequested, {
            animeId: AnimeInfo.id,
            idMal: AnimeInfo.idMal,
            episode,
            title: AnimeInfo.title,
            retry: retryKey,
          }),
          activeEpisodes.find((item) => item?.number === episode),
        ]);

        if (cancelled || requestId !== requestIdRef.current) return;

        const sources = Array.isArray(watchData?.sources)
          ? watchData.sources.filter((item) => item?.url)
          : [];

        if (watchData?.error || sources.length === 0) {
          const message = watchData?.error || "No playable stream source was found for this episode.";
          setWatchInfo({ loading: false, error: message });
          setPlayerState("error");
          setPlayerError(message);
          return;
        }

        // Initialize server statuses
        const initialStatuses = {};
        sources.forEach((_, idx) => {
          initialStatuses[idx] = idx === 0 ? "connecting" : "ready";
        });
        setServerStatuses(initialStatuses);

        setWatchInfo({
          watchData: { ...watchData, sources },
          thumbnail: episodeData?.image || AnimeInfo?.coverImage?.extraLarge || AnimeInfo?.bannerImage || "",
          title: episodeData?.title || `Episode ${episode}`,
          loading: true,
          error: "",
        });
        setPlayerState("loading");
      } catch (error) {
        console.error("[Hikari Player] Failed to fetch watch info:", error);
        if (cancelled || requestId !== requestIdRef.current) return;
        const message = error?.message || "Failed to load episode stream.";
        toast.error(message);
        setWatchInfo({ loading: false, error: message });
        setPlayerState("error");
        setPlayerError(message);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [episode, server, isDub, retryKey, AnimeInfo?.id, AnimeInfo?.idMal, AnimeInfo?.title]);

  // Restore playback progress from watch history
  useEffect(() => {
    if (typeof window === "undefined") return;
    let watchHistory = {};
    try {
      watchHistory =
        JSON.parse(localStorage.getItem("hikari_watch_history") || localStorage.getItem("tenro_watch_history")) ||
        JSON.parse(localStorage.getItem("watch_history")) ||
        {};
    } catch {
      watchHistory = {};
    }
    const epFromHistory = parseInt(watchHistory?.[AnimeInfo?.id]?.episode, 10);
    if (!isNaN(epFromHistory) && epFromHistory > 0 && !searchparam.get("ep")) {
      setEpisode(epFromHistory);
    }
  }, [AnimeInfo?.id, episodes, searchparam]);

  const contextValue = useMemo(
    () => ({
      episode,
      watchInfo,
      setEpisode,
      setIsDub,
      isDub,
      setEpisodes,
      episodes,
      AnimeInfo,
      server,
      setServer,
      animeid: AnimeInfo?.id,
      playerState,
      playerError,
      sourceIndex,
      serverStatuses,
      audioTrack,
      availableAudioTracks,
      setAudioTrack: handleSelectAudioTrack,
      setAvailableAudioTracks,
      setPlayerState,
      setPlayerError: setPlayerErrorSafe,
      markPlayerReady,
      markPlayerLoading,
      markPlayerError,
      retryWatch,
      tryNextSource,
      switchServer,
      artInstanceRef,
    }),
    [
      episode,
      watchInfo,
      isDub,
      episodes,
      server,
      AnimeInfo,
      playerState,
      playerError,
      sourceIndex,
      serverStatuses,
      audioTrack,
      availableAudioTracks,
      handleSelectAudioTrack,
      markPlayerReady,
      markPlayerLoading,
      markPlayerError,
      retryWatch,
      tryNextSource,
      switchServer,
    ]
  );

  return <WatchAreaContext.Provider value={contextValue}>{children}</WatchAreaContext.Provider>;
}

export function useWatchContext() {
  return useContext(WatchAreaContext);
}

export default WatchAreaContext;

import { useEffect, useRef } from "react";
import Hls from "hls.js";
import Artplayer from "artplayer";
import safeHlsQualityPlugin from "@/lib/plugins/safeHlsQualityPlugin";
import safeChapterPlugin from "@/lib/plugins/safeChapterPlugin";
import { useWatchContext } from "@/context/Watch";
import { useWatchSettingContext } from "@/context/WatchSetting";
import { SaveProgress } from "@/utils/saveProgress";
import { streamingService } from "@/services/streamingService";
import { subtitleService } from "@/services/subtitleService";

const HLS_RECOVERY_ATTEMPTS = 2;
const PLAYER_LOAD_TIMEOUT_MS = 12000;

function isHttpUrl(value) {
  return typeof value === "string" && (/^https?:\/\//i.test(value) || value.startsWith("/"));
}

const useArtplayer = (getInstance) => {
  const {
    setEpisode,
    watchInfo,
    episode,
    animeid,
    AnimeInfo,
    sourceIndex,
    server,
    isDub,
    setPlayerError,
    setPlayerState,
    markPlayerReady,
    markPlayerError,
    tryNextSource,
    setAvailableAudioTracks,
    artInstanceRef,
  } = useWatchContext();
  const { watchSetting } = useWatchSettingContext();
  const artRef = useRef(null);
  const artInstance = useRef(null);

  useEffect(() => {
    const watchData = watchInfo?.watchData;
    const sources = Array.isArray(watchData?.sources)
      ? watchData.sources.filter((item) => item?.url)
      : [];
    const source = sources[sourceIndex] || null;

    const destroyCurrent = () => {
      if (artInstance.current && !artInstance.current.isDestroy) {
        try {
          if (artInstance.current.video) {
            artInstance.current.video.pause();
            artInstance.current.video.removeAttribute("src");
            artInstance.current.video.load();
          }
          if (artInstance.current.hls && !artInstance.current.hls.destroyed) {
            artInstance.current.hls.destroy();
          }
          artInstance.current.destroy(true);
        } catch {
          // Ignore destroy errors
        }
      }
      if (artRef.current) {
        artRef.current.innerHTML = "";
      }
      artInstance.current = null;
      if (artInstanceRef) artInstanceRef.current = null;
      if (getInstance) getInstance(null);
    };

    if (!source || source?.type === "embed" || !artRef.current) {
      destroyCurrent();
      if (!source && watchData && !watchInfo?.loading) {
        markPlayerError("No playable stream source is available for this episode.");
      }
      return;
    }

    const sourceUrl = source.url;
    if (typeof sourceUrl !== "string" || !isHttpUrl(sourceUrl)) {
      destroyCurrent();
      tryNextSource("The selected source has an invalid URL.");
      return;
    }

    const sourceType = String(source.type || "").toLowerCase();
    const isHls =
      sourceType === "hls" ||
      sourceType === "m3u8" ||
      /\.m3u8(?:[?#]|$)/i.test(sourceUrl) ||
      /\.txt(?:[?#]|$)/i.test(sourceUrl);
    const isDash =
      sourceType === "dash" ||
      sourceType === "mpd" ||
      /\.mpd(?:[?#]|$)/i.test(sourceUrl);

    const providerHeaders = {
      ...(watchData.headers && typeof watchData.headers === "object" ? watchData.headers : {}),
      ...(source.headers && typeof source.headers === "object" ? source.headers : {}),
    };
    const streamPk = source.pk || watchData.pk || providerHeaders["pk"] || "";

    const wantDub = Boolean(isDub || server === "dub");
    const playbackUrl = isHls
      ? streamingService.buildProxyUrl(sourceUrl, providerHeaders, streamPk, wantDub)
      : sourceUrl;

    const subtitles = subtitleService.normalizeSubtitles(watchData.subtitles, providerHeaders);
    const defaultSub = subtitles.find((subtitle) => subtitle.default) || subtitles[0] || null;

    // Structured Development Logging
    if (process.env.NODE_ENV !== "production") {
      console.log("[Tenro Playback Diagnostics]", {
        animeId: animeid,
        episode,
        server: source.serverName || `Server ${sourceIndex + 1}`,
        provider: watchData.provider || "Unknown",
        sourceType: isHls ? "HLS (.m3u8)" : isDash ? "DASH (.mpd)" : "Direct (MP4)",
        hasDecryptionKey: Boolean(streamPk),
        playbackUrl: playbackUrl.slice(0, 100) + "...",
        subtitlesAvailable: subtitles.length,
      });
    }

    destroyCurrent();

    let disposed = false;
    let loadTimeout = null;
    let autoplayAttempted = false;

    const isCurrent = () => !disposed && artInstance.current === art;
    const destroyArt = () => {
      if (artInstance.current === art) artInstance.current = null;
      if (art && !art.isDestroy) {
        try {
          if (art.video) {
            art.video.pause();
            art.video.removeAttribute("src");
            art.video.load();
          }
          if (art.hls && !art.hls.destroyed) {
            art.hls.destroy();
          }
          art.destroy(true);
        } catch {}
      }
      if (artRef.current) {
        artRef.current.innerHTML = "";
      }
      if (artInstanceRef) artInstanceRef.current = null;
      if (getInstance) getInstance(null);
    };

    const failCurrentSource = (message) => {
      if (isCurrent()) {
        const errMsg =
          typeof message === "string"
            ? message
            : message?.message && typeof message.message === "string"
            ? message.message
            : "The stream could not be loaded.";
        setPlayerError(errMsg);
        tryNextSource(errMsg);
        destroyArt();
      }
    };

    const handleCanPlay = () => {
      if (!isCurrent()) return;
      markPlayerReady();
      if (watchSetting?.autoPlay && !autoplayAttempted) {
        autoplayAttempted = true;
        Promise.resolve(art.play()).catch((error) => {
          if (error?.name !== "AbortError" && isCurrent()) {
            console.warn("[Hikari Player] Autoplay was blocked by browser:", error.message);
            if (art.template?.$poster) {
              art.template.$poster.style.display = "block";
            }
          }
        });
      }
    };

    const handleVideoError = () => {
      if (!isCurrent()) return;
      const mediaError = art.video?.error;
      const message =
        mediaError?.message ||
        (mediaError?.code === 4
          ? "The stream format is not supported by this browser."
          : "The media stream failed to load.");
      failCurrentSource(message);
    };

    const handlePlayerError = (_event, data) => {
      if (!isCurrent() || data?.name === "AbortError") return;
      failCurrentSource("The player could not load this stream.");
    };

    const art = new Artplayer({
      container: artRef.current,
      url: playbackUrl,
      type: isHls ? "m3u8" : isDash ? "mpd" : sourceType || "",
      autoplay: Boolean(watchSetting?.autoPlay),
      setting: true,
      theme: "#00F2FE",
      playbackRate: true,
      aspectRatio: true,
      backdrop: true,
      screenshot: true,
      hotkey: true,
      fullscreenWeb: true,
      autoPlayback: false,
      miniProgressBar: true,
      pip: true,
      fullscreen: true,
      playsInline: true,
      autoOrientation: true,
      poster: watchInfo?.thumbnail || AnimeInfo?.coverImage?.extraLarge || AnimeInfo?.bannerImage || "",
      subtitle: defaultSub
        ? {
            url: defaultSub.url,
            type: defaultSub.format,
            encoding: "utf-8",
            style: {
              color: "#ffffff",
              fontSize: "20px",
              textShadow: "0 2px 4px rgba(0,0,0,0.8)",
            },
          }
        : {},
      settings: [
        ...(subtitles.length > 0
          ? [
              {
                html: "Subtitle",
                width: 250,
                tooltip: defaultSub?.label || "Off",
                selector: [
                  {
                    default: !defaultSub,
                    html: "Off",
                    url: "",
                  },
                  ...subtitles.map((subtitle) => ({
                    default: subtitle === defaultSub,
                    html: subtitle.label || subtitle.language,
                    url: subtitle.url,
                  })),
                ],
                onSelect: function (item) {
                  if (!item.url) {
                    art.subtitle.show = false;
                    return "Off";
                  }
                  art.subtitle.switch(item.url, {
                    name: item.html,
                  });
                  art.subtitle.show = true;
                  return item.html;
                },
              },
            ]
          : []),
      ],
      plugins: [
        ...(isHls && Hls.isSupported()
          ? [
              safeHlsQualityPlugin({
                control: true,
                setting: true,
                getResolution: (level) => `${level.height}P`,
                title: "Quality",
                auto: "Auto",
              }),
            ]
          : []),
        ...(() => {
          const chapters = [];
          if (
            Number.isFinite(watchData?.intro?.start) &&
            Number.isFinite(watchData?.intro?.end) &&
            watchData.intro.start !== watchData.intro.end
          ) {
            chapters.push({
              start: watchData.intro.start,
              end: watchData.intro.end,
              title: "Opening Intro",
            });
          }
          if (
            Number.isFinite(watchData?.outro?.start) &&
            Number.isFinite(watchData?.outro?.end) &&
            watchData.outro.start !== watchData.outro.end
          ) {
            chapters.push({
              start: watchData.outro.start,
              end: watchData.outro.end,
              title: "Ending Outro",
            });
          }
          return chapters.length ? [safeChapterPlugin({ chapters })] : [];
        })(),
      ],
      customType: {
        m3u8: (video, url, artPlayer) => {
          if (Hls.isSupported()) {
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: false,
              capLevelToPlayerSize: false,
              maxBufferHole: 0.8,
              maxSeekHole: 2,
              nudgeOffset: 0.1,
              nudgeMaxRetry: 5,
              maxFragLookUpTolerance: 0.25,
              startLevel: -1,
              maxBufferLength: 90,
              maxMaxBufferLength: 120,
              backBufferLength: 60,
              maxBufferSize: 60000000,
              fragLoadingTimeOut: 20000,
              manifestLoadingTimeOut: 15000,
              levelLoadingTimeOut: 15000,
            });
            artPlayer.hls = hls;
            const startPlayback = () => {
              if (!isCurrent()) return;
              markPlayerReady();
              if (watchSetting?.autoPlay) {
                Promise.resolve(artPlayer.play()).catch(() => {});
              }
            };

            video.addEventListener("loadedmetadata", startPlayback);
            hls.attachMedia(video);
            hls.loadSource(url);

            // Audio track synchronization helper
            const syncAudioTracks = (tracks) => {
              if (!isCurrent() || !Array.isArray(tracks) || tracks.length === 0) return;
              const formattedTracks = tracks.map((t, idx) => ({
                id:
                  (t.lang || "").toLowerCase().includes("en") ||
                  (t.name || "").toLowerCase().includes("eng")
                    ? "eng"
                    : "jpn",
                label:
                  t.name ||
                  ((t.lang || "").toLowerCase().includes("en")
                    ? "English (Dub)"
                    : "Japanese (Sub)"),
                trackIndex: idx,
              }));
              if (setAvailableAudioTracks) {
                setAvailableAudioTracks(formattedTracks);
              }

              const wantDubNow = Boolean(isDub || server === "dub");
              const engIdx = tracks.findIndex(
                (t) =>
                  (t.lang || "").toLowerCase().includes("en") ||
                  (t.name || "").toLowerCase().includes("eng") ||
                  (t.name || "").toLowerCase().includes("dub")
              );
              const jpnIdx = tracks.findIndex(
                (t) =>
                  (t.lang || "").toLowerCase().includes("jp") ||
                  (t.name || "").toLowerCase().includes("nat") ||
                  (t.name || "").toLowerCase().includes("sub")
              );

              const targetIdx = wantDubNow ? (engIdx >= 0 ? engIdx : -1) : (jpnIdx >= 0 ? jpnIdx : -1);
              if (targetIdx >= 0 && hls.audioTrack !== targetIdx) {
                console.log(
                  `[Hikari Player] Switching audio track to index ${targetIdx} (${tracks[targetIdx]?.name || tracks[targetIdx]?.lang})`
                );
                hls.audioTrack = targetIdx;
              }
            };

            // Manifest parsed: detect audio tracks & set initial language
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              if (!isCurrent()) return;
              syncAudioTracks(hls.audioTracks);
            });

            // Handle asynchronous audio track updates
            hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (_event, data) => {
              if (!isCurrent()) return;
              syncAudioTracks(data?.audioTracks || hls.audioTracks);
            });

            let recoveryAttempts = 0;
            hls.on(Hls.Events.ERROR, (_event, data) => {
              if (disposed || artInstance.current !== artPlayer) return;

              // Recover from non-fatal buffer holes / stalls to ensure video never stalls while audio plays
              if (data?.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
                console.warn("[Hikari Player] Video buffer stalled, nudging playhead...");
                if (video && !video.paused) {
                  video.currentTime += 0.1;
                }
                return;
              }
              if (data?.details === Hls.ErrorDetails.BUFFER_SEEK_OVER_HOLE) {
                return;
              }

              if (data?.fatal) {
                if (recoveryAttempts < HLS_RECOVERY_ATTEMPTS) {
                  recoveryAttempts += 1;
                  try {
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                      hls.startLoad();
                      return;
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                      hls.recoverMediaError();
                      return;
                    }
                  } catch {
                    // Fall through to failure
                  }
                }
                failCurrentSource(data.details || "HLS stream failed to play.");
              }
            });

            artPlayer.on("destroy", () => {
              video.removeEventListener("loadedmetadata", startPlayback);
              if (!hls.destroyed) {
                try {
                  hls.destroy();
                } catch {}
              }
            });
            return;
          }

          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            return;
          }

          failCurrentSource("HLS playback is not supported by your browser.");
        },
        mpd: (video, url) => {
          if (video.canPlayType("application/dash+xml")) {
            video.src = url;
            return;
          }
          failCurrentSource("DASH playback is not supported by your browser.");
        },
      },
    });

    artInstance.current = art;
    if (artInstanceRef) artInstanceRef.current = art;

    // Player State Synchronization - Clean In-Stream Buffering Indicator (Primary Pikachu is in VideoContainer)
    art.on("loading", () => {
      const $loading = art.template?.$loading;
      if ($loading) {
        $loading.innerHTML = `
          <div style="display:inline-flex; align-items:center; gap:8px; background:rgba(9,10,15,0.85); padding:8px 18px; border-radius:9999px; border:1px solid rgba(6,182,212,0.35); backdrop-filter:blur(12px); box-shadow:0 8px 32px rgba(0,0,0,0.6); pointer-events:none; user-select:none;">
            <div style="width:14px; height:14px; border:2px solid rgba(6,182,212,0.25); border-top-color:#06b6d4; border-radius:50%; animation:artSpin 0.75s linear infinite;"></div>
            <span style="font-size:12px; color:#f8fafc; font-family:'Outfit', sans-serif; font-weight:500; letter-spacing:0.02em;">Buffering stream...</span>
          </div>
        `;
      }
    });
    art.on("video:play", () => {
      if (isCurrent()) {
        setPlayerState("playing");
        if (art.template?.$poster) {
          art.template.$poster.style.display = "none";
        }
      }
    });
    art.on("video:playing", () => {
      if (isCurrent()) {
        setPlayerState("playing");
        if (art.template?.$poster) {
          art.template.$poster.style.display = "none";
        }
        if (art.loading && typeof art.loading.show === "boolean") {
          art.loading.show = false;
        }
      }
    });
    art.on("video:timeupdate", () => {
      if (isCurrent() && art.video?.currentTime > 0) {
        if (art.template?.$poster && art.template.$poster.style.display !== "none") {
          art.template.$poster.style.display = "none";
        }
      }
    });
    art.on("video:pause", () => isCurrent() && setPlayerState("paused"));
    art.on("video:waiting", () => isCurrent() && setPlayerState("buffering"));
    art.on("video:canplay", handleCanPlay);
    art.on("video:error", handleVideoError);
    art.on("error", handlePlayerError);

    art.on("destroy", () => {
      disposed = true;
      if (loadTimeout) clearTimeout(loadTimeout);
    });

    art.on("video:ended", () => {
      if (isCurrent()) {
        setPlayerState("ended");
        if (watchSetting?.autoNext) {
          setEpisode((prev) => prev + 1);
        }
      }
    });

    // Auto Skip Intro & Outro
    const introStart = watchData?.intro?.start;
    const introEnd = watchData?.intro?.end;
    const outroStart = watchData?.outro?.start;
    const outroEnd = watchData?.outro?.end;

    // Throttled Progress Saving (Tenro Watch History)
    const throttledSaveProgress = (() => {
      let lastRun = 0;
      return (data) => {
        if (!isCurrent()) return;
        const now = Date.now();
        const currentTime = data?.target?.currentTime || 0;
        const duration = data?.target?.duration || 0;

        // Auto skip check
        if (watchSetting?.autoSkipIntro) {
          if (
            Number.isFinite(introStart) &&
            Number.isFinite(introEnd) &&
            currentTime >= introStart &&
            currentTime < introEnd - 1
          ) {
            art.seek = introEnd;
            return;
          }
          if (
            Number.isFinite(outroStart) &&
            Number.isFinite(outroEnd) &&
            currentTime >= outroStart &&
            currentTime < outroEnd - 1
          ) {
            art.seek = outroEnd;
            return;
          }
        }

        if (now - lastRun >= 6000 && duration > 0) {
          SaveProgress(
            animeid,
            episode,
            currentTime,
            watchInfo?.thumbnail,
            duration,
            watchInfo?.title || AnimeInfo?.title?.english || AnimeInfo?.title?.romaji
          );

          // Save to Tenro watch history in localStorage
          try {
            const hist = JSON.parse(localStorage.getItem("tenro_watch_history")) || {};
            hist[animeid] = {
              animeId: animeid,
              episode,
              currentTime,
              duration,
              title: watchInfo?.title || AnimeInfo?.title?.english || AnimeInfo?.title?.romaji,
              thumbnail: watchInfo?.thumbnail,
              updatedAt: now,
            };
            localStorage.setItem("tenro_watch_history", JSON.stringify(hist));
          } catch {}

          lastRun = now;
        }
      };
    })();

    art.on("video:timeupdate", throttledSaveProgress);

    // Resume playback from saved timestamp
    art.on("ready", () => {
      if (!isCurrent()) return;
      try {
        const watchHistory =
          JSON.parse(localStorage.getItem("tenro_watch_history")) ||
          JSON.parse(localStorage.getItem("watch_history")) ||
          {};
        if (watchHistory?.[animeid]?.episode?.toString() === episode?.toString()) {
          const currentTime = parseInt(watchHistory[animeid].currentTime, 10);
          if (!isNaN(currentTime) && currentTime > 5) {
            art.seek = currentTime;
          }
        }
      } catch {}
    });

    // Maximum stream loading timeout guard (12 seconds)
    loadTimeout = setTimeout(() => {
      if (isCurrent() && !art.isReady && (art.video?.readyState || 0) < 2) {
        console.warn("[Tenro Player] Stream load timeout reached (12s). Falling back.");
        failCurrentSource("The current server took too long to respond.");
      }
    }, PLAYER_LOAD_TIMEOUT_MS);

    if (getInstance) getInstance(art);
    if (art.video?.readyState >= 3) {
      handleCanPlay();
    }

    return () => {
      disposed = true;
      if (loadTimeout) clearTimeout(loadTimeout);
      destroyArt();
    };
  }, [
    watchInfo?.watchData,
    sourceIndex,
    server,
    isDub,
    watchSetting?.autoNext,
    watchSetting?.autoPlay,
    watchSetting?.autoSkipIntro,
    getInstance,
    setEpisode,
    episode,
    animeid,
    AnimeInfo,
    setPlayerError,
    setPlayerState,
    markPlayerReady,
    markPlayerError,
    tryNextSource,
    setAvailableAudioTracks,
    artInstanceRef,
  ]);

  return artRef;
};

export default useArtplayer;

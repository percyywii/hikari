"use client";

import { useMemo } from "react";
import { useWatchContext } from "@/context/Watch";
import { FaMicrophone, FaServer, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import { MdSubtitles } from "react-icons/md";
import { FiRefreshCw } from "react-icons/fi";

const Server = () => {
  const {
    isDub,
    setIsDub,
    server,
    setServer,
    episodes,
    watchInfo,
    sourceIndex,
    switchServer,
    serverStatuses,
    playerState,
    audioTrack,
    setAudioTrack,
    availableAudioTracks,
    retryWatch,
  } = useWatchContext();

  const [subEpisodes, dubEpisodes] = useMemo(() => {
    if (episodes === "loading" || !Array.isArray(episodes)) return [[], []];
    return [
      episodes.filter((item) => item?.isSubbed !== false),
      episodes.filter((item) => item?.isDubbed !== false),
    ];
  }, [episodes]);

  const hasSub = subEpisodes.length > 0;
  const hasDub = dubEpisodes.length > 0;

  const sources = watchInfo?.watchData?.sources || [];
  const currentSource = sources[sourceIndex] || sources[0];

  const handleAudioSelect = (type) => {
    if (type === "dub") {
      setIsDub(true);
      setServer("dub");
      setAudioTrack("eng");
    } else {
      setIsDub(false);
      setServer("sub");
      setAudioTrack("jpn");
    }
  };

  return (
    <div className="w-full flex flex-col divide-y divide-slate-200 dark:divide-[#1A1D2B] bg-slate-50 dark:bg-[#0E1017] transition-colors">
      {/* Audio Mode Selection (Sub vs Dub) */}
      <div className="px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          <span>Audio Feed</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub Option */}
          <button
            type="button"
            disabled={!hasSub}
            onClick={() => handleAudioSelect("sub")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              !isDub
                ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/10"
                : hasSub
                ? "bg-white dark:bg-[#161926] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E2235] border border-slate-200 dark:border-[#23283E]"
                : "opacity-40 cursor-not-allowed bg-slate-100 dark:bg-[#12141F] text-slate-400 dark:text-slate-500 border border-transparent"
            }`}
          >
            <MdSubtitles className="w-3.5 h-3.5" />
            <span>Sub (Japanese)</span>
            {!hasSub && <span className="text-[10px] text-slate-400 dark:text-slate-500">(N/A)</span>}
          </button>

          {/* Dub Option */}
          <button
            type="button"
            disabled={!hasDub && !availableAudioTracks.some((t) => t.id === "eng")}
            onClick={() => handleAudioSelect("dub")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isDub || audioTrack === "eng"
                ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/50 shadow-sm shadow-purple-500/10"
                : hasDub || availableAudioTracks.some((t) => t.id === "eng")
                ? "bg-white dark:bg-[#161926] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E2235] border border-slate-200 dark:border-[#23283E]"
                : "opacity-40 cursor-not-allowed bg-slate-100 dark:bg-[#12141F] text-slate-400 dark:text-slate-500 border border-transparent"
            }`}
          >
            <FaMicrophone className="w-3 h-3" />
            <span>Dub (English)</span>
            {!hasDub && !availableAudioTracks.some((t) => t.id === "eng") && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500">(N/A)</span>
            )}
          </button>
        </div>
      </div>

      {/* Available Streaming Servers */}
      <div className="px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          <FaServer className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
          <span>Active Server</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {sources.length > 0 ? (
            sources.map((src, idx) => {
              const isSelected = idx === sourceIndex;
              const status =
                serverStatuses[idx] ||
                (isSelected
                  ? playerState === "error"
                    ? "failed"
                    : playerState === "loading"
                    ? "connecting"
                    : "ready"
                  : "idle");

              return (
                <button
                  key={src.serverId || idx}
                  type="button"
                  onClick={() => switchServer(idx)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-cyan-500/10 text-cyan-700 dark:text-white border border-cyan-500/60 shadow-sm shadow-cyan-500/10"
                      : "bg-white dark:bg-[#141724] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1C2032] border border-slate-200 dark:border-[#202538]"
                  }`}
                >
                  {/* Status Indicator Dot */}
                  <span className="relative flex h-2 w-2">
                    {status === "connecting" && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    )}
                    <span
                      className={`relative inline-flex rounded-full h-2 w-2 ${
                        status === "ready"
                          ? "bg-emerald-500"
                          : status === "connecting"
                          ? "bg-amber-400"
                          : status === "failed"
                          ? "bg-rose-500"
                          : "bg-slate-400"
                      }`}
                    ></span>
                  </span>

                  <span>{src.serverName || `HD-${idx + 1}`}</span>

                  {src.type === "embed" && (
                    <span className="text-[10px] px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      Embed
                    </span>
                  )}

                  {isSelected && status === "ready" && (
                    <FaCheck className="w-2.5 h-2.5 text-cyan-600 dark:text-cyan-400 ml-0.5" />
                  )}
                  {isSelected && status === "failed" && (
                    <FaExclamationTriangle className="w-2.5 h-2.5 text-rose-500 dark:text-rose-400 ml-0.5" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Resolving fast CDN nodes...</span>
              <button
                type="button"
                onClick={retryWatch}
                className="ml-2 p-1 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
                title="Retry resolution"
              >
                <FiRefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Server;

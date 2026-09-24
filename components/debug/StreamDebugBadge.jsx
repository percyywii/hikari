"use client";

import { useState } from "react";
import { useWatchContext } from "@/context/Watch";

export default function StreamDebugBadge() {
  const [isOpen, setIsOpen] = useState(false);
  const { episode, watchInfo, server, AnimeInfo, playerState, playerError, sourceIndex } = useWatchContext();

  if (process.env.NODE_ENV === "production") return null;

  const watchData = watchInfo?.watchData;
  const sources = Array.isArray(watchData?.sources) ? watchData.sources.filter((item) => item?.url) : [];
  const source = sources[sourceIndex] || null;
  const subtitles = watchData?.subtitles || [];
  const status = watchInfo?.loading
    ? "LOADING..."
    : playerState === "ready"
      ? "READY (CAN PLAY)"
      : playerState === "error" || watchInfo?.error
        ? "FAILED"
        : "RESOLVING...";
  let streamHost = "N/A";
  if (source?.url) {
    try {
      streamHost = new URL(source.url).host;
    } catch {
      streamHost = "invalid URL";
    }
  }

  return (
    <div className="mt-2 text-xs font-mono">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2 py-1 bg-[#2e2c3d] hover:bg-[#3d3a52] text-slate-300 rounded border border-[#4a4763] flex items-center gap-2 transition-colors"
        suppressHydrationWarning
      >
        <span className={playerState === "ready" ? "w-2 h-2 rounded-full bg-emerald-400" : "w-2 h-2 rounded-full bg-amber-400"}></span>
        STREAM DIAGNOSTICS {isOpen ? "▲" : "▼"}
      </button>

      {isOpen && (
        <div className="mt-2 p-3 bg-[#181722] border border-[#3e3b56] rounded-md text-slate-300 space-y-1 max-w-xl">
          <div className="text-emerald-400 font-bold border-b border-[#302e42] pb-1 mb-2">
            STREAM DEBUG TELEMETRY (DEV ONLY)
          </div>
          <div>
            <span className="text-slate-500">Anime:</span>{" "}
            <span className="text-white font-medium">
              {AnimeInfo?.title?.english || AnimeInfo?.title?.romaji || `ID: ${AnimeInfo?.id}`}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Episode:</span>{" "}
            <span className="text-white font-medium">{episode}</span> |{" "}
            <span className="text-slate-500">Audio:</span>{" "}
            <span className="text-white uppercase font-medium">{server}</span>
          </div>
          <div>
            <span className="text-slate-500">Provider:</span>{" "}
            <span className="text-amber-300">{watchData?.provider || "N/A"}</span>
          </div>
          <div>
            <span className="text-slate-500">Status:</span>{" "}
            <span className={status === "READY (CAN PLAY)" ? "text-emerald-400" : status === "FAILED" ? "text-rose-400" : "text-blue-400"}>
              {status}
            </span>
          </div>
          {playerError && <div className="text-rose-300 break-words">Player error: {playerError}</div>}
          <div>
            <span className="text-slate-500">Sources:</span>{" "}
            <span className="text-white">{sources.length}</span> |{" "}
            <span className="text-slate-500">Selected:</span>{" "}
            <span className="text-white">{sourceIndex + 1}</span> |{" "}
            <span className="text-slate-500">Format:</span>{" "}
            <span className="text-cyan-300 uppercase font-semibold">{source?.type || "none"}</span>
          </div>
          <div>
            <span className="text-slate-500">Subtitles:</span>{" "}
            <span className="text-white">
              {subtitles.length > 0 ? subtitles.map((item) => item.label).join(", ") : "None returned"}
            </span>
          </div>
          {source?.url && (
            <div className="truncate text-slate-500 text-[11px] pt-1 border-t border-[#292738]">
              <span className="text-slate-400">Stream Host:</span> {streamHost}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

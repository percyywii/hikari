"use client";

import { useWatchContext } from "@/context/Watch";

const EpInfo = ({ episode }) => {
  const { isDub } = useWatchContext();

  return (
    <div className="h-full flex items-center justify-center flex-col min-w-[240px] px-6 py-4 text-center border-b md:border-b-0 md:border-r border-[#1A1D2B] bg-[#0B0D13]">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <p className="text-sm font-medium text-slate-200">
          Now Watching <span className="text-cyan-400 font-bold">Episode {episode}</span>
        </p>
      </div>
      <p className="text-[11px] text-slate-400 mt-1">
        Mode: <span className="text-slate-300 font-medium">{isDub ? "English Dub" : "Japanese Sub"}</span>
      </p>
    </div>
  );
};

export default EpInfo;
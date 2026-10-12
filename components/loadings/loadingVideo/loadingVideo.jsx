"use client";

import Image from "next/image";

const LoadingVideo = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4 select-none pointer-events-none">
      <div className="relative w-44 h-24 sm:w-52 sm:h-28 flex items-center justify-center">
        {/* Soft electrical aura glow */}
        <div className="absolute w-36 h-20 rounded-full bg-amber-400/20 blur-2xl animate-pulse pointer-events-none" />
        <div className="absolute -bottom-1 w-28 h-1 rounded-full bg-gradient-to-r from-transparent via-amber-400/60 to-transparent blur-[1px] animate-pulse" />

        <Image
          src="/images/pikachu-running.gif"
          alt="Pikachu Running"
          width={220}
          height={115}
          className="h-full w-auto object-contain filter drop-shadow-[0_4px_14px_rgba(251,191,36,0.35)]"
          priority
          unoptimized
        />
      </div>

      {/* Status message */}
      {message && (
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-200 bg-slate-900/80 px-4 py-1.5 rounded-full border border-amber-400/25 shadow-lg backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
          <span>{message}</span>
        </div>
      )}
    </div>
  );
};

export default LoadingVideo;
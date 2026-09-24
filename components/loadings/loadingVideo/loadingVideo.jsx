"use client";

import Image from "next/image";

const LoadingVideo = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4 select-none pointer-events-none">
      <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
        {/* Subtle electric aura glow */}
        <div className="absolute w-24 h-24 rounded-full bg-amber-400/15 blur-xl animate-pulse pointer-events-none" />

        <Image
          src="/images/pikachu-running.gif"
          alt="Pikachu Running"
          width={176}
          height={176}
          className="h-full w-full object-contain drop-shadow-[0_6px_20px_rgba(250,204,21,0.45)]"
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
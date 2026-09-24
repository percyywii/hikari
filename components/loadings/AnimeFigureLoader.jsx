"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const DEFAULT_MESSAGES = [
  "Summoning the highest quality frames for you...",
  "Sharpening the Japanese & English audio, senpai...",
  "Buffering multi-server streams with zero ads...",
  "Almost ready! Grab your ramen and snacks 🍜",
  "Checking playback integrity & fast nodes...",
  "Entering the anime realm..."
];

export default function AnimeFigureLoader({
  message,
  mascot = "/images/waifus/1.png",
  fullScreen = false,
  className = "",
}) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    if (message) return;
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % DEFAULT_MESSAGES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [message]);

  const activeMessage = message || DEFAULT_MESSAGES[currentMessageIndex];

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 select-none transition-all duration-300 ${
        fullScreen ? "fixed inset-0 z-50 bg-[#090A0F]/90 backdrop-blur-md" : "w-full"
      } ${className}`}
    >
      <div className="relative flex flex-col items-center max-w-sm w-full">
        {/* Anime Speech Bubble */}
        <div className="relative mb-4 animate-fade-in">
          <div className="relative z-10 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500/15 via-purple-500/15 to-pink-500/15 border border-sky-400/30 backdrop-blur-md shadow-lg shadow-sky-500/10 text-center">
            <p className="text-xs sm:text-sm font-semibold tracking-wide bg-gradient-to-r from-sky-300 via-cyan-200 to-pink-300 bg-clip-text text-transparent">
              {activeMessage}
            </p>
          </div>
          {/* Speech bubble tail pointer */}
          <div className="w-3 h-3 bg-gradient-to-br from-purple-500/20 to-sky-500/20 border-r border-b border-sky-400/30 transform rotate-45 mx-auto -mt-1.5 shadow-sm"></div>
        </div>

        {/* Anime Figure Mascot with Floating Animation and Celestial Aura */}
        <div className="relative flex items-center justify-center group">
          {/* Prismatic aura glow behind figure */}
          <div className="absolute w-40 h-40 rounded-full bg-gradient-to-tr from-sky-500/20 via-purple-500/20 to-pink-500/20 blur-2xl animate-pulse pointer-events-none" />

          {/* Anime Character Image */}
          <div className="relative z-10 w-32 h-44 sm:w-40 sm:h-52 animate-float">
            <Image
              src={mascot}
              alt="Anime Mascot"
              fill
              sizes="(max-width: 640px) 128px, 160px"
              className="object-contain drop-shadow-[0_8px_20px_rgba(56,189,248,0.35)]"
              priority
            />
          </div>
        </div>

        {/* Glowing Progress Track */}
        <div className="w-48 sm:w-56 h-1.5 bg-slate-800/80 rounded-full overflow-hidden mt-5 border border-sky-500/20 shadow-inner relative">
          <div className="h-full bg-gradient-to-r from-sky-400 via-cyan-300 to-pink-400 rounded-full animate-indeterminate-bar shadow-[0_0_12px_rgba(56,189,248,0.7)]" />
        </div>

        <div className="flex items-center gap-1.5 mt-2.5 text-[10px] uppercase font-bold tracking-widest text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
          <span>Hikari Engine Ready</span>
        </div>
      </div>
    </div>
  );
}

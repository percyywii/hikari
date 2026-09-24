"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaRotateRight, FaHouse } from "react-icons/fa6";

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error("Hikari client runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-[85vh] w-full flex items-center justify-center px-4 py-16 relative overflow-hidden transition-colors">
      {/* Background glow effects */}
      <div className="fixed w-[200px] h-[150px] left-[5%] top-[10%] bg-cyan-500/20 blur-[150px] pointer-events-none rounded-full"></div>
      <div className="fixed w-[400px] h-[300px] right-[10%] bottom-[15%] bg-blue-600/15 blur-[180px] pointer-events-none rounded-full"></div>

      <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 z-10">
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Playback Shield Active
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100 font-['Outfit'] tracking-tight mb-4">
            Something Went Wrong
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg mb-8 max-w-md leading-relaxed">
            Our server encountered a minor hiccup while loading this stream. Don&apos;t worry—your watch history and bookmarks are completely safe.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm transition-all duration-200 shadow-lg shadow-cyan-500/25 cursor-pointer active:scale-95"
            >
              <FaRotateRight className="text-sm" />
              Try Again
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-medium text-sm transition-all duration-200 border border-slate-300 dark:border-slate-700/60 cursor-pointer active:scale-95"
            >
              <FaHouse className="text-sm" />
              Go Back Home
            </Link>
          </div>
        </div>

        <div className="relative flex-shrink-0 flex items-center justify-center">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 drop-shadow-2xl">
            <Image
              src="/images/waifus/anime not found.png"
              alt="Hikari Anime Mascot"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}

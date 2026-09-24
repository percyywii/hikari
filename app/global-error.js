"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaRotateRight, FaHouse } from "react-icons/fa6";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Hikari global fatal error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4 font-sans antialiased">
        <div className="w-full max-w-xl mx-auto text-center flex flex-col items-center">
          <div className="relative w-48 h-48 mb-6 drop-shadow-2xl">
            <Image
              src="/images/waifus/anime not found.png"
              alt="Hikari Recovery"
              fill
              className="object-contain"
              priority
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            System Safeguard Triggered
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Hikari Temporarily Unavailable
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
            The server experienced an unexpected interrupt. Tap below to reload the page or return to the main anime catalog.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
            >
              <FaRotateRight className="text-sm" />
              Reload Page
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-all border border-slate-700 cursor-pointer"
            >
              <FaHouse className="text-sm" />
              Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}

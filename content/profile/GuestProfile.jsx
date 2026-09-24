"use client";

import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { FaUser, FaCompass, FaArrowLeft } from "react-icons/fa6";
import { RxExit } from "react-icons/rx";

export default function GuestProfile() {
  return (
    <div className="w-full min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 relative z-10">
      <div className="max-w-md w-full bg-white/80 dark:bg-[#10121A]/80 border border-slate-200 dark:border-[#1E2235] rounded-3xl p-8 backdrop-blur-2xl shadow-2xl flex flex-col items-center text-center">
        {/* Anime Waifu / Mascot Avatar */}
        <div className="relative w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-cyan-500 via-sky-400 to-fuchsia-500 mb-6 shadow-xl shadow-cyan-500/10">
          <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 dark:bg-[#161926] relative">
            <Image
              src="/images/waifus/1.png"
              alt="Guest Mascot"
              fill
              className="object-cover object-top"
              priority
            />
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 text-xs font-semibold border border-cyan-500/20 mb-3">
          Hikari Profile
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
          Track Your Anime Journey
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 mb-8 leading-relaxed max-w-sm">
          Connect your AniList account to sync watch progress, organize custom watchlists, view detailed statistics, and pick up right where you left off.
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            type="button"
            onClick={() => signIn("AniListProvider")}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98]"
          >
            <RxExit className="w-4 h-4" />
            <span>Sign In with AniList</span>
          </button>

          <Link
            href="/catalog"
            className="w-full py-3 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-[#161926] dark:hover:bg-[#1E2338] text-slate-800 dark:text-slate-200 font-medium text-sm border border-slate-200 dark:border-white/10 transition-all flex items-center justify-center gap-2"
          >
            <FaCompass className="w-3.5 h-3.5 text-cyan-500" />
            <span>Explore Catalog</span>
          </Link>

          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mt-2 flex items-center justify-center gap-1.5"
          >
            <FaArrowLeft className="w-3 h-3" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

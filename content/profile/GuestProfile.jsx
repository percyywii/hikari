"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { FaUser, FaCompass, FaArrowLeft, FaPlay, FaCircleCheck } from "react-icons/fa6";
import { RxExit } from "react-icons/rx";
import { getWatchProgress } from "@/utils/GetProgress";
import ContinueWatchingCard from "@/components/Cards/ContinueWatchingCard/ContinueWatchingCard";

const AVATAR_OPTIONS = [
  { id: "waifu1", name: "Waifu 1", src: "/images/waifus/1.png" },
  { id: "waifu2", name: "Waifu 2", src: "/images/waifus/2.png" },
  { id: "mascot", name: "Hikari", src: "/images/logo.png" },
  { id: "artwork", name: "Shinobi", src: "/images/artworks-Xhbx2TzxHzrllTQR-kmD5OQ-t500x500.jpg" },
];

export default function GuestProfile() {
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0].src);
  const [loading, setLoading] = useState(false);
  const [recentWatches, setRecentWatches] = useState([]);

  useEffect(() => {
    try {
      const data = getWatchProgress(false);
      if (Array.isArray(data)) {
        setRecentWatches(data);
      }
    } catch {
      setRecentWatches([]);
    }
  }, []);

  const handleCredentialsLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    const finalName = username.trim() || "Hikari Member";
    try {
      await signIn("credentials", {
        username: finalName,
        avatar: selectedAvatar,
        callbackUrl: "/profile",
      });
    } catch (err) {
      console.error("Login error:", err);
      setLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setLoading(true);
    try {
      await signIn("credentials", {
        username: "HikariFan",
        avatar: selectedAvatar,
        callbackUrl: "/profile",
      });
    } catch (err) {
      console.error("Quick login error:", err);
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-start px-4 py-12 relative z-10">
      <div className="max-w-lg w-full bg-white/90 dark:bg-[#10121A]/90 border border-slate-200 dark:border-[#1E2235] rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl flex flex-col items-center text-center transition-all">
        {/* Active Avatar Preview */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-cyan-500 via-sky-400 to-fuchsia-500 mb-4 shadow-xl shadow-cyan-500/15">
          <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 dark:bg-[#161926] relative">
            <Image
              src={selectedAvatar}
              alt="Profile Avatar"
              fill
              className="object-cover object-top"
              priority
            />
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 text-xs font-semibold border border-cyan-500/20 mb-2">
          Hikari Profile
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
          Welcome to Hikari
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 mb-6 max-w-sm">
          Sign in to customize your profile, sync watchlists, and keep your anime journey saved.
        </p>

        {/* Instant Hikari Sign-in Form */}
        <form onSubmit={handleCredentialsLogin} className="w-full space-y-4 text-left">
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Choose Avatar
            </label>
            <div className="flex items-center justify-center gap-3">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  type="button"
                  key={av.id}
                  onClick={() => setSelectedAvatar(av.src)}
                  className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all p-0.5 cursor-pointer ${
                    selectedAvatar === av.src
                      ? "border-cyan-500 ring-4 ring-cyan-500/20 scale-105"
                      : "border-slate-200 dark:border-slate-700 hover:border-cyan-400 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="w-full h-full relative rounded-full overflow-hidden">
                    <Image src={av.src} alt={av.name} fill className="object-cover" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Username / Display Name
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. HikariFan, Naruto2026..."
              maxLength={24}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-[#23283E] text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />
          </div>

          {/* Primary Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
          >
            <FaUser className="w-3.5 h-3.5" />
            <span>{loading ? "Signing in..." : "Sign In / Join Hikari"}</span>
          </button>
        </form>

        {/* Quick Options Divider */}
        <div className="w-full flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-slate-200 dark:bg-[#1E2235]"></div>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase">Or</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-[#1E2235]"></div>
        </div>

        {/* Alternative Login Actions */}
        <div className="w-full flex flex-col gap-2.5">
          {/* Quick 1-Click Login */}
          <button
            type="button"
            onClick={handleQuickLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#161926] dark:hover:bg-[#1E2338] text-slate-800 dark:text-slate-200 font-medium text-xs border border-slate-200 dark:border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FaPlay className="w-3 h-3 text-cyan-500" />
            <span>One-Click Quick Login</span>
          </button>

          {/* AniList OAuth Option */}
          <button
            type="button"
            onClick={() => signIn("AniListProvider")}
            className="w-full py-2.5 px-4 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-300 font-medium text-xs border border-sky-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RxExit className="w-3.5 h-3.5" />
            <span>Continue with AniList</span>
          </button>
        </div>

        {/* Return Links */}
        <div className="mt-5 flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/catalog" className="hover:text-cyan-500 transition-colors flex items-center gap-1">
            <FaCompass className="w-3 h-3" />
            <span>Catalog</span>
          </Link>
          <span>•</span>
          <Link href="/" className="hover:text-cyan-500 transition-colors flex items-center gap-1">
            <FaArrowLeft className="w-3 h-3" />
            <span>Home</span>
          </Link>
        </div>
      </div>

      {/* Guest Watch History / Continue Watching Preview */}
      {recentWatches.length > 0 && (
        <div className="max-w-4xl w-full mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
              Your Continue Watching
            </h2>
            <Link
              href="/continue-watching"
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              View All ({recentWatches.length})
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {recentWatches.slice(0, 3).map((item) => (
              <ContinueWatchingCard key={item.id} data={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

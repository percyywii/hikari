"use client";

import { FaUser } from "react-icons/fa6";
import { IoMdSettings } from "react-icons/io";
import { RxExit } from "react-icons/rx";
import { motion } from "framer-motion";
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";

const Dropdown = ({ data, isLoggedIn, onClose }) => {
  return (
    <motion.div
      className="bg-white/95 dark:bg-[#10121A]/95 backdrop-blur-2xl border border-slate-200 dark:border-[#1E2235] shadow-2xl shadow-black/20 absolute top-12 right-0 rounded-2xl min-w-56 max-w-[calc(100vw-1.5rem)] p-2 text-xs sm:text-sm z-50 text-slate-800 dark:text-slate-200 divide-y divide-slate-100 dark:divide-[#1E2235]/60"
      style={{ transformOrigin: "top right" }}
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.15 }}
    >
      {isLoggedIn ? (
        <>
          <div className="px-3 py-2.5">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">
              Signed in as
            </p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate mt-0.5">
              {data?.user?.name || "Anime Fan"}
            </p>
          </div>

          <div className="py-1">
            <Link
              href="/profile"
              onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1A1D2B] text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              <FaUser className="w-3.5 h-3.5" />
              <span>Profile</span>
            </Link>

            <Link
              href="/settings"
              onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1A1D2B] text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              <IoMdSettings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                if (onClose) onClose();
                signOut({ callbackUrl: "/" });
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer text-left"
            >
              <RxExit className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="px-3 py-2">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">
              Guest Mode
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-tight">
              Connect AniList to sync progress
            </p>
          </div>

          <div className="py-1 space-y-0.5">
            <button
              type="button"
              onClick={() => {
                if (onClose) onClose();
                signIn("AniListProvider");
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-semibold transition-colors cursor-pointer text-left"
            >
              <RxExit className="w-3.5 h-3.5" />
              <span>Sign In with AniList</span>
            </button>

            <Link
              href="/profile"
              onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1A1D2B] text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              <FaUser className="w-3.5 h-3.5" />
              <span>Profile</span>
            </Link>

            <Link
              href="/settings"
              onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1A1D2B] text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              <IoMdSettings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default Dropdown;
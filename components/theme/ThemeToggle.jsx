"use client";

import { useTheme } from "@/context/ThemeContext";
import { PiSunBold, PiMoonBold } from "react-icons/pi";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme, mounted } = useTheme();

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        type="button"
        className={`w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 bg-slate-800/40 border border-slate-700/50 ${className}`}
        aria-label="Toggle theme"
        disabled
      >
        <span className="w-4 h-4 rounded-full bg-slate-700 animate-pulse" />
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group cursor-pointer ${
        isDark
          ? "text-amber-300 hover:text-amber-200 bg-slate-800/60 hover:bg-slate-750 border border-amber-500/30 hover:border-amber-400/50 shadow-sm hover:shadow-amber-500/20"
          : "text-indigo-600 hover:text-indigo-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 shadow-sm hover:shadow-indigo-500/10"
      } ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110">
        {isDark ? (
          <PiSunBold className="w-5 h-5 transform transition-transform duration-500 rotate-0 text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.6)]" />
        ) : (
          <PiMoonBold className="w-5 h-5 transform transition-transform duration-500 -rotate-12 text-indigo-600 drop-shadow-[0_0_6px_rgba(99,102,241,0.4)]" />
        )}
      </div>
    </button>
  );
}

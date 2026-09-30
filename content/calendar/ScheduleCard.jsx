"use client";

import Image from "next/image";
import Link from "next/link";
import { FaClock, FaStar, FaPlay, FaCircle } from "react-icons/fa";
import { useMemo } from "react";

function formatCountdown(seconds) {
  if (seconds === undefined || seconds === null) return null;
  if (seconds <= 0) {
    const elapsed = Math.abs(seconds);
    if (elapsed < 3600) {
      const mins = Math.max(1, Math.floor(elapsed / 60));
      return { text: `Aired ${mins}m ago`, isLive: false, hasAired: true };
    }
    const hours = Math.floor(elapsed / 3600);
    if (hours < 24) {
      return { text: `Aired ${hours}h ago`, isLive: false, hasAired: true };
    }
    return { text: "Already Aired", isLive: false, hasAired: true };
  }

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return { text: `In ${days}d ${hours}h`, isLive: true, hasAired: false };
  }
  if (hours > 0) {
    return { text: `In ${hours}h ${mins}m`, isLive: true, hasAired: false };
  }
  return { text: `In ${mins}m`, isLive: true, hasAired: false };
}

export default function ScheduleCard({ item, nowTimestamp }) {
  const currentDiff = useMemo(() => {
    if (!item?.airingAt) return 0;
    return item.airingAt - nowTimestamp;
  }, [item?.airingAt, nowTimestamp]);

  const countdown = useMemo(() => formatCountdown(currentDiff), [currentDiff]);

  const title = item?.title || "Untitled Anime";
  const image = item?.image || "/placeholder.png";

  return (
    <div className="relative group rounded-2xl overflow-hidden border border-slate-200/90 dark:border-[#1E2235] bg-white dark:bg-[#12141F] hover:border-cyan-500/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      {/* Top Media Row */}
      <div className="flex gap-3.5 p-3.5 pb-2">
        {/* Cover Poster */}
        <Link
          href={`/watch/${item.id}`}
          className="relative shrink-0 w-24 h-34 sm:w-28 sm:h-40 rounded-xl overflow-hidden bg-slate-100 dark:bg-[#1A1D2B] border border-slate-200/80 dark:border-white/10 group-hover:scale-[1.02] transition-transform duration-300 shadow-sm"
        >
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100px, 120px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Format Badge */}
          {item.format && (
            <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[10px] font-bold text-white uppercase tracking-wider force-white">
              {item.format}
            </span>
          )}

          {/* Rating Badge */}
          {item.score && (
            <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[10px] font-bold text-amber-400 flex items-center gap-0.5 force-white">
              <FaStar className="w-2.5 h-2.5 text-amber-400" />
              <span>{item.score}</span>
            </span>
          )}
        </Link>

        {/* Info Column */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            {/* Countdown / Status Tag */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {countdown && (
                <span
                  className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    countdown.hasAired
                      ? "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                      : "bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30"
                  }`}
                >
                  <FaCircle
                    className={`w-1.5 h-1.5 ${
                      countdown.hasAired
                        ? "text-slate-400"
                        : "text-cyan-500 animate-pulse"
                    }`}
                  />
                  <span>{countdown.text}</span>
                </span>
              )}

              {item.episode && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25 text-[11px] font-bold">
                  EP {item.episode}
                </span>
              )}
            </div>

            {/* Anime Title */}
            <Link
              href={`/watch/${item.id}`}
              title={title}
              className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug font-['Outfit']"
            >
              {title}
            </Link>

            {/* Airing Local Time with Clock */}
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <FaClock className="w-3 h-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span>{item.localTime || "TBA"}</span>
              {item.localDateLabel && (
                <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                  • {item.localDateLabel}
                </span>
              )}
            </div>
          </div>

          {/* Studio & Genres */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 overflow-hidden text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {item.studio ? (
                <span className="truncate max-w-[110px] text-slate-700 dark:text-slate-300 font-semibold">
                  {item.studio}
                </span>
              ) : null}
              {item.studio && item.genres?.length > 0 ? <span>•</span> : null}
              {item.genres?.[0] ? <span>{item.genres[0]}</span> : null}
            </div>

            {/* Watch Link Button */}
            <Link
              href={`/watch/${item.id}`}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-sm hover:shadow transition-all active:scale-95 shrink-0"
            >
              <FaPlay className="w-2.5 h-2.5" />
              <span>Watch</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

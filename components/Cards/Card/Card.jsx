"use client";

import Image from "next/image";
import styles from "./Card.module.css";
import { useState, useRef } from "react";
import InfoWindow from "@/components/InfoWindow/InfoWindow";
import Link from "next/link";
import { FaStar } from "react-icons/fa";

const Card = ({ data, index, loading, hidden }) => {
  const [isHovered, setIsHovered] = useState({ hover: false, info: {} });
  const hoverTimerRef = useRef(null);

  const onMouseEnter = (e) => {
    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      const { clientX, clientY } = e;
      hoverTimerRef.current = setTimeout(() => {
        setIsHovered({ hover: true, info: { clientX, clientY } });
      }, 250);
    }
  };

  const onMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      setIsHovered({ hover: false, info: {} });
    }
  };

  const onInfoWindowMouseEnter = () => {
    setIsHovered((prev) => ({ ...prev, hover: true }));
  };

  const onInfoWindowMouseLeave = () => {
    setIsHovered((prev) => ({ ...prev, hover: false, info: {} }));
  };

  if (hidden) {
    return <div className="aspect-[2/3] mb-3 bg-transparent"></div>;
  }

  if (loading) {
    return (
      <div
        className="aspect-[2/3] rounded-xl mb-3 bg-[#131622] border border-[#1A1D2B] animate-pulse overflow-hidden"
        style={{ animationDelay: `${(index % 10) * 0.05}s` }}
      >
        <div className="w-full h-full bg-gradient-to-t from-[#0E1017] to-transparent"></div>
      </div>
    );
  }

  const title =
    data?.title?.english ||
    data?.title?.romaji ||
    data?.title?.userPreferred ||
    "Untitled Anime";

  const rating = data?.averageScore
    ? (data.averageScore / 10).toFixed(1)
    : data?.rating
    ? (data.rating / 10).toFixed(1)
    : null;

  const coverUrl =
    data?.coverImage?.extraLarge ||
    data?.coverImage?.large ||
    data?.image ||
    "/placeholder.png";

  const formatStatus = (s) => {
    if (!s) return null;
    if (s === "RELEASING") return "Airing";
    if (s === "FINISHED") return "Finished";
    if (s === "NOT_YET_RELEASED") return "Upcoming";
    return s;
  };

  return (
    <div className="flex flex-col mb-3 group relative select-none">
      <div
        className="aspect-[2/3] rounded-2xl overflow-hidden relative border border-slate-200/80 dark:border-[#1E2235] group-hover:border-cyan-500/60 shadow-sm hover:shadow-xl group-hover:scale-[1.02] transition-all duration-300 bg-slate-100 dark:bg-[#0E1017]"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Link href={`/watch/${data?.id}`} className="block w-full h-full relative">
          <Image
            src={coverUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

          {/* Top Score Badge */}
          {rating && (
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/10 flex items-center gap-1 text-[11px] font-semibold text-amber-400 shadow-md">
              <FaStar className="w-2.5 h-2.5 text-amber-400" />
              <span>{rating}</span>
            </div>
          )}

          {/* Bottom Card Meta */}
          <div className="absolute bottom-2 inset-x-2 flex items-center justify-between text-[11px] font-medium text-slate-300">
            <span className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-white/10 uppercase text-[10px] tracking-wider text-slate-300">
              {data?.format || "TV"}
            </span>

            {data?.status && (
              <span
                className={`px-1.5 py-0.5 rounded backdrop-blur-sm text-[10px] font-medium ${
                  data.status === "RELEASING"
                    ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
                    : "bg-black/70 text-slate-400 border border-white/10"
                }`}
              >
                {formatStatus(data.status)}
              </span>
            )}

            {data?.episodes ? (
              <span className="text-slate-400 text-[10px]">
                EP {data.episodes}
              </span>
            ) : null}
          </div>
        </Link>
      </div>

      {/* Title with Perfect High-Contrast Typography */}
      <Link
        href={`/watch/${data?.id}`}
        title={title}
        className="mt-2 text-xs sm:text-sm font-semibold font-['Outfit'] text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug px-0.5"
      >
        {title}
      </Link>

      {/* Info Window Portal on Hover */}
      {isHovered?.hover && (
        <InfoWindow
          info={data}
          hoverdata={isHovered?.info}
          onMouseEnter={onInfoWindowMouseEnter}
          onMouseLeave={onInfoWindowMouseLeave}
        />
      )}
    </div>
  );
};

export default Card;

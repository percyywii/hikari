"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getFormattedListsForProfile, calculateUserStatistics } from "@/utils/userListStorage";

const Banner = ({ info, data }) => {
  const [stats, setStats] = useState(() => {
    const base = info?.statistics?.anime || {};
    return {
      count: Number(base.count) || 0,
      episodesWatched: Number(base.episodesWatched) || 0,
      watchedAnime: Number(data?.entries?.length) || 0,
    };
  });

  useEffect(() => {
    const updateBannerStats = () => {
      const lists = getFormattedListsForProfile([]);
      const calc = calculateUserStatistics(lists);
      const base = info?.statistics?.anime || {};

      setStats({
        count: Math.max(Number(base.count) || 0, calc.totalAnimes),
        episodesWatched: Math.max(Number(base.episodesWatched) || 0, calc.episodesWatched),
        watchedAnime: Math.max(Number(data?.entries?.length) || 0, calc.completedCount),
      });
    };

    updateBannerStats();
    window.addEventListener("hikari_lists_updated", updateBannerStats);
    window.addEventListener("storage", updateBannerStats);
    return () => {
      window.removeEventListener("hikari_lists_updated", updateBannerStats);
      window.removeEventListener("storage", updateBannerStats);
    };
  }, [info, data]);

  return (
    <div className="relative after:bg-[linear-gradient(360deg,#000000a6,transparent)] after:content-[''] after:w-full after:h-56 after:bottom-0 after:absolute">
      <div className="relative w-full h-[21rem] border-b border-[#181821]">
        <Image
          src={info?.bannerImage || "/images/banner.jpg"}
          alt="banner"
          loading="eager"
          priority={true}
          quality={100}
          fill
          className="object-cover"
        />
      </div>

      <div className="absolute bottom-0 right-1/2 translate-x-1/2 z-10 w-full max-w-xl px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-28 h-28 border-4 border-cyan-500/40 rounded-full overflow-hidden shadow-2xl bg-[#12111a]">
            <Image
              src={info?.avatar?.large || info?.avatar || "/images/artworks-Xhbx2TzxHzrllTQR-kmD5OQ-t500x500.jpg"}
              alt="profile"
              fill
              className="object-cover"
            />
          </div>
          <div className="font-['Outfit'] text-white text-2xl sm:text-3xl font-bold tracking-tight text-center">
            {info?.name || "Hikari Member"}
          </div>
        </div>

        <div className="text-slate-100 flex justify-center gap-8 sm:gap-14 mt-3 mb-6">
          <div className="flex flex-col items-center">
            <div className="font-bold text-lg text-white">{stats.watchedAnime}</div>
            <div className="font-['Outfit'] text-xs sm:text-sm font-medium text-cyan-400 text-center">
              Anime Watched
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="font-bold text-lg text-white">{stats.episodesWatched}</div>
            <div className="font-['Outfit'] text-xs sm:text-sm font-medium text-cyan-400 text-center">
              Episodes Watched
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="font-bold text-lg text-white">{stats.count}</div>
            <div className="font-['Outfit'] text-xs sm:text-sm font-medium text-cyan-400 text-center">
              Total Anime
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
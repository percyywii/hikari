"use client";

import Image from "next/image";
import { useState } from "react";
import { IoStar, IoStarHalf, IoStarOutline } from "react-icons/io5";

const Rating = ({ info }) => {
  const [hoverIndex, setHoverIndex] = useState(0);

  return (
    <div className="flex items-center mt-2 relative max-[1240px]:hidden">
      <Image
        src="/images/waifus/2.png"
        alt="logo"
        width={200}
        height={300}
        className="object-cover absolute -top-20 -z-1 left-1/2 -translate-x-1/2 pointer-events-none"
      />

      <div className="bg-white dark:bg-[#22212c] border border-slate-200 dark:border-[#39374b] rounded-2xl h-max p-4 flex flex-col items-center justify-center w-max relative z-10 shadow-xl transition-colors">
        <div className="flex items-baseline gap-2">
          <span className="text-pink-600 dark:text-[#c7799f] text-2xl font-bold">
            {info?.averageScore ? (info.averageScore / 10).toFixed(1) : "N/A"}/10
          </span>
          <span className="text-slate-500 dark:text-[#717480] text-xs font-semibold">
            {info?.popularity || 0} reviews
          </span>
        </div>

        <div
          className="flex items-center bg-slate-100 dark:bg-[#333145] gap-1.5 text-[24px] rounded-xl px-3 py-1.5 mt-3 text-amber-400 cursor-pointer shadow-inner"
          onMouseMove={(e) => {
            if (e.target.closest("svg")) {
              const rect = e.target.getBoundingClientRect();
              const mouseX = e.clientX - rect.left;
              const starIndex = Array.from(e.currentTarget.children).indexOf(
                e.target.closest("svg")
              );
              const isHalf = mouseX < rect.width / 2;
              setHoverIndex(starIndex + (isHalf ? 0.5 : 1));
            }
          }}
          onMouseLeave={() => setHoverIndex(0)}
        >
          {Array.from({ length: 5 }).map((_, i) =>
            i + 1 <= hoverIndex ? (
              <IoStar key={i} />
            ) : i + 0.5 === hoverIndex ? (
              <IoStarHalf key={i} />
            ) : (
              <IoStarOutline key={i} className="text-slate-300 dark:text-slate-600" />
            )
          )}
        </div>

        <div className="mt-2.5 text-slate-500 dark:text-[#858792] font-['Outfit'] text-xs font-medium">
          Rate this anime
        </div>
      </div>
    </div>
  );
};

export default Rating;
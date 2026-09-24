"use client";

import { useCallback } from "react";
import { useWatchContext } from "@/context/Watch";
import clsx from "clsx";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FaPlay, FaCheck } from "react-icons/fa";

const EpisodeCard = ({ info, currentEp, loading, watchedEP, showType }) => {
  const { setEpisode, AnimeInfo } = useWatchContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = useCallback(() => {
    if (info?.playable === false || info?.isUpcoming) return;

    const updateSortInUrl = (episodeNumber) => {
      const updatedParams = new URLSearchParams(searchParams);
      if (episodeNumber) {
        updatedParams.set("ep", episodeNumber);
      } else {
        updatedParams.delete("ep");
      }

      const newUrl = `${window.location.pathname}${updatedParams.toString() ? `?${updatedParams}` : ""}`;
      router.push(newUrl, { scroll: false });
    };

    if (info?.number) {
      setEpisode(info.number);
      updateSortInUrl(info.number);
    }
  }, [info?.number, info?.playable, info?.isUpcoming, setEpisode, searchParams, router]);

  if (loading) {
    return (
      <div
        className={clsx(
          "flex py-2 h-[96px] my-[3px] border border-[#1A1D2B] rounded-lg bg-[#10121A] animate-pulse relative overflow-hidden",
          { "w-full !h-10 bg-[#161926] my-0": showType === "grid" }
        )}
      >
        <div className="flex gap-3 w-full p-2">
          <div
            className={clsx("h-[80px] min-w-[130px] bg-[#1E2338] rounded-md", {
              "h-full min-w-full flex items-center justify-center": showType === "grid",
            })}
          ></div>
          {showType !== "grid" && (
            <div className="w-full flex flex-col gap-2 justify-center">
              <div className="h-4 w-3/4 bg-[#1E2338] rounded"></div>
              <div className="h-3 w-1/3 bg-[#1A1E2E] rounded"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const isCurrentEpisode = currentEp === info?.number;
  const isWatched = watchedEP?.includes(info?.number);
  const isUpcoming = info?.isUpcoming || info?.playable === false;

  return (
    <div
      className={clsx(
        "flex gap-3 py-2 border rounded-xl transition-all duration-150 group select-none",
        {
          // Active episode
          "bg-cyan-500/10 dark:bg-[#0E1B2E] border-cyan-500/70 shadow-sm shadow-cyan-500/10 text-cyan-700 dark:text-cyan-200":
            isCurrentEpisode,
          // Watched episode
          "bg-slate-50 dark:bg-[#11131C] border-slate-200 dark:border-[#1C2030] text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600":
            isWatched && !isCurrentEpisode,
          // Unwatched regular episode
          "bg-white dark:bg-[#141724] border-slate-200/90 dark:border-[#1E2235] text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1A1E30] hover:border-cyan-500/40":
            !isCurrentEpisode && !isWatched && !isUpcoming,
          // Upcoming / unreleased
          "bg-slate-100 dark:bg-[#0F1118] border-slate-200 dark:border-[#181B26] text-slate-400 dark:text-slate-500 opacity-60 cursor-not-allowed":
            isUpcoming,
          // Cursor
          "cursor-pointer": !isUpcoming,
          // Layout modes
          "w-full h-10 text-center py-0 flex items-center justify-center font-medium text-xs":
            showType === "grid",
          "px-3 border-slate-200 dark:border-[#1E2235]": showType === "compact_list",
        }
      )}
      onClick={handleClick}
      title={
        showType !== "list"
          ? info?.title ||
            AnimeInfo?.title?.english ||
            AnimeInfo?.title?.romaji ||
            `Episode ${info?.number}`
          : ""
      }
    >
      {/* List thumbnail */}
      {showType === "list" && (
        <div className="w-full max-w-[130px] relative shrink-0">
          <Image
            src={info?.image || AnimeInfo?.coverImage?.large || "/placeholder.png"}
            alt={`Episode ${info?.number}`}
            width={130}
            height={74}
            className="object-cover w-full h-[74px] rounded-lg bg-slate-100 dark:bg-[#161926]"
          />
          {isCurrentEpisode && (
            <div className="absolute inset-0 bg-cyan-950/60 rounded-lg flex items-center justify-center">
              <span className="p-2 rounded-full bg-cyan-500 text-black shadow-lg shadow-cyan-500/50">
                <FaPlay className="w-2.5 h-2.5 ml-0.5" />
              </span>
            </div>
          )}
          {isWatched && !isCurrentEpisode && (
            <div className="text-[11px] absolute bottom-1 left-1 bg-black/80 text-emerald-400 px-1.5 py-0.5 rounded flex items-center gap-1 font-medium">
              <FaCheck className="w-2 h-2" /> Watched
            </div>
          )}
          <div className="text-slate-300 absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[11px] font-mono">
            {info?.duration ? `${info.duration}m` : "24m"}
          </div>
        </div>
      )}

      {/* Episode Details */}
      <div className="w-full pr-2 flex flex-col justify-center min-w-0">
        {showType !== "grid" && (
          <div
            className={clsx(
              "break-words overflow-hidden text-ellipsis line-clamp-1 font-['Outfit'] text-xs sm:text-sm font-semibold",
              isCurrentEpisode
                ? "text-cyan-600 dark:text-cyan-300"
                : "text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400"
            )}
          >
            {info?.title || AnimeInfo?.title?.english || AnimeInfo?.title?.romaji || `Episode ${info?.number}`}
          </div>
        )}

        <div className="flex items-center gap-2 mt-0.5 text-xs">
          <span className={isCurrentEpisode ? "text-cyan-400 font-semibold" : "text-slate-400"}>
            {showType !== "grid" && "Episode"} {info?.number}
          </span>

          {isCurrentEpisode && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium">
              Playing
            </span>
          )}

          {isUpcoming && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
              Upcoming
            </span>
          )}

          {isWatched && !isCurrentEpisode && showType === "grid" && (
            <span className="text-[10px] text-emerald-400 font-bold">✓</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EpisodeCard;

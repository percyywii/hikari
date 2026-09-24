"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LuExpand } from "react-icons/lu";
import { FaForward, FaLightbulb } from "react-icons/fa6";
import { FaBackward } from "react-icons/fa";
import { useWatchSettingContext } from "@/context/WatchSetting";
import { useWatchContext } from "@/context/Watch";
import { BiCollapse } from "react-icons/bi";
import AddToList from "@/components/AddToList";

const Option = () => {
  const { setWatchSetting, watchSetting } = useWatchSettingContext();
  const { episode, setEpisode, episodes } = useWatchContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalEpisodes = Array.isArray(episodes) ? episodes.length : null;

  const navigateEpisode = useCallback(
    (newEp) => {
      if (newEp < 1) return;
      if (totalEpisodes && newEp > totalEpisodes) return;
      setEpisode(newEp);

      const updatedParams = new URLSearchParams(searchParams);
      updatedParams.set("ep", newEp);
      const newUrl = `${window.location.pathname}?${updatedParams.toString()}`;
      router.push(newUrl, { scroll: false });
    },
    [totalEpisodes, setEpisode, searchParams, router]
  );

  return (
    <div className="flex justify-between items-center bg-white dark:bg-[#10121A] border-y border-slate-200 dark:border-[#1E2235] px-3 py-2 text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-[880px]:flex-col max-[880px]:gap-3 select-none transition-colors">
      <div className="flex items-center gap-4 sm:gap-6 max-[880px]:flex-wrap">
        <button
          type="button"
          className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          onClick={() => setWatchSetting((prev) => ({ ...prev, isExpanded: !prev.isExpanded }))}
        >
          <span>{watchSetting.isExpanded ? <BiCollapse className="w-4 h-4 text-cyan-500 dark:text-cyan-400" /> : <LuExpand className="w-4 h-4" />}</span>
          <span>{watchSetting.isExpanded ? "Collapse" : "Expand"}</span>
        </button>

        <button
          type="button"
          className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          onClick={() => setWatchSetting((prev) => ({ ...prev, light: !prev.light }))}
        >
          <FaLightbulb className={watchSetting.light ? "text-amber-500 dark:text-amber-400" : "text-slate-400"} />
          <span>Light</span>
          <span className={watchSetting.light ? "text-amber-600 dark:text-amber-400 font-semibold" : "text-slate-400 dark:text-slate-500"}>
            {watchSetting.light ? "On" : "Off"}
          </span>
        </button>

        <button
          type="button"
          className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          onClick={() => setWatchSetting((prev) => ({ ...prev, autoPlay: !prev.autoPlay }))}
        >
          <span>Auto Play</span>
          <span className={watchSetting.autoPlay ? "text-cyan-600 dark:text-cyan-400 font-semibold" : "text-slate-400 dark:text-slate-500"}>
            {watchSetting.autoPlay ? "On" : "Off"}
          </span>
        </button>

        <button
          type="button"
          className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          onClick={() => setWatchSetting((prev) => ({ ...prev, autoNext: !prev.autoNext }))}
        >
          <span>Auto Next</span>
          <span className={watchSetting.autoNext ? "text-cyan-600 dark:text-cyan-400 font-semibold" : "text-slate-400 dark:text-slate-500"}>
            {watchSetting.autoNext ? "On" : "Off"}
          </span>
        </button>

        <button
          type="button"
          className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          onClick={() => setWatchSetting((prev) => ({ ...prev, autoSkipIntro: !prev.autoSkipIntro }))}
        >
          <span>Auto Skip Intro</span>
          <span className={watchSetting.autoSkipIntro ? "text-cyan-600 dark:text-cyan-400 font-semibold" : "text-slate-400 dark:text-slate-500"}>
            {watchSetting.autoSkipIntro ? "On" : "Off"}
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          disabled={episode <= 1}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-[#1A1D2B] border border-slate-200 dark:border-[#2B3048] transition-colors ${
            episode <= 1
              ? "opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-500"
              : "hover:bg-slate-200 dark:hover:bg-[#252A3D] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          }`}
          onClick={() => navigateEpisode(episode - 1)}
        >
          <FaBackward className="w-3 h-3" />
          <span>Prev</span>
        </button>

        <button
          type="button"
          disabled={Boolean(totalEpisodes && episode >= totalEpisodes)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-[#1A1D2B] border border-slate-200 dark:border-[#2B3048] transition-colors ${
            Boolean(totalEpisodes && episode >= totalEpisodes)
              ? "opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-500"
              : "hover:bg-slate-200 dark:hover:bg-[#252A3D] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          }`}
          onClick={() => navigateEpisode(episode + 1)}
        >
          <span>Next</span>
          <FaForward className="w-3 h-3" />
        </button>

        <AddToList />
      </div>
    </div>
  );
};

export default Option;
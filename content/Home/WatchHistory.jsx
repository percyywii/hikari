"use client"
import { useEffect, useState } from "react";
import ContinueWatchingCard from "@/components/Cards/ContinueWatchingCard/ContinueWatchingCard";
import { FaArrowRight } from "react-icons/fa";
import { getWatchProgress } from "@/utils/GetProgress";

const WatchHistory = () => {
  const [mappedData, setMappedData] = useState([]);
  const [showContinueWatching, setShowContinueWatching] = useState(false)

  useEffect(() => {
    const localSetting = JSON.parse(localStorage.getItem("setting.Hikari") || localStorage.getItem("setting.Tenro") || localStorage.getItem("setting.Taro") || "{}")
    if (localSetting?.appearence?.continueWatchingSection !== false) {
      setShowContinueWatching(true)
    }

    const data = getWatchProgress()

    if (data) {
      setMappedData(data);
    }
  }, []);


  return showContinueWatching ? mappedData.length < 1 ? null : (
    <div className="w-full max-w-[96rem] relative mx-5 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-6 rounded-full bg-cyan-500"></span>
          <h2 className="text-slate-900 dark:text-slate-100 font-bold text-2xl sm:text-3xl font-['Outfit'] tracking-tight">
            Continue Watching
          </h2>
        </div>

        <div className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm font-semibold transition-colors">
          <span>See All</span>
          <FaArrowRight className="w-3 h-3" />
        </div>
      </div>

      <div className="mb-20 grid grid-cols-[repeat(auto-fit,minmax(343px,1fr))] max-[725px]:grid-cols-[repeat(auto-fit,minmax(285px,1fr))] gap-4">
        {mappedData.map((data) => (
          <ContinueWatchingCard key={data.id} data={data} />
        ))}

        {mappedData?.length < 4
          ? Array.from({ length: 4 - mappedData?.length }).map((i, _) => (
              <ContinueWatchingCard key={_} hidden />
            ))
          : null}
      </div>
    </div>
  ) : null;
}

export default WatchHistory;

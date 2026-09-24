"use client";
import { LuClock3 } from "react-icons/lu";
import { HiOutlineDesktopComputer } from "react-icons/hi";
import { IoCalendarClearOutline } from "react-icons/io5";
import { MdDeleteOutline } from "react-icons/md";
import { useMemo } from "react";

const Categorys = ({ user, lists }) => {
  const safeLists = Array.isArray(lists) ? lists : [];
  const watchingAnime = safeLists.find((item) => item?.status === "CURRENT") || null;
  const droppedAnime = safeLists.find((item) => item?.status === "DROPPED") || null;

  const animesWatchedThisMonth = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1;
    const entries = Array.isArray(watchingAnime?.entries) ? watchingAnime.entries : [];
    return entries.filter((item) => item?.startedAt?.month === currentMonth);
  }, [watchingAnime]);

  const episodesWatched = Number(user?.statistics?.anime?.episodesWatched) || 0;
  const minutesWatched =
    Number(user?.statistics?.anime?.minutesWatched) || episodesWatched * 24;
  const droppedCount = Array.isArray(droppedAnime?.entries) ? droppedAnime.entries.length : 0;

  return (
    <div className="flex justify-center gap-6 flex-wrap">
      <div className="w-64 h-44 max-[535px]:mr-24 max-[535px]:mt-4 rounded-2xl border border-pink-500/20 bg-pink-500/5 flex flex-col justify-between items-center text-white py-6 transition-all hover:bg-pink-500/10 hover:shadow-[0px_0px_20px_2px_rgba(244,133,176,0.3)] group">
        <div className="text-pink-400 font-['poppins'] text-[14px] font-semibold tracking-wider">
          TOTAL MINUTES
        </div>
        <div className="relative text-4xl text-rose-500">
          <LuClock3 />
        </div>
        <div className="font-['poppins'] font-bold text-rose-400 text-lg">
          {minutesWatched.toLocaleString()} min
        </div>
      </div>

      <div className="w-64 h-44 min-[535px]:mt-6 max-[535px]:ml-24 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-between items-center text-white py-6 transition-all hover:bg-emerald-500/10 hover:shadow-[0px_0px_20px_2px_rgba(50,179,163,0.3)] group">
        <div className="text-emerald-400 font-['poppins'] text-[14px] font-semibold tracking-wider">
          WATCHED EPISODES
        </div>
        <div className="relative text-4xl text-teal-400">
          <HiOutlineDesktopComputer />
        </div>
        <div className="font-['poppins'] font-bold text-emerald-300 text-lg">
          {episodesWatched} eps
        </div>
      </div>

      <div className="w-64 h-44 max-[535px]:mr-24 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex flex-col justify-between items-center text-white py-6 transition-all hover:bg-amber-500/10 hover:shadow-[0px_0px_20px_2px_rgba(255,102,31,0.3)] group">
        <div className="text-amber-400 font-['poppins'] text-[14px] font-semibold tracking-wider">
          WATCHED THIS MONTH
        </div>
        <div className="relative text-4xl text-amber-500">
          <IoCalendarClearOutline />
        </div>
        <div className="font-['poppins'] font-bold text-amber-300 text-lg">
          {animesWatchedThisMonth.length} anime
        </div>
      </div>

      <div className="w-64 h-44 min-[535px]:mt-6 max-[535px]:ml-24 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 flex flex-col justify-between items-center text-white py-6 transition-all hover:bg-cyan-500/10 hover:shadow-[0px_0px_20px_2px_rgba(46,130,207,0.3)] group">
        <div className="text-cyan-400 font-['poppins'] text-[14px] font-semibold tracking-wider">
          TOTAL DROPPED
        </div>
        <div className="relative text-4xl text-cyan-400">
          <MdDeleteOutline />
        </div>
        <div className="font-['poppins'] font-bold text-cyan-300 text-lg">
          {droppedCount} anime
        </div>
      </div>
    </div>
  );
};

export default Categorys;
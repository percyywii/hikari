"use client";

import { HiOutlineBars3 } from "react-icons/hi2";
import { LuLayoutGrid } from "react-icons/lu";
import { CiBoxList } from "react-icons/ci";
import { FiSearch } from "react-icons/fi";
import { useEffect } from "react";

export const allepisodelayout = [
  {
    title: "list",
    icon: <HiOutlineBars3 className="w-5 h-5" />,
    label: "Detailed List",
  },
  {
    title: "compact_list",
    icon: <CiBoxList className="w-5 h-5" />,
    label: "Compact List",
  },
  {
    title: "grid",
    icon: <LuLayoutGrid className="w-5 h-5" />,
    label: "Grid",
  },
];

const SearchBar = ({ searchQuery, handleSearchQueryChange, setShowType, showType }) => {
  useEffect(() => {
    if (!allepisodelayout.length) return;
    const storedType = localStorage.getItem("episode_list_type");
    const foundIndex = allepisodelayout.findIndex((item) => item.title === storedType);
    let currentIndex = foundIndex !== -1 ? foundIndex : allepisodelayout.findIndex((item) => item.title === showType);
    if (currentIndex === -1) return;
    const currentIndexTitle = allepisodelayout[currentIndex].title;
    localStorage.setItem("episode_list_type", currentIndexTitle);
    setShowType(currentIndexTitle);
  }, []);

  const switchbetweenlayoutClick = () => {
    let currentIndex = localStorage.getItem("episode_list_type")
      ? allepisodelayout.findIndex((item) => item.title === localStorage.getItem("episode_list_type"))
      : allepisodelayout.findIndex((item) => item.title === showType);

    let nextIndex = currentIndex + 1 >= allepisodelayout.length ? 0 : currentIndex + 1;
    let nextIndexTitle = allepisodelayout[nextIndex].title;

    localStorage.setItem("episode_list_type", nextIndexTitle);
    setShowType(nextIndexTitle);
  };

  const currentLayout = allepisodelayout.find((item) => item.title === showType) || allepisodelayout[0];

  return (
    <div className="flex items-center justify-between px-3 py-3 border-b border-slate-200/80 dark:border-[#1E2235] gap-2">
      <div className="relative flex-1 bg-slate-100 dark:bg-[#10121A] border border-slate-200 dark:border-[#1E2235] focus-within:border-cyan-500/60 rounded-xl h-9 flex items-center px-2.5 transition-colors">
        <FiSearch className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 mr-2 shrink-0" />
        <input
          type="text"
          placeholder="Filter episode..."
          className="bg-transparent outline-none h-full w-full text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
          value={searchQuery}
          onChange={handleSearchQueryChange}
          suppressHydrationWarning
        />
      </div>

      <button
        type="button"
        title={`View: ${currentLayout.label} (Click to switch)`}
        className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#161926] hover:bg-slate-200 dark:hover:bg-[#1E2338] border border-slate-200 dark:border-[#23283E] hover:border-cyan-500/40 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center justify-center transition-all cursor-pointer shrink-0"
        onClick={switchbetweenlayoutClick}
      >
        {currentLayout.icon}
      </button>
    </div>
  );
};

export default SearchBar;

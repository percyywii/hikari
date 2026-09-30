"use client"
import { LuEye } from "react-icons/lu"
import { FaRegBookmark } from "react-icons/fa6";
import { IoMdCheckmark } from "react-icons/io";
import { MdOutlineFrontHand } from "react-icons/md";
import { BiBullseye } from "react-icons/bi";
import { IoPersonOutline } from "react-icons/io5";
import clsx from "clsx";
import { useMemo } from "react";

const CategorySelector = ({ active, setActive, data }) => {

  const statusMap = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    return list.reduce((acc, item) => {
      if (item && item.status) {
        acc[item.status] = (item.entries || []).length;
      }
      return acc;
    }, {});
  }, [data]);

  // Memoize the categorys array
  const categorys = useMemo(() => [
    {
      title: "Watching",
      id: "CURRENT",
      icon: <LuEye />,
      number: statusMap['CURRENT'] || 0,
    },
    {
      title: "To Watch",
      id: "PLANNING",
      icon: <FaRegBookmark />,
      number: statusMap['PLANNING'] || 0,
    },
    {
      title: "Watched",
      id: "COMPLETED",
      icon: <IoMdCheckmark />,
      number: statusMap['COMPLETED'] || 0,
    },
    {
      title: "On Hold",
      id: "PAUSED",
      icon: <MdOutlineFrontHand />,
      number: statusMap['PAUSED'] || 0,
    },
    {
      title: "Dropped",
      id: "DROPPED",
      icon: <BiBullseye />,
      number: statusMap['DROPPED'] || 0,
    },
    {
      title: "Statistics",
      id: "STATISTICS",
      icon: <IoPersonOutline />
    }
  ], [statusMap]);

  return (
    <div className="relative w-full min-[762px]:h-14 border-b border-slate-200 dark:border-[#23253274] text-slate-700 dark:text-slate-300 z-10">
      <div className="flex items-center justify-center h-full gap-2 max-[762px]:flex-wrap">
        {categorys.map((item, index) => {
          const isActive = categorys.find((c) => c?.id === active)?.title === item?.title;
          return (
            <div
              key={index}
              className={clsx(
                "relative flex gap-1.5 items-center cursor-pointer px-3 py-3.5 justify-center text-sm font-semibold transition-all select-none",
                isActive
                  ? "text-cyan-600 dark:text-cyan-400 after:bg-cyan-500 after:w-full after:h-[3px] after:rounded-full after:absolute after:bottom-0"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white after:bg-cyan-500/50 after:hover:w-full after:h-[3px] after:rounded-full after:absolute after:bottom-0 after:w-0 after:transition-all"
              )}
              onClick={() => setActive(item?.id)}
            >
              <div className="text-lg">{item?.icon}</div>
              <div>{item?.title}</div>
              {item?.number !== undefined && (
                <span className="text-xs px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-[#1A1D2B] text-slate-600 dark:text-slate-400 font-normal">
                  {item.number}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CategorySelector
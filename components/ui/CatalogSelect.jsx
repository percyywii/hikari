/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

const CatalogSelect = ({ data, setSortBy, active, setActive }) => {
  const [isOpened, setIsOpened] = useState(false);

  useEffect(() => {
    setSortBy(data.find((item) => item?.value === active));
  }, [active]);

  return (
    <div className="w-full relative select-none">
      <div
        className="bg-slate-100 dark:bg-[#161926] border border-slate-200 dark:border-[#23283E] text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold font-['Outfit'] rounded-xl py-2 px-3 flex items-center justify-between gap-2 shadow-xs cursor-pointer hover:border-cyan-500/50 transition-colors"
        onClick={() => setIsOpened((prev) => !prev)}
      >
        <span className="truncate">{active}</span>
        <span className="text-slate-400">
          <IoIosArrowDown />
        </span>
      </div>

      {isOpened ? (
        <div className="bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#23283E] shadow-xl text-slate-800 dark:text-slate-200 rounded-xl mt-1.5 p-1 absolute z-30 w-full overflow-hidden text-xs sm:text-sm font-['Outfit']">
          {data?.map((item) => (
            <div
              key={item?.value}
              className={clsx(
                "hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg py-2 px-3 cursor-pointer transition-colors font-medium text-left",
                {
                  "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-semibold":
                    active === item?.value,
                }
              )}
              onClick={() => {
                setActive(item?.value);
                setIsOpened(false);
              }}
            >
              {item?.value}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default CatalogSelect;
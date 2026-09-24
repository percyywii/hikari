"use client";

import { useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const Year = () => {
  const [isOpened, setIsOpened] = useState(true);

  return (
    <div>
      <div
        className="flex justify-between items-center cursor-pointer border-b border-slate-200 dark:border-[#1E2235] pb-2 mt-4 select-none"
        onClick={() => setIsOpened((prev) => !prev)}
      >
        <div className="text-slate-900 dark:text-slate-100 font-semibold font-['Outfit'] text-sm">
          Release Window
        </div>
        <div className="text-slate-400">
          {isOpened ? <IoIosArrowUp /> : <IoIosArrowDown />}
        </div>
      </div>

      {isOpened ? (
        <div className="mt-3 px-1 flex items-center justify-center gap-2">
          <div className="bg-slate-100 dark:bg-[#161926] border border-slate-200 dark:border-[#23283E] px-4 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 font-medium text-xs">
            2010
          </div>
          <div className="w-8 bg-slate-300 dark:bg-[#2c3144] h-[2px]"></div>
          <div className="bg-slate-100 dark:bg-[#161926] border border-slate-200 dark:border-[#23283E] px-4 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 font-medium text-xs">
            2025
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Year;
"use client";

import clsx from "clsx";
import { useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const Dropdown = ({ data, checkBoxItem, setCheckBoxItem }) => {
  const dropdownItems = ["All", ...data];
  const [isOpened, setIsOpened] = useState(false);

  return (
    <div className="relative w-full select-none">
      <div
        className="bg-slate-100 dark:bg-[#161926] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#23283E] px-3 py-2 w-full rounded-xl cursor-pointer flex justify-between items-center text-sm font-medium transition-colors hover:border-cyan-500/50 shadow-xs"
        onClick={() => setIsOpened((prev) => !prev)}
      >
        <div className="truncate font-['Outfit']">
          {checkBoxItem === "" ? dropdownItems[0] : checkBoxItem}
        </div>
        <div className="text-slate-400">
          {isOpened ? <IoIosArrowUp /> : <IoIosArrowDown />}
        </div>
      </div>

      {isOpened ? (
        <div className="bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#23283E] shadow-xl text-slate-800 dark:text-slate-200 flex flex-col mt-1.5 rounded-xl absolute z-30 w-full overflow-hidden text-sm font-['Outfit']">
          {dropdownItems?.map((item) => (
            <div
              key={item}
              className={clsx(
                "hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 py-2 px-3 cursor-pointer transition-colors text-xs sm:text-sm",
                {
                  "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-semibold":
                    (checkBoxItem === "" ? "All" : checkBoxItem) === item,
                }
              )}
              onClick={() => {
                setCheckBoxItem(item === "All" ? "" : item);
                setIsOpened(false);
              }}
            >
              {item}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default Dropdown;
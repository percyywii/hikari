"use client";

import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import Dropdown from "../components/Dropdown";
import { useState } from "react";

const AiringStatus = ({ airingStatus: checkBoxItem, setAiringStatus: setCheckBoxItem }) => {
  const [isOpened, setIsOpened] = useState(true);

  const airings = [
    "Airing",
    "Finished",
    "Not Yet Aired",
    "Cancelled",
  ];

  return (
    <div>
      <div
        className="flex justify-between items-center cursor-pointer border-b border-slate-200 dark:border-[#1E2235] pb-2 mt-4 select-none"
        onClick={() => setIsOpened((prev) => !prev)}
      >
        <div className="text-slate-900 dark:text-slate-100 font-semibold font-['Outfit'] text-sm">
          Airing Status
        </div>
        <div className="text-slate-400">
          {isOpened ? <IoIosArrowUp /> : <IoIosArrowDown />}
        </div>
      </div>

      {isOpened ? (
        <div className="mt-3 px-1 flex flex-col gap-2">
          <Dropdown data={airings} checkBoxItem={checkBoxItem} setCheckBoxItem={setCheckBoxItem} />
        </div>
      ) : null}
    </div>
  );
};

export default AiringStatus;
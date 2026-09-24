"use client";

import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import Checkbox from "../components/Checkbox";
import { useState } from "react";

const Season = ({ season: checkBoxItem, setSeason: setCheckBoxItem }) => {
  const [isOpened, setIsOpened] = useState(true);

  return (
    <div>
      <div
        className="flex justify-between items-center cursor-pointer border-b border-slate-200 dark:border-[#1E2235] pb-2 mt-4 select-none"
        onClick={() => setIsOpened((prev) => !prev)}
      >
        <div className="text-slate-900 dark:text-slate-100 font-semibold font-['Outfit'] text-sm">
          Season
        </div>
        <div className="text-slate-400">
          {isOpened ? <IoIosArrowUp /> : <IoIosArrowDown />}
        </div>
      </div>

      {isOpened ? (
        <div className="mt-3 px-1 flex flex-col gap-2">
          <Checkbox title={"Winter"} checkBoxItem={checkBoxItem} setCheckBoxItem={setCheckBoxItem} />
          <Checkbox title={"Spring"} checkBoxItem={checkBoxItem} setCheckBoxItem={setCheckBoxItem} />
          <Checkbox title={"Summer"} checkBoxItem={checkBoxItem} setCheckBoxItem={setCheckBoxItem} />
          <Checkbox title={"Fall"} checkBoxItem={checkBoxItem} setCheckBoxItem={setCheckBoxItem} />
        </div>
      ) : null}
    </div>
  );
};

export default Season;
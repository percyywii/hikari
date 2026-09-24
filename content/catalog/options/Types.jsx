"use client";

import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import Checkbox from "../components/Checkbox";
import { Fragment, useState } from "react";

const Types = ({ type, setType }) => {
  const [isOpened, setIsOpened] = useState(true);

  const types = ["TV", "OVA", "Movies", "Special", "ONA", "Music"];

  return (
    <div>
      <div
        className="flex justify-between items-center cursor-pointer border-b border-slate-200 dark:border-[#1E2235] pb-2 mt-4 select-none"
        onClick={() => setIsOpened((prev) => !prev)}
      >
        <div className="text-slate-900 dark:text-slate-100 font-semibold font-['Outfit'] text-sm">
          Format
        </div>
        <div className="text-slate-400">
          {isOpened ? <IoIosArrowUp /> : <IoIosArrowDown />}
        </div>
      </div>

      {isOpened ? (
        <div className="mt-3 px-1 flex gap-8">
          <div className="flex flex-col gap-2">
            {types.slice(0, 3)?.map((item) => (
              <Fragment key={item}>
                <Checkbox
                  title={item}
                  checkBoxItem={type}
                  setCheckBoxItem={setType}
                />
              </Fragment>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {types.slice(3)?.map((item) => (
              <Fragment key={item}>
                <Checkbox
                  title={item}
                  checkBoxItem={type}
                  setCheckBoxItem={setType}
                />
              </Fragment>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Types;
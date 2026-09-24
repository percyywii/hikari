/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useEffect, useState } from "react"
import { IoIosArrowDown } from "react-icons/io";

const Select = ({ data, defaultValue, setSelected }) => {
  const [isOpened, setisOpened] = useState({ opened: false, id: defaultValue })

  const onitemClick = (id) => {
    setisOpened({ id: id, opened: false })
  }

  useEffect(() => {
    setSelected({ id: isOpened.id, value: data[isOpened.id] })
  }, [isOpened.id])


  return (
    <div className="w-full relative select-none">
      <div
        className="relative text-xs sm:text-sm bg-slate-100 dark:bg-[#1A1D2B] text-slate-800 dark:text-slate-200 cursor-pointer w-full px-4 font-['Outfit'] font-semibold rounded-xl py-2 border border-slate-200 dark:border-[#2B3048] hover:border-cyan-500/50 flex items-center justify-between gap-2 shadow-sm transition-all"
        onClick={() => setisOpened({ ...isOpened, opened: !isOpened?.opened })}
      >
        <span className="truncate">{data[isOpened?.id] ? data[isOpened?.id] : "1 - 80"}</span>
        <span className="text-slate-400"><IoIosArrowDown /></span>
      </div>

      {isOpened?.opened ? (
        <div className="bg-white/95 dark:bg-[#141724]/95 p-1 rounded-xl mt-1.5 flex flex-col gap-1 absolute z-30 backdrop-blur-xl w-full border border-slate-200 dark:border-[#2B3048] shadow-2xl max-h-48 overflow-y-auto">
          {data?.map((item, index) => (
            <div
              key={index}
              className={`hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 cursor-pointer rounded-lg h-8 px-2 flex items-center text-xs font-medium transition-colors ${
                isOpened?.id === index || (index === defaultValue && !isOpened?.id)
                  ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-semibold"
                  : "text-slate-700 dark:text-slate-300"
              }`}
              onClick={() => onitemClick(index)}
            >
              {item}
            </div>
          ))}

          {data.length < 1 && (
            <div className="text-center text-slate-400 text-xs py-2">No Episode Found</div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default Select
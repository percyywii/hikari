"use client";
import { LuAlignLeft, LuX } from "react-icons/lu";
import Links from "./Links";
import { useState } from "react";

const Responsive = () => {
  const [isModelOpened, setIsModelOpened] = useState(false);

  return (
    <div className="flex min-[990px]:hidden">
      <button
        type="button"
        aria-label="Toggle navigation menu"
        className="text-2xl text-slate-800 dark:text-white flex items-center justify-center p-1 mr-2 cursor-pointer hover:text-cyan-500 transition-colors"
        onClick={() => setIsModelOpened(!isModelOpened)}
      >
        {isModelOpened ? <LuX /> : <LuAlignLeft />}
      </button>

      {isModelOpened ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs"
            onClick={() => setIsModelOpened(false)}
          />
          <div className="w-52 bg-white/95 dark:bg-[#12141F]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 absolute top-16 left-3 rounded-xl shadow-2xl z-50 p-1">
            <Links isMobile onClose={() => setIsModelOpened(false)} />
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Responsive;
"use client";

import ProfileCard from "@/components/Cards/ProfileCard/ProfileCard";
import { motion } from "framer-motion";
import { Fragment, useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaArrowRight, FaBookmark, FaCompass } from "react-icons/fa6";
import Link from "next/link";

const Animes = ({ data, activeStatus = "CURRENT" }) => {
  const [page, setPage] = useState(0);

  const SplitedAnimes = useMemo(() => {
    const animes = data?.entries || [];
    if (!animes.length) return [];
    const chunkSize = 18;
    return animes.reduce((chunks, _, i) => {
      if (i % chunkSize === 0) {
        chunks.push(animes.slice(i, i + chunkSize));
      }
      return chunks;
    }, []);
  }, [data]);

  useEffect(() => {
    // Reset page to 0 when data changes
    setPage(0);
  }, [data]);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { staggerChildren: 0.05 } },
  };

  const handlePreviousPage = () => setPage((prev) => Math.max(prev - 1, 0));
  const handleNextPage = () => setPage((prev) => Math.min(prev + 1, SplitedAnimes.length - 1));

  if (!SplitedAnimes.length) {
    const statusTitles = {
      CURRENT: "Watching",
      PLANNING: "To Watch",
      COMPLETED: "Watched",
      PAUSED: "On Hold",
      DROPPED: "Dropped",
    };
    const title = statusTitles[activeStatus] || "this list";

    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-2xl mb-4 border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
          <FaBookmark className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-['Outfit']">
          No anime in {title} yet
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1.5 mb-6">
          Add anime from the watch page or catalog to keep track of your progress.
        </p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <FaCompass className="w-4 h-4" />
          <span>Explore Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <Fragment>
      <motion.div
        key={page}
        className="h-full mt-6 mx-24 grid grid-auto-fit gap-[8px_20px] max-[1080px]:mx-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {SplitedAnimes[page]?.map((anime, index) => (
          <ProfileCard key={anime?.id || anime?.media?.id || index} info={anime} />
        ))}

        {SplitedAnimes[page]?.length < 9 &&
          Array.from({ length: 9 - SplitedAnimes[page]?.length })?.map((_, i) => (
            <ProfileCard key={`placeholder-${i}`} hidden />
          ))}
      </motion.div>

      {SplitedAnimes.length > 1 && (
        <div className="text-white flex gap-1 text-[16px] justify-center mt-8 mb-5">
          <button
            type="button"
            disabled={page === 0}
            className={`flex items-center justify-center h-10 w-10 rounded-full bg-[#22212c] transition ${
              page === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-[#48465e] cursor-pointer"
            }`}
            onClick={handlePreviousPage}
          >
            <FaArrowLeft />
          </button>

          <button
            type="button"
            disabled={page >= SplitedAnimes.length - 1}
            className={`flex items-center justify-center h-10 w-10 rounded-full bg-[#22212c] transition ${
              page >= SplitedAnimes.length - 1
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-[#48465e] cursor-pointer"
            }`}
            onClick={handleNextPage}
          >
            <FaArrowRight />
          </button>
        </div>
      )}
    </Fragment>
  );
};

export default Animes;

"use client";

import { useState } from "react";
import FeaturedCard from "@/components/Cards/featuredCard/FeaturedCard";
import { FaChevronDown, FaChevronUp, FaCompass } from "react-icons/fa6";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const Collection = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const data = [
    {
      text: "Action & Shounen Hits",
      genre: "Action",
      href: `/catalog?genres=%5B"Action"%5D&sort=POPULARITY_DESC`,
      titles: ["JUJUTSU KAISEN", "Attack on Titan", "Demon Slayer"],
      image: [
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg",
      ],
    },
    {
      text: "Romance & Drama",
      genre: "Romance",
      href: `/catalog?genres=%5B"Romance"%5D&sort=POPULARITY_DESC`,
      titles: ["Kaguya-sama: Love is War", "Your Lie in April", "Horimiya"],
      image: [
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101921-ufrjLzhSz7L1.jpg",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20665-TLgkL8T8IRFd.png",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx124080-3i22mRVPBS0T.jpg",
      ],
    },
    {
      text: "Fantasy & Adventure",
      genre: "Fantasy",
      href: `/catalog?genres=%5B"Fantasy"%5D&sort=POPULARITY_DESC`,
      titles: ["Frieren: Beyond Journey's End", "Mushoku Tensei", "Re:ZERO"],
      image: [
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx108465-1ANspF1EWyFx.jpg",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21355-wRVUrGxpvIQQ.jpg",
      ],
    },
    {
      text: "Sci-Fi & Cyberpunk",
      genre: "Sci-Fi",
      href: `/catalog?genres=%5B"Sci-Fi"%5D&sort=POPULARITY_DESC`,
      titles: ["Steins;Gate", "Cyberpunk: Edgerunners", "Psycho-Pass"],
      image: [
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx9253-tIUXF2gfU8Sg.jpg",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx120377-ayZPoxiWt4Li.jpg",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx13601-i42VFuHpqEOJ.jpg",
      ],
    },
    {
      text: "Comedy & Slice of Life",
      genre: "Comedy",
      href: `/catalog?genres=%5B"Comedy"%5D&sort=POPULARITY_DESC`,
      titles: ["SPY x FAMILY", "Bocchi the Rock!", "KonoSuba"],
      image: [
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-Kb6R5nYQfjmP.jpg",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx130003-HTDmeL4RGeJ4.png",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21202-mPOr80AEjUcZ.png",
      ],
    },
    {
      text: "Supernatural & Mystery",
      genre: "Supernatural",
      href: `/catalog?genres=%5B"Supernatural"%5D&sort=POPULARITY_DESC`,
      titles: ["Death Note", "Tokyo Ghoul", "The Promised Neverland"],
      image: [
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1535-kUgkcrfOrkUM.jpg",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/b20605-k665mVkSug8D.jpg",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101759-8UR7r9MNVpz2.jpg",
      ],
    },
  ];

  const visibleCards = isExpanded ? data : data.slice(0, 3);

  return (
    <div className="w-full max-w-[96rem] relative mx-5 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-6 rounded-full bg-cyan-500"></span>
          <h2 className="text-slate-900 dark:text-slate-100 font-bold text-2xl sm:text-3xl font-['Outfit'] tracking-tight">
            Featured Collections
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-[#1A1D2B] border border-slate-200 dark:border-[#2B3048] hover:border-cyan-500/50 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
        >
          <span>{isExpanded ? "See Less" : "See More"}</span>
          {isExpanded ? (
            <FaChevronUp className="w-3 h-3 text-cyan-500" />
          ) : (
            <FaChevronDown className="w-3 h-3 text-cyan-500" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {visibleCards.map((item, index) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              className="h-full w-full"
            >
              <FeaturedCard data={item} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isExpanded && (
        <div className="flex justify-center mt-8">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 text-xs sm:text-sm font-semibold transition-all hover:scale-105"
          >
            <FaCompass className="w-4 h-4" />
            <span>Explore All Anime in Catalog</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Collection;
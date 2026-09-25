"use client"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

const ProfileCard = ({ info, loading, hidden }) => {
  const animeInfo = info?.media


  const listItem = {
    hidden: { scale: 0 },
    show: { scale: 1 }
  };

  if (hidden) {
    return <motion.div className="aspect-[9/14] relative rounded-xl mb-2 overflow-hidden opacity-0" variants={listItem}></motion.div>
  }

  if (loading) {
    return (
      <div className="aspect-[9/14] relative rounded-xl cursor-pointer mb-2 overflow-hidden bg-[#22212c]">
        <div className="absolute bottom-[13px] left-[15px] z-10 w-full">
          <div className="w-[88%] h-4 bg-[#48465e] rounded-md"></div>
          <div className="w-[40px] h-3 bg-[#48465e] rounded-md mt-2"></div>
        </div>
      </div>
    )
  }

  const animeId = animeInfo?.id || info?.id || info?.mediaId;
  const coverImg =
    animeInfo?.coverImage?.extraLarge ||
    animeInfo?.coverImage?.large ||
    animeInfo?.coverImage?.medium ||
    "/placeholder.png";
  const displayTitle =
    animeInfo?.title?.english ||
    animeInfo?.title?.romaji ||
    animeInfo?.title?.userPreferred ||
    "Anime";
  const displayStatus = animeInfo?.status
    ? animeInfo.status.charAt(0).toUpperCase() + animeInfo.status.slice(1).toLowerCase()
    : "Anime";

  return (
    <Link href={animeId ? `/watch/${animeId}` : "#"} className="block group">
      <motion.div
        className="aspect-[9/14] relative rounded-xl cursor-pointer mb-2 overflow-hidden border border-transparent hover:border-cyan-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/10"
        variants={listItem}
      >
        <div className="w-full h-full aspect-[9/14] after:content-[''] after:w-full after:h-[45%] after:absolute after:flex after:bg-[linear-gradient(360deg,#10121Af0,#0000)] after:left-0 after:bottom-0">
          <Image
            src={coverImg}
            alt={displayTitle}
            width={200}
            height={280}
            className="object-cover w-full h-full rounded-xl cursor-pointer aspect-[4/6] group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="absolute bottom-[13px] left-[15px] right-[15px] text-white z-10">
          <div className="line-clamp-1 text-ellipsis overflow-hidden font-semibold text-sm cursor-pointer transition-colors group-hover:text-cyan-300">
            {displayTitle}
          </div>
          <div className="text-xs text-slate-300 flex items-center justify-between mt-0.5">
            <span>{displayStatus}</span>
            {info?.progress ? <span className="text-cyan-400 font-medium">Ep {info.progress}</span> : null}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProfileCard;
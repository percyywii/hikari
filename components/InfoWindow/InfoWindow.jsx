import { IoStar } from "react-icons/io5";
import { motion } from "framer-motion";
import useScreenDimensions from "@/hook/useScreenDimensions";
import { FaCirclePlay } from "react-icons/fa6";
import Link from "next/link";
import { useEffect } from "react";

const InfoWindow = ({ info, hoverdata, onMouseEnter, onMouseLeave }) => {
  const { width: screenWidth } = useScreenDimensions();
  let leaveTimer = null;

  const handleMouseEnter = () => {
    clearTimeout(leaveTimer);
    if (onMouseEnter) onMouseEnter();
  };

  const handleMouseLeave = () => {
    leaveTimer = setTimeout(() => {
      if (onMouseLeave) onMouseLeave();
    }, 200);
  };

  useEffect(() => {
    return () => {
      clearTimeout(leaveTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const title = info?.title?.english || info?.title?.romaji || info?.title?.userPreferred || "Anime";
  const rating = info?.averageScore ? (info.averageScore / 10).toFixed(1) : null;

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="w-[300px] opacity-0 absolute z-40 rounded-2xl backdrop-blur-xl border border-slate-200 dark:border-[#cfd1e42b] p-4 top-[85%] translate-y-[-50%] bg-white/95 dark:bg-[#141428]/95 shadow-2xl transition-colors"
      style={{ left: hoverdata?.clientX + 492 > screenWidth ? "-155%" : "102%" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <h1 className="text-base font-bold text-slate-900 dark:text-white w-full tracking-tight overflow-hidden text-ellipsis line-clamp-1 font-['Outfit']">
        {title}
      </h1>

      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-2">
          {rating && (
            <div className="text-amber-400 flex items-center gap-1 text-xs font-bold">
              <IoStar /> <span>{rating}</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-[11px] font-bold">
            <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded">HD</span>
            {info?.episodes && (
              <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded">
                EP {info.episodes}
              </span>
            )}
          </div>
        </div>

        {info?.format && (
          <span className="bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 font-semibold px-1.5 py-0.2 rounded text-[11px]">
            {info.format}
          </span>
        )}
      </div>

      <div className="text-slate-600 dark:text-slate-300 text-xs mt-2 overflow-hidden text-ellipsis line-clamp-3 leading-relaxed">
        {info?.description?.replace(/<[^>]*>/g, "")}
      </div>

      <div className="text-slate-600 dark:text-slate-300 text-xs mt-2.5 space-y-0.5 border-t border-slate-100 dark:border-white/5 pt-2">
        {info?.startDate?.year && (
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-200">Aired: </span>
            <span>
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][info?.startDate?.month - 1 || 0]} {info?.startDate?.day || 1}, {info?.startDate?.year}
            </span>
          </div>
        )}
        {info?.status && (
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-200">Status: </span>
            <span className={info.status === "RELEASING" ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}>{info.status}</span>
          </div>
        )}
        {info?.genres?.length > 0 && (
          <div className="line-clamp-1">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Genres: </span>
            <span>{info.genres.slice(0, 3).join(", ")}</span>
          </div>
        )}
      </div>

      <Link
        href={`/watch/${info?.id}`}
        className="w-full h-9 rounded-xl mt-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center gap-1.5 text-xs shadow-md transition-all active:scale-95 cursor-pointer"
      >
        <FaCirclePlay className="w-3.5 h-3.5" /> Watch Now
      </Link>
    </motion.div>
  );
};

export default InfoWindow;

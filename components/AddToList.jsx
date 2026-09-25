"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { GoPlus } from "react-icons/go";
import { FaCheck } from "react-icons/fa6";
import { MdDeleteOutline } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { useWatchContext } from "@/context/Watch";
import { LIST_CATEGORIES, getMediaListStatus, setUserListEntry } from "@/utils/userListStorage";

const AddToList = ({ anime, animeId: propAnimeId, className = "" }) => {
  const [isOpened, setIsOpened] = useState(false);
  const dropdownRef = useRef(null);
  const { data: session } = useSession();

  // Watch context if available
  let watchContext = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    watchContext = useWatchContext();
  } catch {
    watchContext = null;
  }

  const effectiveAnimeId = propAnimeId || anime?.id || watchContext?.animeid || watchContext?.AnimeInfo?.id;
  const effectiveEpisode = watchContext?.episode || 1;
  const effectiveMedia = anime || watchContext?.AnimeInfo || null;

  const [currentStatus, setCurrentStatus] = useState(null);

  // Sync current list status
  const refreshStatus = useCallback(() => {
    if (!effectiveAnimeId) return;
    const statusData = getMediaListStatus(effectiveAnimeId);
    setCurrentStatus(statusData?.status || null);
  }, [effectiveAnimeId]);

  useEffect(() => {
    refreshStatus();

    const handleUpdate = () => refreshStatus();
    window.addEventListener("hikari_lists_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("hikari_lists_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [refreshStatus]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpened(false);
      }
    };
    if (isOpened) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpened]);

  const handleSelectStatus = async (statusId) => {
    if (!effectiveAnimeId) {
      toast.error("Unable to identify anime");
      return;
    }

    try {
      const isRemoving = statusId === "REMOVE";
      const res = await setUserListEntry({
        animeId: effectiveAnimeId,
        status: isRemoving ? "REMOVE" : statusId,
        progress: effectiveEpisode,
        media: effectiveMedia,
        token: session?.user?.token || null,
      });

      if (res?.success) {
        setCurrentStatus(isRemoving ? null : statusId);
        setIsOpened(false);

        if (isRemoving) {
          toast.info("Removed from your list");
        } else {
          const category = LIST_CATEGORIES.find((c) => c.id === statusId);
          toast.success(`Saved to "${category?.title || "List"}"`);
        }
      } else {
        toast.error("Could not save to list");
      }
    } catch (err) {
      console.error("List error:", err);
      toast.error("Error updating list entry");
    }
  };

  const activeCategory = LIST_CATEGORIES.find((c) => c.id === currentStatus);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpened((prev) => !prev)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm ${
          activeCategory
            ? "bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30"
            : "bg-slate-100 dark:bg-[#1A1D2B] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#2B3048] hover:bg-slate-200 dark:hover:bg-[#252A3D]"
        }`}
      >
        {activeCategory ? (
          <>
            <FaCheck className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
            <span>{activeCategory.title}</span>
          </>
        ) : (
          <>
            <GoPlus className="w-4 h-4 text-cyan-500" />
            <span>Add to List</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpened && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-[#141622] border border-slate-200 dark:border-[#232738] rounded-xl shadow-2xl py-1.5 z-50 text-xs sm:text-sm font-medium backdrop-blur-md"
          >
            <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-[#1E2235] mb-1">
              Select List
            </div>

            {LIST_CATEGORIES.map((item) => {
              const isSelected = item.id === currentStatus;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectStatus(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-semibold"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1C2030]"
                  }`}
                >
                  <span>{item.title}</span>
                  {isSelected && <FaCheck className="w-3 h-3 text-cyan-500" />}
                </button>
              );
            })}

            {currentStatus && (
              <div className="border-t border-slate-100 dark:border-[#1E2235] mt-1 pt-1">
                <button
                  type="button"
                  onClick={() => handleSelectStatus("REMOVE")}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left cursor-pointer text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <MdDeleteOutline className="w-4 h-4" />
                  <span>Remove from List</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddToList;

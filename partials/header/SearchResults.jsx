"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { FaStar } from "react-icons/fa";
import { FiArrowRight, FiAlertCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const handlerRef = useRef();

  useEffect(() => {
    handlerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handlerRef.current);
    };
  }, [value, delay]);

  return debouncedValue;
};

const ResultItem = ({ data, onClose }) => {
  const title = data?.title?.english || data?.title?.romaji || data?.title?.userPreferred || "Anime";
  const rating = data?.rating ? (data.rating / 10).toFixed(1) : null;
  const image = data?.image || data?.coverImage?.large || "/placeholder.png";

  return (
    <Link
      href={`/watch/${data?.id}`}
      onClick={onClose}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1A1E2E] transition-colors group cursor-pointer"
    >
      <div className="relative w-11 h-14 shrink-0 rounded overflow-hidden bg-slate-200 dark:bg-[#161926]">
        <Image
          src={image}
          alt={title}
          fill
          sizes="44px"
          className="object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 truncate transition-colors">
          {title}
        </h4>
        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          {data?.type && (
            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#161926] text-slate-600 dark:text-slate-300 font-mono text-[10px]">
              {data.type}
            </span>
          )}
          {rating && (
            <span className="flex items-center gap-1 text-amber-500 font-medium">
              <FaStar className="w-2.5 h-2.5" />
              {rating}
            </span>
          )}
          {data?.status && (
            <span className="truncate text-slate-500 dark:text-slate-400">
              {data.status.replace(/_/g, " ")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

const SearchResults = ({ searchValue, onClose }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const debouncedSearchValue = useDebounce(searchValue, 350);

  useEffect(() => {
    if (!debouncedSearchValue || debouncedSearchValue.trim().length === 0) {
      setData([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetch(`/api/anime/search?query=${encodeURIComponent(debouncedSearchValue.trim())}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Search failed with status ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setData(json?.results || []);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error("[Hikari Search] Error:", err);
        setError("Unable to load search results.");
        setData([]);
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [debouncedSearchValue]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full mt-2 right-0 w-80 sm:w-96 max-h-[460px] bg-white dark:bg-[#0E1017] border border-slate-200 dark:border-[#1E2235] rounded-xl shadow-2xl shadow-black/40 overflow-hidden flex flex-col z-50 backdrop-blur-xl"
    >
      <div className="p-2 overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-[#161926]">
        {/* Loading state skeleton */}
        {isLoading && (
          <div className="flex flex-col gap-2 p-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                <div className="w-11 h-14 bg-slate-200 dark:bg-[#1A1D2B] rounded shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-slate-200 dark:bg-[#1A1D2B] rounded w-3/4"></div>
                  <div className="h-2.5 bg-slate-100 dark:bg-[#141724] rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <div className="p-4 text-center text-xs text-rose-500 dark:text-rose-400 flex items-center justify-center gap-2">
            <FiAlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && data.length === 0 && debouncedSearchValue && (
          <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
            <p>No anime found for <span className="text-slate-800 dark:text-slate-200 font-medium">"{debouncedSearchValue}"</span></p>
            <p className="text-[11px] text-slate-400 mt-1">Try another title or check your spelling</p>
          </div>
        )}

        {/* Results List */}
        {!isLoading &&
          !error &&
          data.length > 0 &&
          data.slice(0, 6).map((item) => (
            <ResultItem key={item.id} data={item} onClose={onClose} />
          ))}
      </div>

      {/* Footer "View all in Catalog" button */}
      {!isLoading && data.length > 0 && (
        <Link
          href={`/catalog?search=${encodeURIComponent(searchValue)}`}
          onClick={onClose}
          className="px-4 py-2.5 bg-slate-50 dark:bg-[#12141F] hover:bg-slate-100 dark:hover:bg-[#181C2B] border-t border-slate-200 dark:border-[#1E2235] text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 flex items-center justify-between transition-colors"
        >
          <span>View all results in Catalog</span>
          <FiArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </motion.div>
  );
};

export default SearchResults;

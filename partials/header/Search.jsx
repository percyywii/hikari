"use client";

import useScreenDimensions from "@/hook/useScreenDimensions";
import { useEffect, useRef, useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { IoCloseOutline } from "react-icons/io5";
import SearchResults from "./SearchResults";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";

const Search = () => {
  const router = useRouter();
  const containerRef = useRef(null);

  const { width } = useScreenDimensions();
  const [isSearchBoxOpen, setIsSearchBoxOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Close results dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!hasMounted) {
    return null;
  }

  const handleSearchSubmit = () => {
    if (searchValue.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchValue.trim())}`);
      setIsFocused(false);
      setIsSearchBoxOpen(false);
    }
  };

  const handleClear = () => {
    setSearchValue("");
    setIsFocused(false);
  };

  // Mobile layout
  if (width <= 590) {
    return isSearchBoxOpen ? (
      <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 z-50">
        <div ref={containerRef} className="relative w-full">
          <div className="h-11 flex items-center bg-white dark:bg-[#10121A] border border-cyan-500/60 rounded-xl px-3 shadow-xl">
            <IoIosSearch className="text-xl text-cyan-600 dark:text-cyan-400 shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Search anime..."
              className="bg-transparent outline-none w-full text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              value={searchValue}
              autoFocus
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearchSubmit();
                if (e.key === "Escape") setIsSearchBoxOpen(false);
              }}
            />
            {searchValue && (
              <button
                type="button"
                className="text-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
                onClick={handleClear}
              >
                <IoCloseOutline />
              </button>
            )}
            <button
              type="button"
              className="text-2xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white ml-2 p-1"
              onClick={() => setIsSearchBoxOpen(false)}
            >
              <IoCloseOutline />
            </button>
          </div>

          <AnimatePresence>
            {searchValue.trim() !== "" && (
              <SearchResults
                searchValue={searchValue}
                onClose={() => {
                  setIsSearchBoxOpen(false);
                  setIsFocused(false);
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    ) : (
      <button
        type="button"
        className="text-xl text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-[#161926] transition-colors cursor-pointer"
        onClick={() => setIsSearchBoxOpen(true)}
        aria-label="Search"
      >
        <IoIosSearch />
      </button>
    );
  }

  // Desktop layout
  return (
    <div ref={containerRef} className="relative">
      <div
        className={`flex items-center bg-slate-100 dark:bg-[#10121A] border rounded-xl px-3 h-9 sm:h-10 transition-all duration-200 ${
          isFocused || searchValue
            ? "border-cyan-500/60 shadow-sm shadow-cyan-500/10 w-64 ring-2 ring-cyan-500/20"
            : "border-slate-200 dark:border-[#1E2235] hover:border-slate-400 dark:hover:border-slate-600 w-48 sm:w-56"
        }`}
      >
        <IoIosSearch className="text-lg text-slate-500 dark:text-slate-400 shrink-0 mr-2" />
        <input
          type="text"
          placeholder="Search anime..."
          className="bg-transparent outline-none w-full text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
          value={searchValue}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearchSubmit();
            if (e.key === "Escape") {
              setIsFocused(false);
              e.target.blur();
            }
          }}
        />

        {searchValue && (
          <button
            type="button"
            className="text-base text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-0.5"
            onClick={handleClear}
          >
            <IoCloseOutline />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isFocused && searchValue.trim() !== "" && (
          <SearchResults
            searchValue={searchValue}
            onClose={() => setIsFocused(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search;

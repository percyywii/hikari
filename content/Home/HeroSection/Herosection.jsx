"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import styles from "./HeroSection.module.css";
import { FaCirclePlay, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import Button from "@/components/ui/Button";
import ImageSection from "./ImageSection";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const Herosection = ({ data }) => {
  const slides = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    const valid = data.filter(
      (item) => item.bannerImage && item.id !== 21 && item.status !== "NOT_YET_RELEASED"
    );
    return valid.length > 0 ? valid.slice(0, 6) : data.slice(0, 6);
  }, [data]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const totalSlides = slides.length;
  const currentAnime = slides[currentIndex] || null;

  // Auto-advance slides every 6 seconds if not paused
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 6000);

    return () => clearInterval(timer);
  }, [totalSlides, isPaused]);

  const nextSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const title =
    currentAnime?.title?.english ||
    currentAnime?.title?.romaji ||
    currentAnime?.title?.userPreferred ||
    "Featured Anime";

  const cleanDescription = currentAnime?.description
    ? currentAnime.description.replace(/<[^>]*>/g, "")
    : "Discover thrilling anime adventures, stream high quality episodes, and track your watch journey on Hikari.";

  const monthIdx = (currentAnime?.startDate?.month || 1) - 1;
  const monthName = MONTHS[monthIdx >= 0 && monthIdx < 12 ? monthIdx : 0];
  const dateStr = currentAnime?.startDate?.year
    ? `${monthName} ${currentAnime?.startDate?.day || 1}, ${currentAnime?.startDate?.year}`
    : null;

  return (
    <div
      className={`relative w-full overflow-hidden select-none ${styles.smoothImageBlending}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Visual Layer with Transition */}
      <AnimatePresence mode="wait">
        {currentAnime ? (
          <motion.div
            key={currentAnime.id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <ImageSection populardata={currentAnime} />
          </motion.div>
        ) : (
          <div className={`${styles.smoothTransform} relative aspect-[16/9] max-h-[800px] min-h-[460px] w-full bg-slate-100 dark:bg-[#090A0F]`}></div>
        )}
      </AnimatePresence>

      {/* Floating Info Content Overlay */}
      {currentAnime && (
        <div className="absolute top-[28%] sm:top-[34%] left-4 sm:left-12 lg:left-24 z-10 max-w-2xl pr-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAnime.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              {/* Apple-Style Pill Spotlight Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-black/60 border border-slate-300 dark:border-white/15 text-cyan-600 dark:text-cyan-300 text-xs sm:text-sm font-semibold mb-3 backdrop-blur-md shadow-sm">
                <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></span>
                <span>#{currentIndex + 1} Spotlight Anime</span>
              </div>

              {/* Title with Perfect Dual-Theme Contrast */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white font-extrabold tracking-tight line-clamp-2 leading-tight drop-shadow-md">
                {title}
              </h1>

              {/* Meta Tags */}
              <div className="flex flex-wrap items-center gap-2.5 my-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {currentAnime?.format && (
                  <span className="px-2 py-0.5 rounded-md bg-black/10 dark:bg-black/60 border border-slate-300 dark:border-white/10 uppercase tracking-wider font-mono text-[11px] font-medium">
                    {currentAnime.format}
                  </span>
                )}

                {currentAnime?.status && (
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-md text-[11px] ${
                      currentAnime.status === "RELEASING"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-black/10 dark:bg-black/60 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10"
                    }`}
                  >
                    {currentAnime.status === "RELEASING" ? "● Airing" : currentAnime.status}
                  </span>
                )}

                {dateStr && (
                  <span className="text-slate-600 dark:text-slate-400 hidden sm:inline-block font-medium">
                    {dateStr}
                  </span>
                )}

                {(currentAnime?.nextAiringEpisode?.episode || currentAnime?.episodes) && (
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 text-xs font-semibold">
                    EP {currentAnime.nextAiringEpisode?.episode ? currentAnime.nextAiringEpisode.episode - 1 : currentAnime.episodes}
                  </span>
                )}
              </div>

              {/* Synopsis */}
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed mb-6 font-normal max-w-xl">
                {cleanDescription}
              </p>

              {/* Call to Actions */}
              <div className="flex items-center gap-3">
                <Button
                  text="Watch Now"
                  icon={<FaCirclePlay className="w-4 h-4" />}
                  animeID={currentAnime.id}
                />
                <Link
                  href={`/catalog?search=${encodeURIComponent(title)}`}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/60 dark:bg-black/40 hover:bg-white dark:hover:bg-black/70 border border-slate-300 dark:border-white/20 text-slate-800 dark:text-slate-200 backdrop-blur-md transition-all shadow-sm"
                >
                  Explore Catalog
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Apple-Grade Navigation Arrows */}
      {totalSlides > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/40 dark:bg-black/40 hover:bg-white/80 dark:hover:bg-black/70 border border-slate-200 dark:border-white/20 text-slate-800 dark:text-white flex items-center justify-center backdrop-blur-md shadow-lg transition-all scale-100 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <FaChevronLeft className="w-3.5 h-3.5 -ml-0.5" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/40 dark:bg-black/40 hover:bg-white/80 dark:hover:bg-black/70 border border-slate-200 dark:border-white/20 text-slate-800 dark:text-white flex items-center justify-center backdrop-blur-md shadow-lg transition-all scale-100 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <FaChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </>
      )}

      {/* Apple-Grade Slide Indicator Pills (Bottom Center) */}
      {totalSlides > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-1.5 rounded-full bg-white/30 dark:bg-black/40 border border-slate-200/60 dark:border-white/10 backdrop-blur-lg shadow-lg">
          {slides.map((slide, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                key={slide.id || index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "w-7 bg-cyan-500 shadow-sm shadow-cyan-500/50"
                    : "w-2 bg-slate-400/60 dark:bg-white/40 hover:bg-slate-600 dark:hover:bg-white/70"
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Herosection;
"use client";

import Card from "@/components/Cards/Card/Card";
import { AdvancedSearch } from "@/lib/Anilistfunction";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import Pagination from "./Pagination";

const Animes = () => {
  const searchParams = useSearchParams();

  const [animes, setAnimes] = useState({ media: [], pageInfo: {} });
  const [loading, setLoading] = useState(true);

  const fetchAdvanceSearch = useCallback(async () => {
    setLoading(true);

    const sort = searchParams.get("sort") || "POPULARITY_DESC";
    const search = searchParams.get("search") || "";
    let airing = searchParams.get("airing") || null;
    const genres = searchParams.get("genres") || null;
    let season = searchParams.get("season") || null;
    const type = searchParams.get("type") || null;
    const page = parseInt(searchParams.get("page") || 1, 10);
    const year = searchParams.get("year") || null;

    // hidden params
    const country = searchParams.get("country") || null;
    const startYear = searchParams.get("syear") || null;
    const episodes = searchParams.get("episodes") || null;

    if (airing) {
      airing =
        {
          Airing: "RELEASING",
          Finished: "FINISHED",
          "Not yet Aired": "NOT_YET_RELEASED",
          Cancelled: "CANCELLED",
        }[airing] || airing;
    }
    if (season) {
      season = season.toUpperCase();
    }

    let genresData = null;
    if (genres) {
      try {
        const parsedGenres = JSON.parse(genres);
        if (Array.isArray(parsedGenres)) {
          genresData = { genres: parsedGenres };
        } else if (typeof parsedGenres === "string") {
          genresData = { genres: [parsedGenres] };
        }
      } catch {
        const fallback = genres
          .split(",")
          .map((g) => g.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean);
        if (fallback.length > 0) {
          genresData = { genres: fallback };
        }
      }
    }

    try {
      const data = await AdvancedSearch(
        search,
        season,
        type,
        genresData,
        airing,
        sort,
        page,
        country,
        startYear,
        episodes,
        year
      );

      setAnimes(data || { media: [], pageInfo: {} });
    } catch (error) {
      console.error("Error fetching catalog animes:", error);
      setAnimes({ media: [], pageInfo: {} });
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchAdvanceSearch();
  }, [fetchAdvanceSearch]);

  const loadingCards = useMemo(
    () => Array.from({ length: 30 }).map((_, index) => <Card key={index} index={index} loading />),
    []
  );

  const mediaList = Array.isArray(animes?.media) ? animes.media : [];

  return (
    <div className="w-full">
      <div className="w-full h-full grid grid-auto-fit gap-3">
        {loading
          ? loadingCards
          : mediaList.map((item, index) => <Card data={item} key={item?.id || index} />)}

        {!loading &&
          mediaList.length > 0 &&
          mediaList.length < 6 &&
          Array.from({ length: 6 - mediaList.length }).map((_, index) => (
            <Card key={`filler-${index}`} index={index} hidden />
          ))}
      </div>

      {!loading && mediaList.length === 0 && (
        <div className="w-full py-20 flex flex-col items-center justify-center text-center">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 font-['Outfit']">
            No anime found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
            Try adjusting your genre filters or search query to find what you&apos;re looking for.
          </p>
        </div>
      )}

      <div className="mt-8"></div>
      {animes?.pageInfo && mediaList.length >= 20 ? (
        <Pagination pageInfo={animes?.pageInfo} />
      ) : null}
    </div>
  );
};

export default Animes;

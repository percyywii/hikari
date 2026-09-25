"use client";

import CatalogSelect from "@/components/ui/CatalogSelect";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const SortBy = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const data = [
    { key: "POPULARITY_DESC", value: "Popularity" },
    { key: "TRENDING_DESC", value: "Trending" },
    { key: "FAVOURITES_DESC", value: "Favourites" },
    { key: "SCORE_DESC", value: "MAL Score" },
  ];

  const currentSortKey = searchParams.get("sort");
  const initialSort = data.find((item) => item.key === currentSortKey) || data[0];

  const [sortData, setSortData] = useState(initialSort);
  const [active, setActive] = useState(initialSort?.value || data[0].value);

  // Sync state if URL changes externally
  useEffect(() => {
    const matched = data.find((item) => item.key === searchParams.get("sort"));
    if (matched && matched.key !== sortData?.key) {
      setSortData(matched);
      setActive(matched.value);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!sortData?.key) return;

    const currentInUrl = searchParams.get("sort");
    if (currentInUrl !== sortData.key) {
      const updatedParams = new URLSearchParams(searchParams.toString());
      updatedParams.set("sort", sortData.key);
      const newQuery = updatedParams.toString();
      const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ""}`;
      router.push(newUrl, { scroll: false });
    }
  }, [sortData?.key, router, searchParams]);

  return (
    <div>
      <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">Sort by</span>
      <div className="w-full max-w-44 mt-1">
        <CatalogSelect setSortBy={setSortData} data={data} active={active} setActive={setActive} />
      </div>
    </div>
  );
};

export default SortBy;

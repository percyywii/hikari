"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Animes from "./Animes";
import CategorySelector from "./CategorySelector";
import Statistics from "./Statistics/Statistics";
import { getFormattedListsForProfile, calculateUserStatistics } from "@/utils/userListStorage";

const CategoryMain = ({ lists: initialLists = [], user, watchedAnime: initialWatchedAnime = null }) => {
  const [active, setActive] = useState("CURRENT"); // by default Watching (ID)
  const [userLists, setUserLists] = useState(() => getFormattedListsForProfile(initialLists));

  const refreshLists = useCallback(() => {
    const updated = getFormattedListsForProfile(initialLists);
    setUserLists(updated);
  }, [initialLists]);

  useEffect(() => {
    refreshLists();

    const handleUpdate = () => refreshLists();
    window.addEventListener("hikari_lists_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("hikari_lists_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [refreshLists]);

  // Derived user statistics for local or hybrid users
  const statistics = useMemo(() => calculateUserStatistics(userLists), [userLists]);

  const liveUser = useMemo(() => {
    // If user already has full AniList statistics, preserve, but ensure counts are never 0 if local lists exist
    const baseStats = user?.statistics?.anime || {};
    return {
      ...user,
      statistics: {
        anime: {
          count: Math.max(Number(baseStats.count) || 0, statistics.totalAnimes),
          episodesWatched: Math.max(Number(baseStats.episodesWatched) || 0, statistics.episodesWatched),
          minutesWatched: Math.max(Number(baseStats.minutesWatched) || 0, statistics.minutesWatched),
        },
      },
    };
  }, [user, statistics]);

  const activeTargetList = useMemo(() => {
    return userLists.find((item) => item?.status === active) || { entries: [] };
  }, [userLists, active]);

  return (
    <div className="w-full min-h-[500px]">
      <CategorySelector active={active} setActive={setActive} data={userLists} />

      {active !== "STATISTICS" ? (
        <Animes activeStatus={active} data={activeTargetList} />
      ) : (
        <Statistics user={liveUser} lists={userLists} />
      )}
    </div>
  );
};

export default CategoryMain;
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useWatchContext } from "@/context/Watch";
import { getEpisodes } from "@/actions/episode";
import { fetchWatchedEpisodes, updateWatchedEpisodes } from "./utils/LocalStorage";
import { filterEpisodes, chunkEpisodes } from "./utils/EpisodeUtils";
import SearchBar, { allepisodelayout } from "./SearchBar";
import Filters from "./Filters";
import EpisodeList from "./EpisodeList";

const EpisodeSelector = ({ AnimeID }) => {
  const [dubSelected, setDubSelected] = useState({ id: 0 });
  const [epFromTo, setEpFromTo] = useState({ id: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [watchedEP, setWatchedEP] = useState([]);
  const [showType, setShowType] = useState("list")

  const chunkSize = 80;
  const { setIsDub, setServer, episode, setEpisodes, episodes, AnimeInfo } = useWatchContext();
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setEpisodes("loading");
      try {
        const episodes = await getEpisodes(AnimeID, AnimeInfo);
        if (!cancelled && episodes) setEpisodes(episodes);
      } catch (err) {
        console.error("Failed to fetch episodes:", err);
        if (!cancelled) setEpisodes([]);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [AnimeID, AnimeInfo, setEpisodes]);

  const loading = episodes === "loading";
  const isSubSelected = dubSelected.id === 0 || dubSelected.id === 1;

  const filteredEpisodes = useMemo(() => filterEpisodes(episodes, isSubSelected, loading), [loading, isSubSelected, episodes]);
  const SplitedEpisodes = useMemo(() => chunkEpisodes(filteredEpisodes, chunkSize), [filteredEpisodes]);

  useEffect(() => {
    const wantsDub = !isSubSelected;
    setIsDub(wantsDub);
    if (setServer) {
      setServer(wantsDub ? "dub" : "sub");
    }
  }, [isSubSelected, setIsDub, setServer]);

  useEffect(() => {
    setWatchedEP(fetchWatchedEpisodes(AnimeID, episode));
    updateWatchedEpisodes(AnimeID, episode);
  }, [AnimeID, episode]);

  const handleSearchQueryChange = useCallback((e) => setSearchQuery(e.target.value), []);

  return (
    <div className="bg-white dark:bg-[#10121A] border border-slate-200/90 dark:border-[#1E2235] w-full max-w-[22rem] EPSResponsive rounded-2xl flex flex-col shadow-xl shadow-black/5 dark:shadow-black/30 overflow-hidden transition-colors">
      <SearchBar searchQuery={searchQuery} handleSearchQueryChange={handleSearchQueryChange} showType={showType} setShowType={setShowType} />
      <Filters setDubSelected={setDubSelected} setEpFromTo={setEpFromTo} SplitedEpisodes={SplitedEpisodes} chunkSize={chunkSize} />
      <EpisodeList loading={loading} searchQuery={searchQuery} data={filteredEpisodes} SplitedEpisodes={SplitedEpisodes} epFromTo={epFromTo} episode={episode} watchedEP={watchedEP} showType={showType} />
    </div>
  );
};

export default EpisodeSelector;

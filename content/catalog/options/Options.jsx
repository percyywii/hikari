"use client"
import { useEffect, useState } from "react"
import AiringStatus from "./Airing"
import Genres from "./Genres"
import Search from "./Search"
import Season from "./Season"
import Types from "./Types"
import Year from "./Year"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

const Options = () => {
  const router = useRouter(), pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [season, setSeason] = useState("");
  const [airingStatus, setAiringStatus] = useState("");
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    setSearch(searchParams.get('search') || "");
    setType(searchParams.get('type') || "");
    setSeason(searchParams.get('season') || "");
    setAiringStatus(searchParams.get('airing') || "");
    setGenres(searchParams.get('genres') ? JSON.parse(searchParams.get('genres')) : []);
  }, [searchParams]);



  const handleSubmit = () => {
    const params = [
      search && `search=${encodeURIComponent(search)}`,
      type && `type=${encodeURIComponent(type)}`,
      season && `season=${encodeURIComponent(season)}`,
      airingStatus && `airing=${encodeURIComponent(airingStatus)}`,
      genres.length > 0 && `genres=${encodeURIComponent(JSON.stringify(genres))}`
    ].filter(Boolean).join('&');

    router.push(`${pathname}${params ? `?${params}` : ''}`);
  };


  return (
    <div className="p-4 bg-white dark:bg-[#10121A] border border-slate-200 dark:border-[#1E2235] w-full h-max max-w-[20rem] text-slate-800 dark:text-slate-200 rounded-2xl shadow-xl max-[780px]:max-w-full transition-colors">
      <Search search={search} setSearch={setSearch} pathname={pathname} />
      <Types type={type} setType={setType} />
      <Season season={season} setSeason={setSeason} />
      <AiringStatus airingStatus={airingStatus} setAiringStatus={setAiringStatus} />
      <Genres genresitem={genres} setGenres={setGenres} />
      <Year />

      <button
        type="button"
        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-center py-2.5 rounded-xl mt-6 cursor-pointer font-semibold text-sm shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
        onClick={handleSubmit}
      >
        Apply Filters
      </button>
    </div>
  );
}

export default Options
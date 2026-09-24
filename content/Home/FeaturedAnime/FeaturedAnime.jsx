"use client"
import Image from "next/image"
import styles from "./FeaturedAnime.module.css"
import { FaCirclePlay } from "react-icons/fa6";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";


const getRandomFeaturedAnime = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) return null;
  const filteredData = data.filter(
    (item) =>
      item.trailer?.id &&
      item.id !== 21 &&
      item.bannerImage &&
      item.status !== "NOT_YET_RELEASED"
  );
  const randomIndex = Math.floor(Math.random() * filteredData.length);
  return filteredData[randomIndex];
};

const FeaturedAnime = ({ data }) => {
  const [populardata, setPopulardata] = useState([])

  useEffect(() => {
    if (typeof window !== undefined) {
      const setting = JSON.parse(localStorage.getItem("setting.Tenro") || localStorage.getItem("setting.Taro") || "{}")

      if (
        setting?.appearence?.featuredSection ||
        setting?.appearence?.featuredSection === undefined
      ) {

        const populardata = getRandomFeaturedAnime(data);

        setPopulardata(populardata)
      }


    }
  }, [])



  return populardata?.length === 0 ? null : (
    <div className="w-full max-w-[96rem] relative mx-5 transition-colors">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-1.5 h-6 rounded-full bg-cyan-500"></span>
        <h2 className="text-slate-900 dark:text-slate-100 font-bold text-2xl sm:text-3xl font-['Outfit'] tracking-tight">
          Featured Anime
        </h2>
      </div>

      <div className="my-10 flex h-[24rem] relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-[#1E2235] shadow-2xl">
        <div className="absolute z-10 top-3 right-0 h-full max-[1348px]:hidden pointer-events-none">
          <Image src="/images/waifus/1.png" alt="Featured Waifu" width={350} height={344} quality={100} className="object-cover" />
        </div>

        <div className={styles.backgroundImage}>
          <Image src={populardata?.bannerImage} alt="Featured Banner" fill quality={100} className="object-cover !relative !h-[24rem] rounded-2xl aspect-[9/14]" />
        </div>

        <div className="absolute z-10 bottom-1/2 translate-y-1/2 max-[700px]:left-[12px] left-[2rem] flex gap-8">
          <div className="max-[990px]:hidden shrink-0">
            <Image src={populardata?.coverImage?.extraLarge} alt="Cover" width={200} height={340} className="object-cover rounded-xl shadow-2xl border border-white/20" />
          </div>

          <div className="max-w-xl">
            <h3 className="text-sm my-2 text-pink-400 font-semibold uppercase tracking-wider">#{data?.indexOf(populardata) + 1} Trending</h3>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl text-white font-bold tracking-tight line-clamp-1 font-['Outfit'] drop-shadow-md">
              {populardata?.title?.english || populardata?.title?.romaji}
            </h2>

            <div className="flex items-center gap-4 text-xs sm:text-sm my-2 text-slate-200">
              <span className="flex items-center gap-1">
                {populardata?.format}
              </span>

              <span className={populardata?.status === "RELEASING" ? "text-emerald-400 font-semibold" : "text-slate-300"}>
                {populardata?.status === "RELEASING" ? "● Airing" : populardata?.status}
              </span>

              <span className="flex items-center text-slate-300">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"][populardata?.startDate?.month]} {populardata?.startDate?.day}, {populardata?.startDate?.year}
              </span>

              <span className="flex items-center px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
                EP {populardata?.nextAiringEpisode?.episode ? populardata.nextAiringEpisode.episode - 1 : populardata?.episodes}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 leading-relaxed mt-2 mb-5 font-normal drop-shadow">
              {populardata?.description?.replace(/<[^>]*>/g, "")}
            </p>
            <Button text="Watch now" icon={<FaCirclePlay />} animeID={populardata?.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedAnime
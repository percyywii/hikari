"use client"
import Image from "next/image"
import styles from "./TrendingCard.module.css"
import { FaStar } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const TrendingCard = ({ info }) => {
  const [isTrailerFetched, setIsTrailerFetched] = useState(false)
  const [imageHovered, setImageHovered] = useState(false);
  const [trailer, setTrailer] = useState(null);
  const [videoPlay, setVideoPlay] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  const videoRef = useRef(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("setting.Hikari") || localStorage.getItem("setting.Tenro") || localStorage.getItem("setting.Taro") || '{}');
    setVideoPlay(Boolean(saved?.Preferences?.trendingCardVideo));
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    videoRef.current.playbackRate = 2;

    const changeCurrentTime = (e) => {
      const currentTime = Math.floor(e?.target?.currentTime)

      setCurrentTime(currentTime)
    };

    video.addEventListener("timeupdate", changeCurrentTime);

    return () => {
      video.removeEventListener("timeupdate", changeCurrentTime);
    };
  }, [trailer, imageHovered]);

  useEffect(() => {
    const fetch_and_set_data = async (id) => {
      if ((trailer !== null || !id) && isTrailerFetched) return

      const url = `/api/yt?id=${id}&q=480p`;
      const res = await fetch(url)

      if (res.ok) {
        const parsedData = await res.json()

        if (parsedData && parsedData?.url?.length > 0) {
          const webp_url = parsedData.url
            .filter(item => item.mimeType.includes("video/webm"))
          [0]?.url

          setTrailer(webp_url)
        }
      }

      setIsTrailerFetched(true)
    }

    if (imageHovered && !trailer && !isTrailerFetched) {
      fetch_and_set_data(info?.trailer?.id || null)
    }
  }, [imageHovered, info?.trailer?.id, isTrailerFetched, trailer])

  const HoverTime = 1000;
  let hoverTimer = null;



  const onMouseEnter = () => {
    if (videoPlay) {
      hoverTimer = setTimeout(() => {
        setImageHovered(true)
      }, HoverTime);
    }
  }


  const onMouseLeave = () => {
    if (!videoPlay) return
    clearTimeout(hoverTimer);
    setImageHovered(false);
  }

  return (
    <Link
      href={`/watch/${info?.id}`}
      className={`${styles.cardImage} w-full aspect-[9/14] rounded-2xl relative overflow-hidden cursor-pointer group`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {imageHovered && trailer ? <video
        ref={videoRef}
        src={trailer}
        className="object-cover w-full h-full rounded-2xl hover:cursor-pointer"
        poster={info?.coverImage?.extraLarge}
        preload="auto"
        autoPlay
        loop
        muted
      ></video> : <Image
        src={info?.coverImage?.extraLarge}
        alt="Trending"
        width={200}
        height={280}
        quality={100}
        className="object-cover w-full h-full rounded-2xl hover:cursor-pointer"
      />}


      {/* Apple-Grade Frosted Glass Rating Badge */}
      {info?.averageScore && (
        <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-amber-400 text-xs font-semibold shadow-md z-10">
          <FaStar className="w-3 h-3 text-amber-400" />
          <span>{(info.averageScore / 10).toFixed(1)}</span>
        </div>
      )}

      {/* Protective Dark Gradient Bottom Overlay with Legible Typography */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 pt-10 z-10 opacity-100 group-hover:opacity-90 transition-opacity">
        <h3 className="text-white font-semibold text-sm line-clamp-1 font-['Outfit'] drop-shadow">
          {info?.title?.english || info?.title?.romaji}
        </h3>
        <p className="text-slate-300 text-xs mt-0.5 drop-shadow">
          {info?.seasonYear ? `${info.seasonYear}` : ""}
          {info?.genres?.[0] ? ` • ${info.genres[0]}` : ""}
        </p>
      </div>

      {imageHovered && videoRef && videoRef?.current && (
        <div className="absolute bottom-0 left-0 w-full duration-100 h-1 z-50">
          <div
            className="w-0 rounded-md h-full bg-cyan-500 duration-100"
            style={{ width: `${(currentTime * 100) / videoRef.current.duration}%` }}
          ></div>
        </div>
      )}
    </Link>
  )
}

export default TrendingCard
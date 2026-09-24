"use client";
import { useEffect, useState, useRef } from "react";
import styles from "./HeroSection.module.css";

const Video = ({ populardata, setVideoError, setIsVideoReady, isVideoReady }) => {
  const [trailer, setTrailer] = useState(null);
  const [embedUrl, setEmbedUrl] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    async function fetchTrailer(trailerId) {
      try {
        if (trailerId) {
          const response = await fetch(`/api/yt?id=${trailerId}`);

          if (!response.ok) return setVideoError(true);
          const res = await response.json();
          setTrailer(res?.url || null);
          setEmbedUrl(res?.embedUrl || null);
          if (!res?.url && res?.embedUrl) setIsVideoReady(true);
        }
      } catch (error) {
        setVideoError(true);
        console.error("Error fetching trailer:", error);
      }
    }

    if (populardata && populardata.trailer) {
      fetchTrailer(populardata.trailer.id);
    }
  }, [populardata]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setIsVideoReady(true);
    };

    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, [trailer]);

  return (
    trailer ? (
      <video
        ref={videoRef}
        src={trailer}
        preload="auto"
        autoPlay
        loop
        muted
        aria-label="Anime trailer"
        className={`${styles.smoothTransform} relative aspect-[16/9] object-cover max-h-[800px] min-h-[460px] w-full`}
        style={{ display: !isVideoReady ? "none" : "" }}
      />
    ) : embedUrl ? (
      <iframe
        src={embedUrl}
        title="Anime trailer"
        className="relative aspect-[16/9] max-h-[800px] min-h-[460px] w-full object-cover"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    ) : null
  );
};

export default Video;

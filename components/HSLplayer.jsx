"use client"
import { useRef, useEffect } from 'react';
import Hls from 'hls.js';

const HLSPlayer = ({ url, startAtSeconds, controls, ondataloaded, speed }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return undefined;

    let disposed = false;
    const seekToStart = () => {
      if (Number.isFinite(startAtSeconds) && startAtSeconds > 0 && video.duration) {
        video.currentTime = Math.min(startAtSeconds, Math.max(video.duration - 1, 0));
      }
    };
    const startPlayback = () => {
      if (disposed) return;
      seekToStart();
      video.play().catch(() => {
        // Browsers may require a user gesture when controls are enabled.
      });
    };

    video.addEventListener('loadedmetadata', startPlayback);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        capLevelToPlayerSize: true,
        startLevel: -1,
        maxBufferLength: 30,
        backBufferLength: 30,
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, startPlayback);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data?.fatal || disposed) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
      });

      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // For browsers that support HLS natively
      video.src = url;
    }

    return () => {
      disposed = true;
      video.removeEventListener('loadedmetadata', startPlayback);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [url, startAtSeconds]);

  return (
    <video
      ref={videoRef}
      controls={controls || false}
      autoPlay={!controls}
      muted={!controls}
      preload={!controls ? "auto" : "metadata"}
      onCanPlay={() => ondataloaded?.(true)}
      onLoadStart={(event) => {
        event.currentTarget.playbackRate = speed || 1;
      }}
      className="w-full h-full object-cover"
    />

  );
};

export default HLSPlayer;

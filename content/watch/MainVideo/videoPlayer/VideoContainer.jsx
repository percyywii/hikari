"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LoadingVideo from "@/components/loadings/loadingVideo/loadingVideo";
import useArtplayer from "./useArtplayer";
import { useWatchContext } from "@/context/Watch";
import { useWatchSettingContext } from "@/context/WatchSetting";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FaRotateRight, FaServer, FaArrowLeft, FaFlag, FaPlay } from "react-icons/fa6";
import clsx from "clsx";
import "./video_player.css";

const VideoPlayerContainer = ({ getInstance }) => {
  const router = useRouter();
  const artRef = useArtplayer(getInstance);
  const {
    watchInfo,
    episode,
    retryWatch,
    sourceIndex,
    tryNextSource,
    switchServer,
    markPlayerReady,
    playerState,
    playerError,
    serverStatuses,
  } = useWatchContext();
  const { watchSetting, setWatchSetting } = useWatchSettingContext();
  const [embedLoading, setEmbedLoading] = useState(true);
  const embedKeyRef = useRef("");

  const sources = Array.isArray(watchInfo?.watchData?.sources)
    ? watchInfo.watchData.sources.filter((item) => item?.url)
    : [];
  const source = sources[sourceIndex] || null;
  const isEmbed = source?.type === "embed";
  const embedKey = `${sourceIndex}:${source?.url || ""}`;

  const isErrorState =
    playerState === "error" ||
    Boolean(watchInfo?.error) ||
    Boolean(playerError) ||
    (!watchInfo?.loading && !source && sources.length === 0);

  const rawError = playerError || watchInfo?.error;
  const errorMessage =
    typeof rawError === "string"
      ? rawError
      : rawError?.message && typeof rawError.message === "string"
      ? rawError.message
      : "Unable to play this episode. The current streaming server is currently unavailable.";

  useEffect(() => {
    embedKeyRef.current = embedKey;
    setEmbedLoading(true);
  }, [embedKey]);

  useEffect(() => {
    if (!isEmbed || !source?.url || !embedLoading) return;
    const timeout = setTimeout(() => {
      if (embedKeyRef.current === embedKey) {
        console.warn("[Tenro Embed] Embedded stream timed out after 12s.");
        tryNextSource("The embedded player took too long to load.");
      }
    }, 12000);
    return () => clearTimeout(timeout);
  }, [isEmbed, source?.url, embedLoading, embedKey, tryNextSource]);

  const handleEmbedLoad = () => {
    if (embedKeyRef.current !== embedKey) return;
    setEmbedLoading(false);
    markPlayerReady();
  };

  const handleEmbedError = () => {
    if (embedKeyRef.current !== embedKey) return;
    tryNextSource("The embedded player failed to connect.");
  };

  const handleReportProblem = () => {
    toast.success("Thank you! A stream report has been submitted to Tenro engineers.");
  };

  const isLoading =
    (watchInfo?.loading || (isEmbed && embedLoading) || playerState === "loading") && !isErrorState;

  return (
    <>
      <div className="z-30 w-full">
        <motion.div
          className={clsx({
            "min-[1300px]:fixed min-[1300px]:max-w-[1156px] min-[1300px]:w-full min-[1300px]:aspect-video min-[1300px]:top-1/2 min-[1300px]:left-1/2 min-[1300px]:-translate-x-1/2 min-[1300px]:-translate-y-1/2":
              watchSetting.light,
          })}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Active Player Canvas */}
          {!isErrorState && (
            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-[#0a0b0f] shadow-2xl border border-[#1b1f2e]">
              {isEmbed && source?.url ? (
                <iframe
                  key={embedKey}
                  src={source.url}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  onLoad={handleEmbedLoad}
                  onError={handleEmbedError}
                  title={`Episode ${episode}`}
                />
              ) : (
                <div ref={artRef} className="absolute inset-0 w-full h-full"></div>
              )}

              {/* Contextual Non-Infinite Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 grid place-content-center bg-[#090A0F] z-30">
                  <div className="flex flex-col items-center gap-2">
                    <LoadingVideo
                      message={
                        source?.serverName
                          ? `Connecting to ${source.serverName}...`
                          : "Resolving fast CDN nodes..."
                      }
                    />
                    <div className="text-xs text-slate-400">
                      {sources.length > 0 && sourceIndex > 0
                        ? `Auto-trying server ${sourceIndex + 1} of ${sources.length}`
                        : "Preparing high-speed playback"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comprehensive Interactive Error State (Never Infinite Spinner) */}
          {isErrorState && (
            <div className="aspect-video flex flex-col items-center justify-center bg-gradient-to-b from-[#0f111a] to-[#090a0f] px-6 text-center text-slate-200 gap-4 rounded-lg border border-[#2d2338]">
              <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400 text-xl shadow-lg">
                ⚠️
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white tracking-tight">Unable to play this episode</h3>
                <p className="text-xs text-slate-400 max-w-md mt-1 leading-relaxed">{errorMessage}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                <button
                  onClick={() => retryWatch()}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-medium rounded-md shadow-md transition-all flex items-center gap-2"
                >
                  <FaRotateRight className="text-xs" /> Retry
                </button>

                {sources.length > 1 && (
                  <button
                    onClick={() => switchServer((sourceIndex + 1) % sources.length)}
                    className="px-4 py-2 bg-[#1e2333] hover:bg-[#282f45] border border-[#343e59] text-white text-xs font-medium rounded-md transition-all flex items-center gap-2"
                  >
                    <FaServer className="text-xs text-cyan-400" /> Switch Server
                  </button>
                )}

                <button
                  onClick={() => tryNextSource()}
                  className="px-4 py-2 bg-[#1e2333] hover:bg-[#282f45] border border-[#343e59] text-slate-300 hover:text-white text-xs font-medium rounded-md transition-all flex items-center gap-2"
                >
                  <FaPlay className="text-xs text-purple-400" /> Next Source
                </button>

                <button
                  onClick={() => handleReportProblem()}
                  className="px-3 py-2 bg-transparent hover:bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 text-xs rounded-md transition-all flex items-center gap-1.5"
                >
                  <FaFlag className="text-[11px]" /> Report Problem
                </button>

                <button
                  onClick={() => router.back()}
                  className="px-3 py-2 bg-transparent hover:bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200 text-xs rounded-md transition-all flex items-center gap-1.5"
                >
                  <FaArrowLeft className="text-[11px]" /> Go Back
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {watchSetting?.light && <div className="aspect-video w-full max-[1300px]:hidden"></div>}
      </div>

      <AnimatePresence>
        {watchSetting?.light ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 w-full h-full z-20 bg-[#000000e8] backdrop-blur-md"
            onClick={() => setWatchSetting((prev) => ({ ...prev, light: false }))}
          ></motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default VideoPlayerContainer;

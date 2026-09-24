"use client";

import { useWatchContext } from "@/context/Watch";
import EpInfo from "./EpInfo";
import Option from "./Option";
import Server from "./Server";
import VideoPlayer from "./videoPlayer/VideoPlayer";
import StreamDebugBadge from "@/components/debug/StreamDebugBadge";

const MainVideo = () => {
  const { episode } = useWatchContext();

  return (
    <div className="w-full bg-[#10121A] border border-[#1E2235] rounded-xl p-2 !pb-3 flex flex-col shadow-xl shadow-black/30">
      <VideoPlayer />

      <Option />

      <div className="min-h-[90px] bg-[#0B0D13] text-slate-100 flex rounded-lg overflow-hidden mt-3 border border-[#1A1D2B] shadow-inner max-[880px]:flex-col">
        <EpInfo episode={episode} />
        <Server />
      </div>

      <StreamDebugBadge />
    </div>
  );
};

export default MainVideo;
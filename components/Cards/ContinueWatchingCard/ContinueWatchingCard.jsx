"use client"
import HLSPlayer from "@/components/HSLplayer";
import clsx from "clsx";
import Image from "next/image"
import Link from "next/link";
import { FaPlay } from "react-icons/fa6";

const ContinueWatchingCard = ({ data, hidden }) => {

  if (hidden) {
    return <div className=""></div>
  }

  return (
    <Link
      className="w-full h-full aspect-video cursor-pointer rounded-xl relative overflow-hidden border border-slate-200 dark:border-[#22212c] bg-slate-100 dark:bg-[#22212c] group shadow-sm hover:shadow-md transition-all"
      href={`/watch/${data?.id}?ep=${data?.episode}${data?.videoURL ? `&videoURL=${data?.videoURL}` : ""}`}
    >
      <Image
        src={data?.thumbnail}
        alt="thumbnail"
        height={284}
        width={388}
        className="object-cover w-full h-full group-hover:scale-105 duration-300"
      />

      <div className="w-full h-20 absolute flex flex-col justify-between bottom-0 after:content-[''] after:w-full after:h-28 after:absolute after:bottom-0 after:bg-[linear-gradient(360deg,#060602,#00000069,transparent)] force-white" data-overlay>
        <div className="flex flex-col mx-3 justify-between gap-3 z-10 force-white">

          <div className="flex items-center justify-between w-full force-white">
            <div>
              <div className="text-white w-full text-wrap break-words overflow-hidden text-ellipsis line-clamp-1 font-['Outfit'] font-semibold text-base cursor-pointer hover:text-cyan-300 force-white">{data?.title}</div>
              <div className="text-slate-200 font-['Outfit'] text-[13px] force-white font-medium">Episode: {data?.episode}</div>
            </div>

            <div className="p-3 rounded-full flex items-center justify-center bg-black/60 text-white cursor-pointer border border-white/20 backdrop-blur-md hover:bg-cyan-500 hover:text-black duration-200 force-white">
              <FaPlay className="w-3 h-3 ml-0.5" />
            </div>

          </div>

          <div className="w-full bg-[#404141] h-1 rounded-md">
            <div
              className="h-full bg-[#dd8dae] rounded-md"
              style={{ width: `${(data?.currentTime * 100 / data?.duration) || 0}%` }}
            ></div>
          </div>

        </div>


      </div>
    </Link>
  )
}

export default ContinueWatchingCard
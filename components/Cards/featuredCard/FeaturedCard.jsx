import Image from "next/image";
import Link from "next/link";
import styles from "./featuredCard.module.css";
import { FaArrowRight } from "react-icons/fa6";

const FeaturedCard = ({ data }) => {
  const targetUrl =
    data?.href ||
    `/catalog?genres=${encodeURIComponent(JSON.stringify([data?.genre || "Action"]))}&sort=POPULARITY_DESC`;

  return (
    <Link
      href={targetUrl}
      className={`${styles.card} group block transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 border border-slate-700/30 overflow-hidden shadow-lg hover:shadow-cyan-500/10 cursor-pointer`}
    >
      <div className="flex items-center justify-between w-full z-[2] relative px-2 mt-1">
        <h1 className="text-white text-lg sm:text-xl font-['Rubik'] font-semibold group-hover:text-cyan-400 transition-colors">
          {data?.text}
        </h1>
        <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 group-hover:bg-cyan-500/25 transition-colors">
          <span>Explore</span>
          <FaArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>

      <div className="mt-6 flex justify-center items-center w-full relative top-8 translate-x-6 z-[2]">
        <div className="border-4 border-[#6f6b8a] -rotate-12 rounded-2xl overflow-hidden w-max shadow-xl group-hover:-rotate-16 transition-transform duration-300">
          <Image
            src={data?.image[0]}
            alt={data?.text || "Collection"}
            width={140}
            height={220}
            quality={60}
            className="object-cover h-[180px] w-[120px]"
          />
        </div>
        <div className="border-4 border-[#6f6b8a] -rotate-2 z-[1] rounded-2xl overflow-hidden w-max relative top-2 right-8 shadow-xl group-hover:scale-105 transition-transform duration-300">
          <Image
            src={data?.image[1]}
            alt={data?.text || "Collection"}
            quality={60}
            width={140}
            height={220}
            className="object-cover h-[180px] w-[120px]"
          />
        </div>
        <div className="border-4 border-[#6f6b8a] z-[2] rotate-12 rounded-2xl overflow-hidden w-max relative top-10 right-20 shadow-xl group-hover:rotate-16 transition-transform duration-300">
          <Image
            src={data?.image[2]}
            alt={data?.text || "Collection"}
            quality={60}
            width={140}
            height={220}
            className="object-cover h-[180px] w-[120px]"
          />
        </div>
      </div>
    </Link>
  );
};

export default FeaturedCard;
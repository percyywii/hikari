import TrendingCard from "@/components/Cards/TrendingCard/TrendingCard";
import { Fragment } from "react";

const Trending = ({ data }) => {
  return (
    <div className="w-full max-w-[96rem] relative bottom-28 mx-5 max-[1270px]:bottom-0 max-[1270px]:mt-6 max-[1270px]:mb-8 transition-colors">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-1.5 h-6 rounded-full bg-cyan-500"></span>
        <h2 className="text-slate-900 dark:text-slate-100 font-bold text-2xl sm:text-3xl font-['Outfit'] tracking-tight">
          Currently Trending
        </h2>
      </div>

      <div className="grid grid-auto-fit gap-4">
        {data
          ?.filter(
            (item) =>
              item.trailer &&
              item.trailer.id &&
              item.id !== 21 &&
              item.bannerImage !== null &&
              item.status !== "NOT_YET_RELEASED"
          )
          .slice(0, 8)
          .map((item, index) => (
            <Fragment key={item.id || index}>
              <TrendingCard info={item} />
            </Fragment>
          ))}
      </div>
    </div>
  );
};

export default Trending;
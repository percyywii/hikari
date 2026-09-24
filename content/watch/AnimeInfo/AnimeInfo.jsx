import Image from "next/image";
import Link from "next/link";

const AnimeInfo = ({ info }) => {
  const title = info?.title?.english || info?.title?.romaji || info?.title?.userPreferred || "Anime";
  const cleanDescription = info?.description?.replace(/<[^>]*>/g, "") || "No synopsis available.";

  return (
    <div className="flex gap-6 max-[768px]:flex-col text-slate-900 dark:text-white transition-colors">
      <div className="shrink-0">
        <Image
          src={info?.coverImage?.extraLarge || info?.coverImage?.large || "/placeholder.png"}
          alt={title}
          width={220}
          height={320}
          className="rounded-2xl object-cover h-80 w-[15rem] max-[840px]:h-[14rem] max-[380px]:h-[10rem] shadow-xl border border-slate-200/80 dark:border-[#1E2235]"
        />
      </div>

      <div className="mt-1 flex-1 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-['Outfit'] font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h1>

        <div className="flex items-center gap-2 mt-2 mb-3">
          <span className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-xs px-2 py-0.5 rounded-md font-semibold">
            HD 1080p
          </span>
          <span className="bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs px-2 py-0.5 rounded-md font-medium">
            Multi-Sub
          </span>
          {info?.averageScore && (
            <span className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs px-2 py-0.5 rounded-md font-semibold">
              ★ {(info.averageScore / 10).toFixed(1)} / 10
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed overflow-hidden text-ellipsis line-clamp-4 mb-4">
          {cleanDescription}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-xs sm:text-sm border-t border-slate-200/80 dark:border-[#1E2235] pt-3">
          <div className="space-y-1 text-slate-600 dark:text-slate-400">
            {info?.format && (
              <div>
                <span className="font-medium text-slate-500 dark:text-slate-400">Type: </span>
                <Link href={`/catalog?type=${info?.format}&sort=POPULARITY_DESC`} className="text-cyan-600 dark:text-cyan-400 hover:underline font-semibold">
                  {info?.format}
                </Link>
              </div>
            )}
            {info?.countryOfOrigin && (
              <div>
                <span className="font-medium text-slate-500 dark:text-slate-400">Country: </span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{info?.countryOfOrigin}</span>
              </div>
            )}
            {info?.startDate?.year && (
              <div>
                <span className="font-medium text-slate-500 dark:text-slate-400">Premiered: </span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][info?.startDate?.month - 1 || 0]} {info?.startDate?.day || 1}, {info?.startDate?.year}
                </span>
              </div>
            )}
            {info?.seasonYear && (
              <div>
                <span className="font-medium text-slate-500 dark:text-slate-400">Season Year: </span>
                <Link href={`/year/${info?.seasonYear}`} className="text-cyan-600 dark:text-cyan-400 hover:underline font-semibold">
                  {info?.seasonYear}
                </Link>
              </div>
            )}
            {info?.status && (
              <div>
                <span className="font-medium text-slate-500 dark:text-slate-400">Status: </span>
                <span className={info?.status === "RELEASING" ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-800 dark:text-slate-200"}>
                  {info?.status}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1 text-slate-600 dark:text-slate-400">
            {info?.genres && info.genres.length > 0 && (
              <div>
                <span className="font-medium text-slate-500 dark:text-slate-400">Genres: </span>
                <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
                  {info.genres.map((genre, idx) => (
                    <Link key={genre} href={`/catalog?genres=%5B"${genre}"%5D&sort=POPULARITY_DESC`} className="hover:underline">
                      {genre}{idx < info.genres.length - 1 ? ", " : ""}
                    </Link>
                  ))}
                </span>
              </div>
            )}
            {info?.episodes && (
              <div>
                <span className="font-medium text-slate-500 dark:text-slate-400">Episodes: </span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{info?.episodes}</span>
              </div>
            )}
            {info?.duration && (
              <div>
                <span className="font-medium text-slate-500 dark:text-slate-400">Duration: </span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{info?.duration} min</span>
              </div>
            )}
            {info?.studios?.nodes?.[0]?.name && (
              <div>
                <span className="font-medium text-slate-500 dark:text-slate-400">Studio: </span>
                <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{info?.studios?.nodes[0]?.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeInfo;
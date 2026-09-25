import FeaturedCard from "@/components/Cards/featuredCard/FeaturedCard";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";

const Collection = () => {
  const data = [
    {
      text: "Action & Shounen Hits",
      genre: "Action",
      href: `/catalog?genres=%5B"Action"%5D&sort=POPULARITY_DESC`,
      image: [
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101302-7L0lcwYeFQQM.jpg",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx127230-NuHM32a3VJsb.png",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171627-EzihNzljlKKs.jpg",
      ],
    },
    {
      text: "Romance & Drama",
      genre: "Romance",
      href: `/catalog?genres=%5B"Romance"%5D&sort=POPULARITY_DESC`,
      image: [
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx9260-tbZARfVq8JoX.png",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/21650-qFjRMXrw1jku.jpg",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx97863-79AXrUZ7VQa5.jpg",
      ],
    },
    {
      text: "Fantasy & Supernatural",
      genre: "Fantasy",
      href: `/catalog?genres=%5B"Fantasy"%5D&sort=POPULARITY_DESC`,
      image: [
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-n2bcsTF7SN0U.jpg",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx108465-b778p9L5wJ7A.jpg",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-m5ZMNScFlOdW.jpg",
      ],
    },
    {
      text: "Sci-Fi & Cyberpunk",
      genre: "Sci-Fi",
      href: `/catalog?genres=%5B"Sci-Fi"%5D&sort=POPULARITY_DESC`,
      image: [
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx128893-n2eC3jG9mH8x.jpg",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1-CXtrrkB3y8rP.png",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx9253-7pdcVzQSkpKq.png",
      ],
    },
    {
      text: "Comedy & Slice of Life",
      genre: "Comedy",
      href: `/catalog?genres=%5B"Comedy"%5D&sort=POPULARITY_DESC`,
      image: [
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-vNeHiCLivOD3.jpg",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx130298-O7nR1Wrav2dH.jpg",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx148109-cwAINDGwAHB2.jpg",
      ],
    },
    {
      text: "Supernatural & Mystery",
      genre: "Supernatural",
      href: `/catalog?genres=%5B"Supernatural"%5D&sort=POPULARITY_DESC`,
      image: [
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1535-lawCwhqnflbR.jpg",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20605-4gLd3HkI9ZzB.jpg",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx131573-0wO0L6bQ4rE1.jpg",
      ],
    },
  ];

  return (
    <div className="w-full max-w-[96rem] relative mx-5 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-6 rounded-full bg-cyan-500"></span>
          <h2 className="text-slate-900 dark:text-slate-100 font-bold text-2xl sm:text-3xl font-['Outfit'] tracking-tight">
            Featured Collections
          </h2>
        </div>

        <Link
          href="/catalog"
          className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm font-semibold transition-colors group"
        >
          <span>See All</span>
          <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="mb-20 grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-5">
        {data.map((item, index) => (
          <FeaturedCard key={index} data={item} />
        ))}
      </div>
    </div>
  );
};

export default Collection;
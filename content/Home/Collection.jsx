import FeaturedCard from "@/components/Cards/featuredCard/FeaturedCard"
import { FaArrowRight } from "react-icons/fa6";

const Collection = () => {
  const data = [
    {
      text: "The best of ecchi",
      image: [
        "https://media.themoviedb.org/t/p/w220_and_h330_face/uTb2twGxJuJN0qdcz3yQQfIHOrN.jpg",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx148109-cwAINDGwAHB2.jpg",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx130298-O7nR1Wrav2dH.jpg",
      ]
    },
    {
      text: "The best of romance",
      image: [
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx9260-tbZARfVq8JoX.png",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/21650-qFjRMXrw1jku.jpg",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx97863-79AXrUZ7VQa5.jpg",
      ]
    },
    {
      text: "The best of Shounen",
      image: [
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101302-7L0lcwYeFQQM.jpg",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx127230-NuHM32a3VJsb.png",
        "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx171627-EzihNzljlKKs.jpg",
      ]
    }
  ]
  return (
    <div className="w-full max-w-[96rem] relative mx-5 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-6 rounded-full bg-cyan-500"></span>
          <h2 className="text-slate-900 dark:text-slate-100 font-bold text-2xl sm:text-3xl font-['Outfit'] tracking-tight">
            Featured Collections
          </h2>
        </div>

        <div className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm font-semibold transition-colors">
          <span>See All</span>
          <FaArrowRight className="w-3 h-3" />
        </div>
      </div>

      <div className="mb-32 grid grid-cols-[repeat(auto-fit,minmax(345px,1fr))] gap-4">
        {data.map((item, index) => <FeaturedCard key={index} data={item} />)}
      </div>
    </div>
  )
}

export default Collection
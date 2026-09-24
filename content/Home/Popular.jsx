"use client"
import Card from "@/components/Cards/Card/Card"
import { PopularAnilist } from "@/lib/Anilistfunction"
import { useEffect, useState } from "react"

const Popular = () => {
  const [page, setPage] = useState(1)
  const [popularData, setPopularData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getPopular = async () => {
      setLoading(true)
      const data = await PopularAnilist(page)
      if (Array.isArray(data) && data.length > 0) {
        setPopularData((prev) => [...prev, ...data])
      }
      setLoading(false)
    }
    getPopular()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  return (
    <div className="w-full max-w-[96rem] relative bottom-28 mx-5 transition-colors">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-1.5 h-6 rounded-full bg-cyan-500"></span>
        <h2 className="text-slate-900 dark:text-slate-100 font-bold text-2xl sm:text-3xl font-['Outfit'] tracking-tight">
          Most Popular
        </h2>
      </div>

      <div className="grid grid-auto-fit gap-4">
        {popularData.map((item, index) => (
          <Card data={item} key={item?.id || index} />
        ))}
        {loading
          ? Array(page === 1 ? 20 : 13)
              .fill(0)
              .map((_, index) => <Card key={`skeleton-${index}`} loading />)
          : null}
      </div>

      <div className="mt-10 w-full flex justify-center">
        <button
          type="button"
          className="bg-slate-100 hover:bg-slate-200 dark:bg-[#1A1D2B] dark:hover:bg-[#252A3D] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#23283E] cursor-pointer w-full max-w-md text-center py-3 rounded-xl font-semibold text-sm shadow-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          onClick={() => setPage((prev) => prev + 1)}
        >
          Load More Anime
        </button>
      </div>
    </div>
  )
}

export default Popular
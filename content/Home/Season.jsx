import Card from "@/components/Cards/Card/Card";

const Season = ({ data }) => {

  return (
    <div className="w-full max-w-[96rem] relative mt-6 mb-24 mx-5 transition-colors">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-1.5 h-6 rounded-full bg-cyan-500"></span>
        <h2 className="text-slate-900 dark:text-slate-100 font-bold text-2xl sm:text-3xl font-['Outfit'] tracking-tight">
          Most Popular This Season
        </h2>
      </div>

      <div className="mt-8 grid grid-auto-fit gap-3">
        {data?.map((item, index) => <Card data={item} key={item?.id || index} />)}
      </div>

    </div>
  )
}

export default Season
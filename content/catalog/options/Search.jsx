import { useRouter } from "next/navigation";

const Search = ({ search, setSearch, pathname }) => {
  const router = useRouter();

  return (
    <div>
      <div className="flex justify-between items-center cursor-pointer border-b border-slate-200 dark:border-[#1E2235] pb-2">
        <div className="text-slate-900 dark:text-slate-100 font-semibold font-['Outfit'] text-sm">
          Search
        </div>
      </div>

      <div className="bg-slate-100 dark:bg-[#161926] border border-slate-200 dark:border-[#23283E] px-3 py-2 w-full rounded-xl cursor-pointer mb-4 mt-3 focus-within:border-cyan-500/50 transition-colors">
        <input
          type="text"
          placeholder="Search catalog..."
          className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none font-medium"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              router.push(`${pathname}?search=${encodeURIComponent(search)}`);
            }
          }}
        />
      </div>
    </div>
  );
};

export default Search;
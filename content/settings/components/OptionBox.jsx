import Switch from "./Switch";

const OptionBox = ({ title, description, ischecked, setischecked }) => {
  return (
    <div className="flex justify-between items-center bg-white dark:bg-[#151827] border border-slate-200 dark:border-[#1E2235] mt-6 rounded-2xl py-6 h-min w-full px-6 shadow-sm transition-colors">
      <div className="my-1 pr-4">
        <p className="text-lg font-['Outfit'] font-bold text-slate-900 dark:text-white mb-1">
          {title}
        </p>
        <p className="max-w-[24rem] text-xs sm:text-sm font-['Outfit'] text-slate-600 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>

      <Switch isChecked={ischecked} setIsChecked={setischecked} />
    </div>
  );
};

export default OptionBox;
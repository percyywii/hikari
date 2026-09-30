const Title = ({ title }) => {
  return (
    <h1 className="text-2xl sm:text-3xl font-bold font-['Outfit'] text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-white/10 w-full tracking-tight">
      {title}
    </h1>
  );
};

export default Title;
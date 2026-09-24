import Link from "next/link";

const Button = ({ icon, text, animeID }) => {
  return (
    <Link
      href={`/watch/${animeID}`}
      className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all duration-200 group"
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
};

export default Button;
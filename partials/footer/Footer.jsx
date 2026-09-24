import { FaHeart } from "react-icons/fa6";
import HikariLogo from "@/components/branding/HikariLogo";
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-24 border-t border-slate-200/80 dark:border-[#1A1D2B] bg-slate-50/80 dark:bg-[#0A0C13] text-slate-600 dark:text-slate-400 text-xs py-8 px-4 sm:px-8 lg:px-16 z-10 relative transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <HikariLogo size={32} asLink />
          <div className="flex flex-col gap-1">
            <p className="text-slate-500 dark:text-slate-400 max-w-md text-[11px] leading-relaxed">
              Hikari does not store any files on our servers. All media is provided by non-affiliated third-party streaming services.
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              &copy; {currentYear} Hikari. All rights reserved.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 text-[12px]">
          <Link href="/" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
            Home
          </Link>
          <Link href="/catalog" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
            Catalog
          </Link>
          <Link href="/catalog?sort=TRENDING_DESC" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
            Trending
          </Link>
          <Link href="/continue-watching" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
            Continue Watching
          </Link>
          <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
            Crafted with <FaHeart className="w-3 h-3 text-rose-500 inline" /> for Anime Fans
          </span>
          <a
            href="https://instagram.com/itxz_baka"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors group px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10"
          >
            <span>Made with 💖 by</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-pink-500 dark:group-hover:text-pink-400">@itxz_baka</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
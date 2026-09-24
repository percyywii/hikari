"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./header.module.css";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Catalog", href: "/catalog" },
  { label: "Trending", href: "/catalog?sort=TRENDING_DESC" },
  { label: "Continue Watching", href: "/continue-watching" }
];

const Links = ({ isMobile, onClose }) => {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/catalog?")) {
      return pathname === "/catalog";
    }
    return pathname.startsWith(href);
  };

  if (isMobile) {
    return (
      <div className="flex flex-col h-full justify-start items-stretch p-2 gap-1 overflow-hidden">
        {NAV_LINKS.map((link, index) => {
          const active = isActive(link.href);
          return (
            <Link
              href={link.href}
              key={link.label}
              onClick={() => onClose && onClose()}
              className={`${
                active
                  ? "text-cyan-500 dark:text-cyan-400 bg-cyan-500/10 font-semibold border-cyan-500/30"
                  : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 border-transparent"
              } w-full text-left px-3 py-2 rounded-lg text-sm transition-colors border relative ${styles.animate_ltr}`}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {link.label}
            </Link>
          );
        })}

        <div className="border-t border-slate-200 dark:border-white/10 my-1 pt-1">
          <Link
            href="/profile"
            onClick={() => onClose && onClose()}
            className={`${
              pathname === "/profile"
                ? "text-cyan-500 dark:text-cyan-400 bg-cyan-500/10 font-semibold border-cyan-500/30"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 border-transparent"
            } w-full text-left px-3 py-2 rounded-lg text-sm transition-colors border flex items-center gap-2`}
          >
            Profile
          </Link>
          <Link
            href="/settings"
            onClick={() => onClose && onClose()}
            className={`${
              pathname === "/settings"
                ? "text-cyan-500 dark:text-cyan-400 bg-cyan-500/10 font-semibold border-cyan-500/30"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 border-transparent"
            } w-full text-left px-3 py-2 rounded-lg text-sm transition-colors border flex items-center gap-2`}
          >
            Settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 mt-0.5 max-[990px]:hidden">
      {NAV_LINKS.map((link, index) => {
        const active = isActive(link.href);
        return (
          <Link
            href={link.href}
            key={link.label}
            className={`${index === 0 ? "ml-4" : "ml-1"} px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              active
                ? "text-cyan-600 dark:text-cyan-400 font-semibold bg-cyan-500/10"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
};

export default Links;
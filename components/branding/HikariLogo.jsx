import Image from "next/image";
import Link from "next/link";

export default function HikariLogo({
  size = 38,
  showText = true,
  className = "",
  asLink = false,
}) {
  const content = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      <div className="relative flex items-center justify-center">
        <Image
          src="/images/logo.svg"
          alt="Hikari Logo"
          width={size}
          height={size}
          className="transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_14px_rgba(56,189,248,0.45)]"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-sky-400 via-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">
              HIKARI
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-500/30 tracking-tight">
              光
            </span>
          </div>
          <span className="text-[9px] uppercase tracking-[0.22em] text-slate-400 font-medium">
            Anime Stream
          </span>
        </div>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link href="/" className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}

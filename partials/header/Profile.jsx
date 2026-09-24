"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import Dropdown from "./Dropdown";

const Profile = () => {
  const { data, status } = useSession();
  const [isToggled, setIsToggled] = useState(false);
  const containerRef = useRef(null);

  const isLoggedIn = status === "authenticated";

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsToggled(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const avatarSrc = isLoggedIn
    ? data?.user?.image?.medium || data?.user?.image?.large || "/images/logo.png"
    : "/images/logo.png";

  return (
    <div ref={containerRef} className="relative select-none">
      <button
        type="button"
        onClick={() => setIsToggled((prev) => !prev)}
        className="relative flex items-center justify-center p-0.5 rounded-full ring-2 ring-slate-200/90 dark:ring-[#23283E] hover:ring-cyan-500/70 focus:outline-none focus:ring-cyan-500 transition-all cursor-pointer shadow-sm group"
        aria-label="User Profile"
      >
        <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-slate-100 dark:bg-[#161926]">
          <Image
            src={avatarSrc}
            alt="Profile Avatar"
            fill
            sizes="36px"
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      </button>

      {isToggled && (
        <Dropdown
          data={data}
          isLoggedIn={isLoggedIn}
          onClose={() => setIsToggled(false)}
        />
      )}
    </div>
  );
};

export default Profile;
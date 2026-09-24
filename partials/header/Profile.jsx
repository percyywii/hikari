"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef, useCallback } from "react";
import Dropdown from "./Dropdown";

const Profile = () => {
  const { data, status } = useSession();
  const [isToggled, setIsToggled] = useState(false);
  const containerRef = useRef(null);

  const isLoggedIn = status === "authenticated";

  // Close dropdown on click/touch outside
  useEffect(() => {
    const handleOutsideInteraction = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsToggled(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideInteraction);
    document.addEventListener("touchstart", handleOutsideInteraction, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleOutsideInteraction);
      document.removeEventListener("touchstart", handleOutsideInteraction);
    };
  }, []);

  const handleToggle = useCallback((e) => {
    e.stopPropagation();
    setIsToggled((prev) => !prev);
  }, []);

  const avatarSrc = isLoggedIn
    ? data?.user?.image?.medium || data?.user?.image?.large || "/images/logo.png"
    : "/images/logo.png";

  return (
    <div ref={containerRef} className="relative select-none z-50">
      <button
        type="button"
        onClick={handleToggle}
        className="relative flex items-center justify-center p-0.5 rounded-full ring-2 ring-slate-200/90 dark:ring-[#23283E] hover:ring-cyan-500/70 focus:outline-none focus:ring-cyan-500 transition-all cursor-pointer shadow-sm group touch-manipulation"
        aria-label="User Profile"
        aria-expanded={isToggled}
      >
        <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-slate-100 dark:bg-[#161926] pointer-events-none">
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
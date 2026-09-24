import styles from "./header.module.css";
import Links from "./Links";
import Search from "./Search";
import { PiBellRingingFill as Bell } from "react-icons/pi";
import Responsive from "./Responsive";
import Profile from "./Profile";
import HikariLogo from "@/components/branding/HikariLogo";
import ThemeToggle from "@/components/theme/ThemeToggle";

const Header = () => {
  return (
    <header className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.left}>
          <Responsive />
          <HikariLogo asLink size={36} />
          <Links />
        </div>

        <div className={styles.right}>
          <Search />

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* Notification icon (desktop) */}
          <button
            type="button"
            className="hidden sm:flex text-xl text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-[#161926] transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell />
          </button>

          {/* Profile */}
          <Profile />
        </div>
      </div>
    </header>
  );
};

export default Header;
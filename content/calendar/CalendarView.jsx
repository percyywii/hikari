"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import ScheduleCard from "./ScheduleCard";
import {
  FaCalendarAlt,
  FaClock,
  FaSearch,
  FaSyncAlt,
  FaGlobeAmericas,
  FaTv,
  FaTimesCircle,
} from "react-icons/fa";

const DAYS_OF_WEEK = [
  "All Days",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const CACHE_KEY = "hikari_schedule_v2";
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

export default function CalendarView() {
  const [scheduleData, setScheduleData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState("All Days");
  const [searchQuery, setSearchQuery] = useState("");
  const [userTimezone, setUserTimezone] = useState("Local");
  const [todayName, setTodayName] = useState("");
  const [nowTimestamp, setNowTimestamp] = useState(Math.floor(Date.now() / 1000));
  const [lastUpdatedTime, setLastUpdatedTime] = useState("");

  // Detect user's timezone and today's day
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
      setUserTimezone(tz);
      const curDay = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());
      setTodayName(curDay);
      setSelectedDay(curDay);
    } catch {
      setUserTimezone("Local");
      setTodayName("Monday");
      setSelectedDay("All Days");
    }
  }, []);

  // Update clock ticker every 30 seconds for live countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTimestamp(Math.floor(Date.now() / 1000));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Fetch schedule with localStorage cache
  const fetchSchedule = useCallback(async (force = false) => {
    setIsLoading(true);
    setError(null);

    if (!force && typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          const age = Date.now() - (parsed.timestamp || 0);
          if (age < CACHE_TTL_MS && Array.isArray(parsed.data) && parsed.data.length > 0) {
            setScheduleData(parsed.data);
            setLastUpdatedTime(
              new Date(parsed.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            );
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // ignore parse error and fetch fresh
      }
    }

    try {
      const res = await fetch("/api/anime/schedule?limit=150");
      if (!res.ok) {
        throw new Error(`Schedule API error: ${res.status}`);
      }
      const json = await res.json();
      if (json.success && Array.isArray(json.schedule)) {
        setScheduleData(json.schedule);
        const ts = Date.now();
        setLastUpdatedTime(
          new Date(ts).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              data: json.schedule,
              timestamp: ts,
            })
          );
        } catch {
          // ignore quota error
        }
      } else {
        throw new Error(json.error || "No schedule items returned");
      }
    } catch (err) {
      console.error("Failed to load schedule:", err);
      setError(err.message || "Failed to load broadcast schedule");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // Convert items into user's local timezone
  const processedItems = useMemo(() => {
    return scheduleData.map((item) => {
      let localWeekday = "Unknown";
      let localTime = "TBA";
      let localDateLabel = "";

      if (item.airingAt) {
        const dateObj = new Date(item.airingAt * 1000);
        try {
          const tzOption = userTimezone === "Local" ? undefined : userTimezone;
          localWeekday = new Intl.DateTimeFormat("en-US", {
            timeZone: tzOption,
            weekday: "long",
          }).format(dateObj);

          localTime = dateObj.toLocaleTimeString([], {
            timeZone: tzOption,
            hour: "2-digit",
            minute: "2-digit",
          });

          localDateLabel = new Intl.DateTimeFormat("en-US", {
            timeZone: tzOption,
            month: "short",
            day: "numeric",
          }).format(dateObj);
        } catch {
          localWeekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(dateObj);
          localTime = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        }
      }

      return {
        ...item,
        localWeekday,
        localTime,
        localDateLabel,
        isToday: localWeekday.toLowerCase() === todayName.toLowerCase(),
      };
    });
  }, [scheduleData, userTimezone, todayName]);

  // Compute counts per day
  const dayCounts = useMemo(() => {
    const counts = { "All Days": processedItems.length };
    DAYS_OF_WEEK.slice(1).forEach((day) => {
      counts[day] = 0;
    });
    processedItems.forEach((item) => {
      if (counts[item.localWeekday] !== undefined) {
        counts[item.localWeekday]++;
      }
    });
    return counts;
  }, [processedItems]);

  // Filter items by selected day and search query
  const filteredItems = useMemo(() => {
    let result = processedItems;

    if (selectedDay !== "All Days") {
      result = result.filter(
        (item) => item.localWeekday.toLowerCase() === selectedDay.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        const titleMatch = (item.title || "").toLowerCase().includes(q);
        const genreMatch = item.genres?.some((g) => g.toLowerCase().includes(q));
        const studioMatch = (item.studio || "").toLowerCase().includes(q);
        return titleMatch || genreMatch || studioMatch;
      });
    }

    return result.sort((a, b) => (a.airingAt || 0) - (b.airingAt || 0));
  }, [processedItems, selectedDay, searchQuery]);

  return (
    <div className="w-full max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      {/* Top Banner / Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-slate-200/80 dark:border-[#1E2235]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs sm:text-sm font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            <span>Official Broadcast Calendar</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            Release Schedule
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Live weekly anime broadcast dates and airing times automatically synced to your local
            timezone with real-time episode countdowns.
          </p>
        </div>

        {/* Local Timezone & Status Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#151827] border border-slate-200 dark:border-[#1E2235] text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
            <FaGlobeAmericas className="text-cyan-500 w-3.5 h-3.5" />
            <span className="truncate max-w-[170px]" title={userTimezone}>
              {userTimezone}
            </span>
          </div>

          <button
            type="button"
            onClick={() => fetchSchedule(true)}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#151827] dark:hover:bg-[#1D2136] border border-slate-200 dark:border-[#1E2235] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            title="Refresh broadcast schedule"
          >
            <FaSyncAlt className={`w-3 h-3 ${isLoading ? "animate-spin text-cyan-500" : ""}`} />
            <span>{isLoading ? "Syncing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Controls Bar: Search & Day Tabs */}
      <div className="space-y-4 mb-8">
        {/* Search Bar */}
        <div className="relative max-w-md w-full">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scheduled anime, genre, studio..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-[#12141F] border border-slate-200 dark:border-[#1E2235] focus:border-cyan-500 dark:focus:border-cyan-500 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm shadow-sm transition-all focus:outline-hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <FaTimesCircle className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Days of the Week Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDay === day;
            const isToday = day.toLowerCase() === todayName.toLowerCase();
            const count = dayCounts[day] || 0;

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer shadow-xs ${
                  isSelected
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 scale-[1.02]"
                    : "bg-white dark:bg-[#12141F] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#1E2235] hover:border-cyan-500/40"
                }`}
              >
                <span>{day}</span>
                {isToday && (
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? "bg-slate-950 text-cyan-400"
                        : "bg-cyan-500/20 text-cyan-600 dark:text-cyan-300"
                    }`}
                  >
                    Today
                  </span>
                )}
                <span
                  className={`text-[11px] font-medium px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? "bg-slate-950/20 text-slate-950"
                      : "bg-slate-100 dark:bg-[#1A1D2B] text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid Content */}
      {isLoading && scheduleData.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(9)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-2xl bg-white dark:bg-[#12141F] border border-slate-200 dark:border-[#1E2235] p-3.5 flex gap-3 animate-pulse"
              >
                <div className="w-28 h-full bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0" />
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="space-y-2">
                    <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="w-full h-5 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="w-2/3 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                  <div className="w-16 h-7 bg-slate-200 dark:bg-slate-800 rounded-lg self-end" />
                </div>
              </div>
            ))}
        </div>
      ) : error && scheduleData.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white dark:bg-[#12141F] border border-rose-500/20 p-8">
          <FaTv className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Unable to load broadcast calendar
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            {error}
          </p>
          <button
            type="button"
            onClick={() => fetchSchedule(true)}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm cursor-pointer shadow-md"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-white dark:bg-[#12141F] border border-slate-200 dark:border-[#1E2235] p-8">
          <FaCalendarAlt className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            No scheduled anime found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            {searchQuery
              ? `No releases matching "${searchQuery}" on ${selectedDay}.`
              : `There are currently no broadcasts recorded for ${selectedDay}.`}
          </p>
          <div className="flex items-center justify-center gap-3">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#1A1D2B] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#23283E] text-sm font-semibold cursor-pointer"
              >
                Clear Search
              </button>
            )}
            {selectedDay !== "All Days" && (
              <button
                type="button"
                onClick={() => setSelectedDay("All Days")}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold cursor-pointer shadow-md"
              >
                View All Days
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <ScheduleCard
              key={`${item.id}-${item.episode || "airing"}`}
              item={item}
              nowTimestamp={nowTimestamp}
            />
          ))}
        </div>
      )}

      {/* Footer Info / Cache Stamp */}
      {lastUpdatedTime && (
        <div className="mt-10 text-center text-xs text-slate-600 dark:text-slate-400">
          Broadcast data refreshed at {lastUpdatedTime} • Auto-syncs every 30 minutes
        </div>
      )}
    </div>
  );
}

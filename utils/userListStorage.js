"use client";

import { updatelist } from "@/lib/anilistqueries";

export const LIST_CATEGORIES = [
  { id: "CURRENT", title: "Watching", label: "Watching" },
  { id: "PLANNING", title: "To Watch", label: "Plan to Watch" },
  { id: "COMPLETED", title: "Watched", label: "Completed" },
  { id: "PAUSED", title: "On Hold", label: "On Hold" },
  { id: "DROPPED", title: "Dropped", label: "Dropped" },
];

const STORAGE_KEY = "hikari_user_lists";
const LEGACY_KEYS = ["user_lists", "tenro_user_lists"];

/**
 * Safely parse JSON from storage.
 */
function safeParse(str, fallback) {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Get raw lists object: { CURRENT: [], PLANNING: [], COMPLETED: [], PAUSED: [], DROPPED: [] }
 */
export function getRawLists() {
  if (typeof window === "undefined") {
    return { CURRENT: [], PLANNING: [], COMPLETED: [], PAUSED: [], DROPPED: [] };
  }

  let data = safeParse(localStorage.getItem(STORAGE_KEY), null);

  // Fallback to legacy keys if primary is empty
  if (!data) {
    for (const legacy of LEGACY_KEYS) {
      const legacyData = safeParse(localStorage.getItem(legacy), null);
      if (legacyData && typeof legacyData === "object") {
        data = legacyData;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {}
        break;
      }
    }
  }

  const result = {
    CURRENT: Array.isArray(data?.CURRENT) ? data.CURRENT : [],
    PLANNING: Array.isArray(data?.PLANNING) ? data.PLANNING : [],
    COMPLETED: Array.isArray(data?.COMPLETED) ? data.COMPLETED : [],
    PAUSED: Array.isArray(data?.PAUSED) ? data.PAUSED : [],
    DROPPED: Array.isArray(data?.DROPPED) ? data.DROPPED : [],
  };

  return result;
}

/**
 * Save raw lists to localStorage and broadcast change event.
 */
export function saveRawLists(lists) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    window.dispatchEvent(new CustomEvent("hikari_lists_updated", { detail: lists }));
  } catch (err) {
    console.error("Failed to save lists to localStorage:", err);
  }
}

/**
 * Find which list category contains the anime.
 */
export function getMediaListStatus(animeId) {
  if (!animeId) return null;
  const numId = Number(animeId);
  const lists = getRawLists();

  for (const cat of LIST_CATEGORIES) {
    const found = (lists[cat.id] || []).find(
      (entry) => Number(entry.id) === numId || Number(entry.mediaId) === numId || Number(entry.media?.id) === numId
    );
    if (found) {
      return { status: cat.id, entry: found, categoryTitle: cat.title };
    }
  }
  return null;
}

/**
 * Add, move, or remove an anime entry in the user's lists.
 */
export async function setUserListEntry({ animeId, status, progress = 1, media = null, token = null }) {
  if (!animeId) return { success: false, error: "Missing anime ID" };

  const numId = Number(animeId);
  const lists = getRawLists();

  // Remove anime from all existing categories
  for (const key of Object.keys(lists)) {
    lists[key] = (lists[key] || []).filter(
      (e) => Number(e.id) !== numId && Number(e.mediaId) !== numId && Number(e.media?.id) !== numId
    );
  }

  let finalEntry = null;

  if (status && status !== "REMOVE") {
    const cleanMedia = {
      id: numId,
      title: {
        english: media?.title?.english || media?.title?.romaji || media?.title?.userPreferred || "Anime",
        romaji: media?.title?.romaji || media?.title?.english || "Anime",
        userPreferred: media?.title?.userPreferred || media?.title?.english || "Anime",
      },
      coverImage: {
        extraLarge: media?.coverImage?.extraLarge || media?.coverImage?.large || media?.coverImage?.medium || "/images/banner.jpg",
        large: media?.coverImage?.large || media?.coverImage?.extraLarge || "/images/banner.jpg",
        medium: media?.coverImage?.medium || "/images/banner.jpg",
      },
      status: media?.status || "FINISHED",
      format: media?.format || "TV",
      averageScore: media?.averageScore || null,
      genres: Array.isArray(media?.genres) ? media.genres : [],
      episodes: media?.episodes || null,
    };

    finalEntry = {
      id: numId,
      mediaId: numId,
      status: status,
      progress: Number(progress) || 1,
      updatedAt: Date.now(),
      media: cleanMedia,
    };

    if (!Array.isArray(lists[status])) {
      lists[status] = [];
    }
    // Prepend so recently added appears first
    lists[status].unshift(finalEntry);
  }

  saveRawLists(lists);

  // Sync to AniList GraphQL if user has a real remote token
  if (token && typeof token === "string" && !token.startsWith("local_") && token.length > 20) {
    try {
      fetch("https://graphql.anilist.co/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: updatelist,
          variables: {
            mediaId: numId,
            status: status === "REMOVE" ? null : status,
            progress: Number(progress) || 1,
          },
        }),
      }).catch((err) => console.warn("AniList sync warning:", err));
    } catch {}
  }

  return { success: true, status, entry: finalEntry };
}

/**
 * Format local and server lists into profile collection structure.
 */
export function getFormattedListsForProfile(serverLists = []) {
  const local = getRawLists();
  const serverMap = {};

  if (Array.isArray(serverLists)) {
    for (const sList of serverLists) {
      if (sList?.status) {
        serverMap[sList.status] = sList.entries || [];
      }
    }
  }

  return LIST_CATEGORIES.map((cat) => {
    const localEntries = local[cat.id] || [];
    const serverEntries = serverMap[cat.id] || [];

    // Merge by anime ID without duplicates
    const mergedMap = new Map();
    // Server entries first
    serverEntries.forEach((entry) => {
      const id = entry?.media?.id || entry?.id;
      if (id) mergedMap.set(Number(id), entry);
    });
    // Local entries take precedence as they are more recently modified
    localEntries.forEach((entry) => {
      const id = entry?.media?.id || entry?.id;
      if (id) mergedMap.set(Number(id), entry);
    });

    const entries = Array.from(mergedMap.values()).sort((a, b) => {
      const timeA = a.updatedAt || 0;
      const timeB = b.updatedAt || 0;
      return timeB - timeA;
    });

    return {
      name: cat.title,
      status: cat.id,
      isCustomList: false,
      entries: entries,
    };
  });
}

/**
 * Calculate user stats from profile lists.
 */
export function calculateUserStatistics(formattedLists) {
  const safeLists = Array.isArray(formattedLists) ? formattedLists : [];
  let totalAnimes = 0;
  let episodesWatched = 0;
  let completedCount = 0;
  let droppedCount = 0;
  let watchingCount = 0;
  let planningCount = 0;
  let pausedCount = 0;

  for (const list of safeLists) {
    const count = (list.entries || []).length;
    totalAnimes += count;

    if (list.status === "COMPLETED") completedCount = count;
    if (list.status === "DROPPED") droppedCount = count;
    if (list.status === "CURRENT") watchingCount = count;
    if (list.status === "PLANNING") planningCount = count;
    if (list.status === "PAUSED") pausedCount = count;

    for (const entry of list.entries || []) {
      episodesWatched += Number(entry.progress) || 1;
    }
  }

  return {
    totalAnimes,
    episodesWatched,
    minutesWatched: episodesWatched * 24,
    completedCount,
    droppedCount,
    watchingCount,
    planningCount,
    pausedCount,
  };
}

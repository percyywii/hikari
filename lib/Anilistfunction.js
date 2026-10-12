import { trending, animeinfo, advancedsearch, top100anime, seasonal, popular, schedule } from "./anilistqueries";

const anilistMemoryCache = new Map();
const DEFAULT_TTL_MS = 30 * 60 * 1000;

function getCached(key) {
  const item = anilistMemoryCache.get(key);
  if (item && item.expiresAt > Date.now()) {
    return item.data;
  }
  return null;
}

function setCached(key, data, ttlMs = DEFAULT_TTL_MS) {
  if (data !== undefined && data !== null) {
    anilistMemoryCache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }
}

export const TrendingAnilist = async () => {
  const cacheKey = "anilist:trending:page1";
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: trending,
        variables: {
          page: 1,
          perPage: 15,
        },
      }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.warn("AniList Trending response not ok:", response.status);
      return [];
    }

    const data = await response.json();
    const media = data?.data?.Page?.media || [];
    setCached(cacheKey, media, 30 * 60 * 1000);
    return media;
  } catch (error) {
    console.error("Error fetching data from AniList:", error?.message || error);
    return [];
  }
};

export const PopularAnilist = async (page = 1) => {
  const cacheKey = `anilist:popular:page${page}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: popular,
        variables: {
          page: page,
          perPage: page === 1 ? 31 : 13,
        },
      }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.warn("AniList Popular response not ok:", response.status);
      return [];
    }

    const data = await response.json();
    const media = data?.data?.Page?.media || [];
    setCached(cacheKey, media, 30 * 60 * 1000);
    return media;
  } catch (error) {
    console.error("Error fetching popular data from AniList:", error?.message || error);
    return [];
  }
};

export const Top100Anilist = async () => {
  const cacheKey = "anilist:top100";
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: top100anime,
        variables: {
          page: 1,
          perPage: 10,
        },
      }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.warn("AniList Top100 response not ok:", response.status);
      return [];
    }

    const data = await response.json();
    const media = data?.data?.Page?.media || [];
    setCached(cacheKey, media, 60 * 60 * 1000);
    return media;
  } catch (error) {
    console.error("Error fetching data from AniList:", error?.message || error);
    return [];
  }
};

export const SeasonalAnilist = async () => {
  const cacheKey = "anilist:seasonal";
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: seasonal,
        variables: {
          page: 1,
          perPage: 29,
        },
      }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.warn("AniList Seasonal response not ok:", response.status);
      return [];
    }

    const data = await response.json();
    const media = data?.data?.Page?.media || [];
    setCached(cacheKey, media, 60 * 60 * 1000);
    return media;
  } catch (error) {
    console.error("Error fetching data from AniList:", error?.message || error);
    return [];
  }
};

export const AnimeInfoAnilist = async (animeid) => {
  if (!animeid) return null;
  const cacheKey = `anilist:info:${animeid}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: animeinfo,
        variables: {
          id: Number(animeid),
        },
      }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.warn("AniList AnimeInfo response not ok:", response.status);
      return null;
    }

    const data = await response.json();
    const media = data?.data?.Media || null;
    if (media) {
      setCached(cacheKey, media, 60 * 60 * 1000);
    }
    return media;
  } catch (error) {
    console.error("Error fetching data from AniList:", error?.message || error);
    return null;
  }
};

export const AdvancedSearch = async (
  searchvalue,
  seasonvalue = null,
  formatvalue = null,
  genrevalue = null,
  statusvalue = null,
  sortbyvalue = null,
  currentPage = 1,
  country = null,
  startYear = null,
  episodes = null,
  selectedYear = null
) => {
  const cacheKey = `anilist:search:${JSON.stringify({
    searchvalue,
    seasonvalue,
    formatvalue,
    genrevalue,
    statusvalue,
    sortbyvalue,
    currentPage,
    country,
    startYear,
    episodes,
    selectedYear,
  })}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: advancedsearch,
        variables: {
          ...(searchvalue && {
            search: searchvalue,
            ...(!sortbyvalue && { sort: "SEARCH_MATCH" }),
          }),
          type: "ANIME",
          isAdult: false,
          ...(selectedYear && { seasonYear: selectedYear }),
          ...(statusvalue && { status: statusvalue }),
          ...(seasonvalue && { season: seasonvalue }),
          ...(formatvalue && { format: formatvalue }),
          ...(sortbyvalue && { sort: sortbyvalue }),

          ...(country && { countryOfOrigin: country }),
          ...(startYear && { startDate: startYear }),
          ...(episodes && { episodes: parseInt(episodes) }),

          ...(genrevalue && { ...genrevalue }),
          ...(currentPage && { page: currentPage }),
        },
      }),
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      console.warn("AniList AdvancedSearch response not ok:", response.status);
      return { media: [], pageInfo: {} };
    }

    const data = await response.json();
    const result = data?.data?.Page || { media: [], pageInfo: {} };
    setCached(cacheKey, result, 10 * 60 * 1000);
    return result;
  } catch (error) {
    console.error("Error fetching search data from AniList:", error?.message || error);
    return { media: [], pageInfo: {} };
  }
};

export const AiringScheduleAnilist = async (start = null, end = null, limit = 150) => {
  const now = Math.floor(Date.now() / 1000);
  const fromTime = start || now - 86400;
  const toTime = end || now + 7 * 86400;
  const cacheKey = `anilist:schedule:${Math.floor(fromTime / 3600)}:${Math.floor(toTime / 3600)}:${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const allSchedules = [];
    const pageSize = 50;
    const maxPages = Math.min(Math.ceil(limit / pageSize), 3);

    for (let page = 1; page <= maxPages; page++) {
      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          query: schedule,
          variables: {
            from: fromTime,
            to: toTime,
            page: page,
            perPage: pageSize,
          },
        }),
        next: { revalidate: 1800 },
      });

      if (!response.ok) {
        if (page === 1) console.warn("AniList schedule response not ok:", response.status);
        break;
      }

      const data = await response.json();
      const schedules = data?.data?.Page?.airingSchedules;
      if (Array.isArray(schedules) && schedules.length > 0) {
        allSchedules.push(...schedules);
        if (!data?.data?.Page?.pageInfo?.hasNextPage) break;
      } else {
        break;
      }
    }

    setCached(cacheKey, allSchedules, 20 * 60 * 1000);
    return allSchedules;
  } catch (error) {
    console.error("Error fetching airing schedule from AniList:", error?.message || error);
    return [];
  }
};
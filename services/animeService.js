/**
 * Tenro Anime Service
 * Centralized service for AniList metadata, catalog queries, search, and trends.
 */

import {
  trending,
  animeinfo,
  advancedsearch,
  top100anime,
  seasonal,
  popular,
} from "@/lib/anilistqueries";

const ANILIST_GRAPHQL_ENDPOINT = "https://graphql.anilist.co";
const DEFAULT_TIMEOUT_MS = 8000;

async function fetchGraphQL(query, variables = {}, { revalidate = 3600 } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(ANILIST_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate },
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`AniList returned HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.errors?.length) {
      throw new Error(data.errors[0]?.message || "GraphQL error");
    }

    return data.data;
  } finally {
    clearTimeout(timeout);
  }
}

export const animeService = {
  /**
   * Fetch currently trending anime
   */
  async getTrending(page = 1, perPage = 18) {
    try {
      const data = await fetchGraphQL(trending, { page, perPage }, { revalidate: 1800 });
      return data?.Page?.media || [];
    } catch (err) {
      console.error("[animeService.getTrending] Error:", err.message);
      return [];
    }
  },

  /**
   * Fetch all-time popular anime
   */
  async getPopular(page = 1, perPage = 20) {
    try {
      const data = await fetchGraphQL(popular, { page, perPage }, { revalidate: 3600 });
      return data?.Page?.media || [];
    } catch (err) {
      console.error("[animeService.getPopular] Error:", err.message);
      return [];
    }
  },

  /**
   * Fetch top 100 rated anime
   */
  async getTopRated(page = 1, perPage = 12) {
    try {
      const data = await fetchGraphQL(top100anime, { page, perPage }, { revalidate: 3600 });
      return data?.Page?.media || [];
    } catch (err) {
      console.error("[animeService.getTopRated] Error:", err.message);
      return [];
    }
  },

  /**
   * Fetch current season's anime
   */
  async getSeasonal(page = 1, perPage = 24) {
    try {
      const data = await fetchGraphQL(seasonal, { page, perPage }, { revalidate: 1800 });
      return data?.Page?.media || [];
    } catch (err) {
      console.error("[animeService.getSeasonal] Error:", err.message);
      return [];
    }
  },

  /**
   * Fetch full anime details by AniList ID
   */
  async getDetails(id) {
    if (!id) return null;
    try {
      const data = await fetchGraphQL(animeinfo, { id: Number(id) }, { revalidate: 3600 });
      return data?.Media || null;
    } catch (err) {
      console.error(`[animeService.getDetails] Error for ID ${id}:`, err.message);
      return null;
    }
  },

  /**
   * Advanced search supporting partial matching, genres, season, sort, and status
   */
  async search(query, options = {}) {
    const {
      page = 1,
      genre = null,
      season = null,
      format = null,
      status = null,
      sort = "SEARCH_MATCH",
      country = null,
      year = null,
      episodes = null,
    } = options;

    try {
      const variables = {
        type: "ANIME",
        isAdult: false,
        page,
        ...(query ? { search: query, sort: sort || "SEARCH_MATCH" } : { sort: sort || "POPULARITY_DESC" }),
        ...(genre ? { ...genre } : {}),
        ...(season ? { season } : {}),
        ...(format ? { format } : {}),
        ...(status ? { status } : {}),
        ...(country ? { countryOfOrigin: country } : {}),
        ...(year ? { seasonYear: year } : {}),
        ...(episodes ? { episodes: parseInt(episodes, 10) } : {}),
      };

      const data = await fetchGraphQL(advancedsearch, variables, { revalidate: 120 });
      return data?.Page || { media: [], pageInfo: {} };
    } catch (err) {
      console.error("[animeService.search] Error:", err.message);
      return { media: [], pageInfo: {} };
    }
  },
};

export default animeService;

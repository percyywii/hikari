"use server";

import { episodeService } from "@/services/episodeService";

/**
 * Server action to fetch clean, validated episode lists.
 */
export async function getEpisodes(id, animeInfo = {}) {
  if (!id) return [];
  // Support both full AnimeInfo object or legacy title parameter
  const infoObj = typeof animeInfo === "object" && animeInfo !== null ? animeInfo : {};
  return await episodeService.getEpisodes(id, infoObj);
}

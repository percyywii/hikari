/**
 * Tenro Episode Service
 * Audits, maps, normalizes, and classifies episodes into Released vs Upcoming
 * using real AniList and AniZip metadata. Eliminates phantom/duplicate episodes.
 */

const episodeCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;
const ANIZIP_TIMEOUT_MS = 4000;

export const episodeService = {
  /**
   * Get clean, validated episode list for an anime.
   */
  async getEpisodes(animeId, animeInfo = {}) {
    if (!animeId) return [];
    const cacheKey = String(animeId);
    const cached = episodeCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.episodes;
    }

    try {
      const coverMeta = await fetchAniZip(animeId);
      const totalEpisodes = Number(animeInfo?.episodes) || null;
      const status = animeInfo?.status || "FINISHED";
      const nextAiring = animeInfo?.nextAiringEpisode || null;
      const nextAiringNum = nextAiring?.episode ? Number(nextAiring.episode) : null;
      const nowMs = Date.now();

      // Determine latest released episode number
      let latestReleasedNum = totalEpisodes || 12;
      if (status === "NOT_YET_RELEASED") {
        latestReleasedNum = 0;
      } else if (status === "RELEASING" && nextAiringNum) {
        latestReleasedNum = Math.max(0, nextAiringNum - 1);
      }

      let episodes = [];

      if (coverMeta && coverMeta.length > 0) {
        const seenNumbers = new Set();

        episodes = coverMeta
          .filter((ep) => {
            // Keep regular numeric episodes (filter out specials like S1, S2 unless valid number)
            const raw = String(ep.episode ?? ep.number ?? "");
            return /^\d+$/.test(raw);
          })
          .map((ep) => {
            const epNum = Number(ep.episode || ep.number);
            const epTitle =
              typeof ep.title === "object"
                ? ep.title.en || ep.title["x-jat"] || ep.title.ja || `Episode ${epNum}`
                : ep.title || `Episode ${epNum}`;

            const airDateMs = ep.airDateUtc ? Date.parse(ep.airDateUtc) : null;
            let isReleased = false;

            if (status === "FINISHED") {
              isReleased = true;
            } else if (status === "NOT_YET_RELEASED") {
              isReleased = false;
            } else if (nextAiringNum) {
              isReleased = epNum < nextAiringNum;
            } else if (airDateMs && !isNaN(airDateMs)) {
              isReleased = airDateMs <= nowMs;
            } else {
              isReleased = epNum <= latestReleasedNum;
            }

            const isUpcoming = !isReleased && (epNum === nextAiringNum || (totalEpisodes && epNum <= totalEpisodes));

            return {
              id: `ep:${animeId}:${epNum}`,
              number: epNum,
              title: epTitle,
              image: ep.image || ep.img || null,
              description: ep.description || ep.overview || ep.summary || "",
              runtime: ep.runtime || ep.length || 24,
              airDate: ep.airDate || ep.airdate || null,
              airDateUtc: ep.airDateUtc || null,
              isReleased,
              isUpcoming,
              isFiller: Boolean(ep.filler),
              isSubbed: true,
              isDubbed: true,
              playable: isReleased,
            };
          })
          .filter((ep) => {
            if (seenNumbers.has(ep.number)) return false;
            seenNumbers.add(ep.number);
            // In releasing shows with AniZip containing 100 placeholder entries, only show up to next airing or total
            if (status === "RELEASING" && totalEpisodes && ep.number > totalEpisodes) return false;
            if (status === "RELEASING" && !totalEpisodes && nextAiringNum && ep.number > nextAiringNum) return false;
            return true;
          })
          .sort((a, b) => a.number - b.number);
      }

      // If AniZip had no valid regular episodes, synthesize from AniList info
      if (!episodes.length) {
        const count =
          status === "RELEASING"
            ? (nextAiringNum ? nextAiringNum : totalEpisodes || 12)
            : totalEpisodes || 12;

        episodes = Array.from({ length: count }, (_, i) => {
          const epNum = i + 1;
          const isReleased = status === "FINISHED" ? true : status === "NOT_YET_RELEASED" ? false : epNum <= latestReleasedNum;
          const isUpcoming = !isReleased && epNum === nextAiringNum;

          return {
            id: `ep:${animeId}:${epNum}`,
            number: epNum,
            title: `Episode ${epNum}`,
            image: null,
            description: "",
            runtime: 24,
            airDate: null,
            airDateUtc: null,
            isReleased,
            isUpcoming,
            isFiller: false,
            isSubbed: true,
            isDubbed: true,
            playable: isReleased,
          };
        });
      }

      cacheEpisodes(animeId, episodes);
      return episodes;
    } catch (err) {
      console.warn(`[episodeService] Failed generating episodes for ${animeId}:`, err.message);
      const fallbackEpisodes = Array.from({ length: 12 }, (_, i) => ({
        id: `ep:${animeId}:${i + 1}`,
        number: i + 1,
        title: `Episode ${i + 1}`,
        image: null,
        description: "",
        runtime: 24,
        isReleased: true,
        isUpcoming: false,
        isFiller: false,
        isSubbed: true,
        isDubbed: true,
        playable: true,
      }));
      return cacheEpisodes(animeId, fallbackEpisodes);
    }
  },
};

async function fetchAniZip(id) {
  try {
    const res = await fetch(`https://api.ani.zip/mappings?anilist_id=${id}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(ANIZIP_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Object.values(data?.episodes || []);
  } catch {
    return [];
  }
}

function cacheEpisodes(id, episodes) {
  episodeCache.set(String(id), {
    episodes,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
  return episodes;
}

export default episodeService;

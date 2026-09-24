/**
 * Tenro Streaming Service
 * Client and server-side helper to fetch watch data, coordinate multi-server sources,
 * and track playback server health.
 */

export const streamingService = {
  /**
   * Fetch stream data from the watch endpoint.
   */
  async fetchWatchData(episodeId, isDub = false, animeContext = {}) {
    try {
      const params = new URLSearchParams();
      if (episodeId) params.set("episodeid", episodeId);
      params.set("isdub", String(Boolean(isDub)));

      const animeId = animeContext?.animeId || animeContext?.id;
      if (animeId) params.set("animeId", String(animeId));

      const ep = animeContext?.episode || animeContext?.ep;
      if (ep) params.set("episode", String(ep));

      const malId = animeContext?.idMal || animeContext?.malId;
      if (malId) params.set("malId", String(malId));

      const title =
        typeof animeContext?.title === "object"
          ? animeContext.title.english || animeContext.title.romaji || ""
          : animeContext?.title || "";
      if (title) params.set("title", title);

      const retry = animeContext?.retry;
      if (retry !== undefined && retry !== null) params.set("retry", String(retry));

      const response = await fetch(`/api/anime/watch?${params.toString()}`, {
        signal: AbortSignal.timeout(25000),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message =
          errorData?.error || `Stream unavailable (HTTP ${response.status}: ${response.statusText})`;
        return { episodeId, error: message, sources: [], subtitles: [] };
      }

      const data = await response.json();
      return { episodeId, ...data };
    } catch (error) {
      const isTimeout =
        error?.name === "TimeoutError" ||
        error?.message?.includes("timed out") ||
        error?.message?.includes("signal");
      console.warn("[streamingService.fetchWatchData] Stream fetch warning:", error?.message || error);
      return {
        episodeId,
        error: isTimeout
          ? "Stream request timed out. Please try another server or retry."
          : (error?.message || "Failed to load episode stream."),
        sources: [],
        subtitles: [],
      };
    }
  },

  /**
   * Builds the local proxy URL for HLS streams and subtitles.
   */
  buildProxyUrl(url, headers = {}, pk = "", isDub = false) {
    if (!url || typeof url !== "string") return "";
    if (!/^https?:\/\//i.test(url) || url.startsWith("/api/proxy/stream")) return url;

    const params = new URLSearchParams();
    params.set("url", url);
    if (headers && Object.keys(headers).length > 0) {
      params.set("headers", JSON.stringify(headers));
    }
    if (pk) {
      params.set("pk", pk);
    }
    if (isDub) {
      params.set("dub", "1");
    }
    return `/api/proxy/stream?${params.toString()}`;
  },
};

export default streamingService;

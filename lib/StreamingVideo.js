// Fetch watch data, including streaming data and optional skip times
export const fetchWatchData = async (episodeId, isdub = false, animeContext = {}) => {
  try {
    const params = new URLSearchParams();
    if (episodeId) params.set("episodeid", episodeId);
    params.set("isdub", String(Boolean(isdub)));

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
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message =
        errorData?.error || `Streaming request failed (HTTP ${response.status}: ${response.statusText})`;
      console.warn(`Streaming source unavailable for episode ${episodeId}:`, message);
      return { episodeId, error: message };
    }

    const data = await response.json();
    return { episodeId, ...data };
  } catch (error) {
    console.error("Error fetching watch data:", error.message);
    return { episodeId, error: error.message || "Failed to fetch watch data." };
  }
};
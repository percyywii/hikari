import { extractFlixcloud } from "./extractors/flixcloud.js";
import { validateSources } from "../backend/source-validation.mjs";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const DEFAULT_REQUEST_TIMEOUT_MS = 8000;
const DEFAULT_RESOLUTION_TIMEOUT_MS = 22000;
const STREAM_CACHE_TTL = 15 * 60 * 1000;
const STREAM_CACHE_SAFETY_MARGIN = 30 * 1000;
const MAX_STREAM_CACHE_ENTRIES = 100;
const EXPIRY_PARAMETER_NAMES = new Set([
  "expires",
  "expire",
  "expiration",
  "expiry",
  "exp",
  "deadline",
  "validuntil",
  "valid_until",
]);
const SIGNED_URL_PARAMETER_NAMES = new Set([
  "auth",
  "jwt",
  "policy",
  "sig",
  "signature",
  "token",
  "x-amz-expires",
  "x-amz-signature",
  "x-amz-security-token",
]);
const streamCache = new Map();
const mappingCache = new Map();

function normalizeTimeout(value, fallback = DEFAULT_REQUEST_TIMEOUT_MS) {
  const timeoutMs = Number(value);
  return Number.isFinite(timeoutMs) && timeoutMs > 0 ? Math.max(1, Math.round(timeoutMs)) : fallback;
}

function createTimeoutError(label, timeoutMs) {
  const error = new Error(`${label} timed out after ${timeoutMs}ms`);
  error.name = "TimeoutError";
  error.code = "STREAM_TIMEOUT";
  return error;
}

function createAbortError() {
  const error = new Error("Operation aborted");
  error.name = "AbortError";
  error.code = "STREAM_ABORTED";
  return error;
}

function createDeadline(timeoutMs, parentSignal, label) {
  const controller = new AbortController();
  const boundedTimeoutMs = normalizeTimeout(timeoutMs);
  let timeoutId = null;
  let removeAbortListener = null;
  const timeoutError = createTimeoutError(label, boundedTimeoutMs);
  const abortError = createAbortError();
  const deadlinePromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort(timeoutError);
      reject(timeoutError);
    }, boundedTimeoutMs);

    if (parentSignal) {
      const abortFromParent = () => {
        const reason = parentSignal.reason || abortError;
        if (!controller.signal.aborted) controller.abort(reason);
        reject(reason);
      };
      if (parentSignal.aborted) {
        abortFromParent();
      } else {
        parentSignal.addEventListener("abort", abortFromParent, { once: true });
        removeAbortListener = () => parentSignal.removeEventListener("abort", abortFromParent);
      }
    }
  });
  deadlinePromise.catch(() => {});

  return {
    signal: controller.signal,
    deadlinePromise,
    abort(reason = abortError) {
      if (!controller.signal.aborted) controller.abort(reason);
    },
    cancel() {
      clearTimeout(timeoutId);
      removeAbortListener?.();
    },
  };
}

async function fetchBody(fetchImpl, url, options, timeoutMs, parentSignal, label) {
  const deadline = createDeadline(timeoutMs, parentSignal, label);
  try {
    const response = await Promise.race([
      fetchImpl(url, { ...options, signal: deadline.signal }),
      deadline.deadlinePromise,
    ]);
    const body = await Promise.race([response.text(), deadline.deadlinePromise]);
    return { response, body };
  } finally {
    deadline.cancel();
  }
}

async function fetchJson(fetchImpl, url, options, timeoutMs, parentSignal, label) {
  const { response, body } = await fetchBody(fetchImpl, url, options, timeoutMs, parentSignal, label);
  if (!response.ok) {
    const error = new Error(`${label} returned HTTP ${response.status}`);
    error.code = "HTTP_STATUS";
    error.status = response.status;
    throw error;
  }

  try {
    return JSON.parse(body);
  } catch {
    const error = new Error(`${label} returned invalid JSON`);
    error.code = "INVALID_RESPONSE";
    throw error;
  }
}

function getFailureReason(error) {
  if (error?.code === "STREAM_TIMEOUT" || error?.name === "TimeoutError") return "timeout";
  if (error?.code === "STREAM_ABORTED" || error?.name === "AbortError") return "aborted";
  if (Number.isInteger(error?.status)) return `HTTP ${error.status}`;
  if (error?.code === "INVALID_RESPONSE") return "invalid response";
  return "request failed";
}

function logDevelopmentWarning(provider, reason) {
  if (process.env.NODE_ENV === "production") return;
  console.warn(`[stream-resolver] ${provider} failed: ${reason}`);
}

function getParameterValue(params, name) {
  const target = name.toLowerCase();
  for (const [key, value] of params) {
    if (key.toLowerCase() === target) return value;
  }
  return null;
}

function parseExpiry(value) {
  if (!value) return null;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    const milliseconds = numeric < 100_000_000_000 ? numeric * 1000 : numeric;
    return milliseconds;
  }
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseAmzDate(value) {
  if (typeof value !== "string") return null;
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!match) return parseExpiry(value);
  return Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    Number(match[6]),
  );
}

function getUrlCacheTtl(url, now) {
  let parsed;
  try {
    parsed = new URL(url, "https://hikari.internal");
  } catch {
    return STREAM_CACHE_TTL;
  }

  const parameterNames = [...parsed.searchParams.keys()];
  const recognizedExpiry = parameterNames.some((key) => EXPIRY_PARAMETER_NAMES.has(key.toLowerCase()));
  let expiry = null;

  for (const name of EXPIRY_PARAMETER_NAMES) {
    const parsedExpiry = parseExpiry(getParameterValue(parsed.searchParams, name));
    if (parsedExpiry) {
      expiry = parsedExpiry;
      break;
    }
  }

  const amzDate = parseAmzDate(getParameterValue(parsed.searchParams, "x-amz-date"));
  const amzExpires = Number(getParameterValue(parsed.searchParams, "x-amz-expires"));
  if (Number.isFinite(amzDate) && Number.isFinite(amzExpires) && amzExpires > 0) {
    expiry = amzDate + amzExpires * 1000;
  }

  if (!expiry) return STREAM_CACHE_TTL;

  const remaining = expiry - now;
  if (remaining <= STREAM_CACHE_SAFETY_MARGIN) return 0;
  return Math.min(STREAM_CACHE_TTL, remaining - STREAM_CACHE_SAFETY_MARGIN);
}

function getPayloadCacheTtl(payload, now) {
  if (!Array.isArray(payload?.sources) || payload.sources.length === 0) return 0;
  const urls = payload.sources.map((source) => source?.url);
  if (Array.isArray(payload.subtitles)) urls.push(...payload.subtitles.map((subtitle) => subtitle?.url));

  let ttl = STREAM_CACHE_TTL;
  for (const url of urls) {
    if (typeof url !== "string") return 0;
    const urlTtl = getUrlCacheTtl(url, now);
    if (urlTtl === 0) return 0;
    ttl = Math.min(ttl, urlTtl);
  }
  return Math.max(1, Math.round(ttl));
}

function readStreamCache(key, now) {
  const cached = streamCache.get(key);
  if (!cached) return null;
  if (cached.expiresAt <= now) {
    streamCache.delete(key);
    return null;
  }
  return cached.data;
}

function writeStreamCache(key, payload, now) {
  const ttl = getPayloadCacheTtl(payload, now);
  if (ttl === 0) return;

  for (const [cacheKey, cached] of streamCache) {
    if (cached.expiresAt <= now) streamCache.delete(cacheKey);
  }

  if (streamCache.size >= MAX_STREAM_CACHE_ENTRIES) {
    const oldestKey = streamCache.keys().next().value;
    streamCache.delete(oldestKey);
  }
  streamCache.set(key, { data: payload, expiresAt: now + ttl });
}

async function resolveReanime(anilistId, epNum, isDub, {
  fetchImpl = fetch,
  signal = null,
  timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
} = {}) {
  const BASE = "https://reanime.to";
  const H = {
    "User-Agent": USER_AGENT,
    Accept: "application/json, */*",
    Referer: `${BASE}/`,
  };

  let flixData = null;
  try {
    const { response, body } = await fetchBody(
      fetchImpl,
      `${BASE}/api/flix/${anilistId}/${epNum}`,
      { headers: H },
      timeoutMs,
      signal,
      "Reanime catalog request",
    );
    if (response.ok) {
      try {
        flixData = JSON.parse(body);
      } catch {
        flixData = null;
      }
    }
  } catch (error) {
    if (signal?.aborted) throw signal.reason;
    throw new Error("Reanime catalog request failed");
  }

  if (!flixData?.success || !Array.isArray(flixData?.servers) || flixData.servers.length === 0) {
    throw new Error("No servers returned by Reanime");
  }

  const hasSub = flixData.servers.some((s) => ["sub", "s-sub"].includes(s.dataType?.toLowerCase()));
  const hasDub = flixData.servers.some((s) => ["dub", "s-dub"].includes(s.dataType?.toLowerCase()));

  const audioTypes = isDub ? ["dub", "s-dub"] : ["sub", "s-sub"];
  const matchingServers = flixData.servers.filter((server) => audioTypes.includes(server.dataType));
  const serversToTry = matchingServers.length > 0 ? matchingServers : flixData.servers;

  const extractionPromises = serversToTry.map(async (server, index) => {
    if (!server.dataLink) return null;
    try {
      const { response, body } = await fetchBody(
        fetchImpl,
        server.dataLink,
        { headers: H },
        Math.min(timeoutMs, 7000),
        signal,
        `Reanime embed request ${server.serverName || index}`,
      );
      if (!response.ok) return null;

      const extracted = await extractFlixcloud(body, {
        apiBase: "https://flixcloud.cc",
        headers: H,
        referer: `${BASE}/`,
        fetchImpl,
        signal,
        timeoutMs: Math.min(timeoutMs, 7000),
      });

      if (extracted?.url) {
        return {
          server,
          extracted,
          source: {
            url: extracted.url,
            type: "hls",
            quality: "auto",
            serverName: server.serverName || `HD-${index + 1}`,
            serverId: `server-${(server.serverName || `${index + 1}`).toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
            pk: extracted.pk || "",
            headers: {
              Referer: "https://flixcloud.cc/",
              "User-Agent": USER_AGENT,
              pk: extracted.pk || "",
            },
          },
        };
      }
    } catch (error) {
      if (signal?.aborted) throw signal.reason;
      logDevelopmentWarning(`Reanime/${server.serverName || "unknown"}`, getFailureReason(error));
    }
    return null;
  });

  const extractionResults = await Promise.allSettled(extractionPromises);
  const availableSources = [];
  let primaryExtracted = null;
  let primaryServerName = "";

  for (const settled of extractionResults) {
    if (settled.status === "fulfilled" && settled.value) {
      const { server, extracted, source } = settled.value;
      if (!primaryExtracted) {
        primaryExtracted = extracted;
        primaryServerName = server.serverName || "HD-1";
      }
      availableSources.push(source);
    }
  }

  // Also include embed fallbacks
  for (const server of serversToTry) {
    if (server.dataLink) {
      availableSources.push({
        url: server.dataLink,
        type: "embed",
        serverName: `${server.serverName || "HD"} (Embed)`,
        serverId: `${(server.serverName || "hd").toLowerCase().replace(/[^a-z0-9]/g, "-")}-embed`,
        headers: { Referer: `${BASE}/` },
      });
    }
  }

  if (availableSources.length > 0) {
    return {
      provider: `reanime (${primaryServerName || "HD-1"})`,
      sources: availableSources,
      subtitles: (primaryExtracted?.subtitles || []).map((sub) => ({
        url: sub.url,
        language: sub.language || "en",
        label: sub.label || sub.language || "English",
        default: !!sub.default,
        format: sub.format || "vtt",
      })),
      intro: primaryExtracted?.intro_chapter || null,
      outro: primaryExtracted?.outro_chapter || null,
      pk: primaryExtracted?.pk || "",
      headers: {
        Referer: "https://flixcloud.cc/",
        "User-Agent": USER_AGENT,
        pk: primaryExtracted?.pk || "",
      },
      hasSub,
      hasDub,
    };
  }

  if (signal?.aborted) throw signal.reason;
  throw new Error("No playable stream resolved from Reanime");
}

async function resolveSenshi(malId, epNum, isDub, {
  fetchImpl = fetch,
  signal = null,
  timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
} = {}) {
  if (!malId) throw new Error("No MAL ID available for Senshi resolver");

  const BASE = "https://senshi.to";
  const H = { "User-Agent": USER_AGENT, Referer: `${BASE}/` };

  const embeds = await fetchJson(
    fetchImpl,
    `${BASE}/episode-embeds/${malId}/${epNum}`,
    { headers: H },
    timeoutMs,
    signal,
    "Senshi embed request",
  );
  if (!Array.isArray(embeds) || embeds.length === 0) {
    throw new Error("Senshi returned empty embeds");
  }

  const targetStatus = isDub ? "dub" : "hardsub";
  const matching = embeds.find((embed) => (embed.status || "").toLowerCase().includes(targetStatus)) || embeds[0];
  const remoteSourceId = matching?.remote_source_id;

  if (remoteSourceId) {
    try {
      const vidSources = await fetchJson(
        fetchImpl,
        `https://s.vidcloud.se/_v1/sources?id=${encodeURIComponent(remoteSourceId)}`,
        {
          headers: {
            "User-Agent": USER_AGENT,
            Accept: "application/json,*/*",
            Origin: BASE,
            Referer: `${BASE}/`,
          },
        },
        timeoutMs,
        signal,
        "Senshi vidcloud request",
      );
      const primary = vidSources?.[0];
      if (primary?.source?.src) {
        const subtitles = (primary.tracks || [])
          .filter((track) => track?.vtt_url && track?.label?.toLowerCase() !== "chapter")
          .map((track) => ({
            url: track.vtt_url,
            language: track.label.toLowerCase().startsWith("eng") ? "en" : track.label.toLowerCase(),
            label: track.label,
            default: !!track.default,
            format: "vtt",
          }));

        return {
          provider: "senshi",
          sources: [
            {
              url: primary.source.src,
              type: "hls",
              quality: primary.source.quality || "1080p",
              headers: {
                Referer: `${BASE}/`,
                Origin: BASE,
                "User-Agent": USER_AGENT,
              },
            },
          ],
          subtitles,
        };
      }
    } catch (error) {
      if (signal?.aborted) throw signal.reason;
      logDevelopmentWarning("Senshi vidcloud", getFailureReason(error));
    }
  }

  if (matching?.url) {
    return {
      provider: "senshi",
      sources: [
        {
          url: matching.url,
          type: "hls",
          headers: { Referer: `${BASE}/` },
        },
      ],
      subtitles: [],
    };
  }

  throw new Error("No playable source resolved from Senshi");
}

async function resolveEmbedFallback(tmdbId, epNum, season = 1) {
  if (!tmdbId) throw new Error("No TMDB ID available for embed fallback");

  const twoEmbedUrl = `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${epNum}`;
  const twoEmbedSkinUrl = `https://2embed.skin/embedtv/${tmdbId}&s=${season}&e=${epNum}`;
  const autoEmbedUrl = `https://autoembed.co/tv/tmdb/${tmdbId}-${season}-${epNum}`;
  const vidSrcPmUrl = `https://vidsrc.pm/embed/tv/${tmdbId}/${season}/${epNum}`;

  return {
    provider: "2Embed (HD)",
    sources: [
      {
        url: twoEmbedUrl,
        type: "embed",
        quality: "1080p",
        serverName: "2Embed (HD-1)",
        serverId: "2embed-hd-1",
        headers: {},
      },
      {
        url: twoEmbedSkinUrl,
        type: "embed",
        quality: "1080p",
        serverName: "2Embed Skin (HD-2)",
        serverId: "2embed-skin-hd-2",
        headers: {},
      },
      {
        url: autoEmbedUrl,
        type: "embed",
        quality: "720p",
        serverName: "AutoEmbed (HD-3)",
        serverId: "autoembed-hd-3",
        headers: {},
      },
      {
        url: vidSrcPmUrl,
        type: "embed",
        quality: "1080p",
        serverName: "VidSrc PM (HD-4)",
        serverId: "vidsrc-pm-hd-4",
        headers: {},
      },
    ],
    subtitles: [],
  };
}

function enrichSubtitles(subtitles, { title, nativeTitle, episode, isDonghua }) {
  const result = Array.isArray(subtitles) ? [...subtitles] : [];
  const hasEnglish = result.some(
    (sub) =>
      sub.language?.toLowerCase() === "en" ||
      sub.label?.toLowerCase().includes("english")
  );
  if (!hasEnglish && (title || nativeTitle)) {
    const queryTitle = title || nativeTitle;
    result.unshift({
      url: `/api/anime/subtitles?title=${encodeURIComponent(queryTitle)}&ep=${episode}&lang=eng`,
      language: "en",
      label: "English (OpenSubtitles)",
      default: true,
      format: "vtt",
    });
  }
  return result;
}

export async function getAniZipMappings(anilistId, {
  fetchImpl = fetch,
  signal = null,
  timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
} = {}) {
  if (!anilistId) return null;
  const key = String(anilistId);
  const cached = mappingCache.get(key);
  if (cached) return cached;

  try {
    const mappings = await fetchJson(
      fetchImpl,
      `https://api.ani.zip/mappings?anilist_id=${encodeURIComponent(anilistId)}`,
      { headers: { "User-Agent": USER_AGENT } },
      timeoutMs,
      signal,
      "AniZip mapping request",
    );
    if (mappings?.mappings) {
      mappingCache.set(key, mappings.mappings);
      return mappings.mappings;
    }
  } catch (error) {
    if (signal?.aborted) throw signal.reason;
    logDevelopmentWarning("AniZip", getFailureReason(error));
  }

  try {
    const data = await fetchJson(
      fetchImpl,
      "https://graphql.anilist.co",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": USER_AGENT },
        body: JSON.stringify({
          query: "query mediaQuery($id: Int) { Media(id: $id) { id idMal title { romaji english native } countryOfOrigin externalLinks { site url type } streamingEpisodes { title url site } } }",
          variables: { id: Number(anilistId) },
        }),
      },
      timeoutMs,
      signal,
      "AniList mapping request",
    );
    const media = data?.data?.Media;
    if (media) {
      const fallbackMapping = {
        anilist_id: anilistId,
        mal_id: media.idMal,
        title: media.title,
        countryOfOrigin: media.countryOfOrigin,
        externalLinks: media.externalLinks || [],
        streamingEpisodes: media.streamingEpisodes || [],
      };
      mappingCache.set(key, fallbackMapping);
      return fallbackMapping;
    }
  } catch (error) {
    if (signal?.aborted) throw signal.reason;
    logDevelopmentWarning("AniList mappings", getFailureReason(error));
  }

  return null;
}

export async function resolveStreamingSources({
  animeId,
  episode,
  isDub = false,
  malId = null,
  tmdbId = null,
  title = null,
  nativeTitle = null,
  country = null,
  year = null,
  retry = null,
  fetchImpl = fetch,
  signal = null,
  requestTimeoutMs,
  resolutionTimeoutMs,
  timeoutMs,
}) {
  const epNum = Number(episode) || 1;
  const isDonghuaInitial = country === "CN" || (typeof nativeTitle === "string" && /[\u4e00-\u9fa5]/.test(nativeTitle));
  const cacheKey = `${animeId}:${epNum}:${isDub ? "dub" : "sub"}:${retry ?? ""}`;
  const cached = readStreamCache(cacheKey, Date.now());
  if (cached) return cached;

  const boundedResolutionTimeoutMs = normalizeTimeout(
    resolutionTimeoutMs ?? timeoutMs,
    DEFAULT_RESOLUTION_TIMEOUT_MS,
  );
  const boundedRequestTimeoutMs = normalizeTimeout(requestTimeoutMs, DEFAULT_REQUEST_TIMEOUT_MS);
  const errors = [];
  let discoveredMalId = malId;
  let discoveredTmdbId = tmdbId;
  let isDonghua = isDonghuaInitial;
  const resolutionDeadline = createDeadline(
    boundedResolutionTimeoutMs,
    signal,
    "Stream resolution",
  );
  const withResolutionTimeout = (promise) => Promise.race([
    promise,
    resolutionDeadline.deadlinePromise,
  ]);

  try {
    // Launch Reanime directly with AniList ID without waiting for external ID mappings
    const reanimeAttempt = resolveReanime(animeId, epNum, isDub, {
      fetchImpl,
      signal: resolutionDeadline.signal,
      timeoutMs: boundedRequestTimeoutMs,
    }).then(
      (result) => ({ provider: "Reanime", result }),
      (error) => ({ provider: "Reanime", error }),
    );

    // Concurrently discover MAL ID, TMDB ID, and media metadata
    const mappingPromise = (!discoveredMalId || !discoveredTmdbId || !isDonghua || !title)
      ? getAniZipMappings(animeId, {
          fetchImpl,
          signal: resolutionDeadline.signal,
          timeoutMs: boundedRequestTimeoutMs,
        }).then((mappings) => {
          if (mappings?.mal_id && !discoveredMalId) discoveredMalId = mappings.mal_id;
          if (mappings?.themoviedb_id && !discoveredTmdbId) discoveredTmdbId = mappings.themoviedb_id;
          if (mappings?.countryOfOrigin === "CN") isDonghua = true;
          if (!title && mappings?.title) {
            title = mappings.title.english || mappings.title.romaji || null;
          }
          if (!nativeTitle && mappings?.title?.native) {
            nativeTitle = mappings.title.native;
          }
          return mappings;
        }).catch(() => null)
      : Promise.resolve(null);

    // Senshi attempt runs as soon as MAL ID is available
    const senshiAttempt = (discoveredMalId ? Promise.resolve(discoveredMalId) : mappingPromise.then(() => discoveredMalId))
      .then((mid) => {
        if (!mid) throw new Error("No MAL ID available for Senshi");
        return resolveSenshi(mid, epNum, isDub, {
          fetchImpl,
          signal: resolutionDeadline.signal,
          timeoutMs: boundedRequestTimeoutMs,
        });
      })
      .then(
        (result) => ({ provider: "Senshi", result }),
        (error) => ({ provider: "Senshi", error }),
      );

    // First, attempt Reanime as primary provider (native HLS, sub/dub, chapters, multi-subs)
    try {
      const settled = await withResolutionTimeout(reanimeAttempt);
      if (settled?.result?.sources?.length) {
        const playableSources = settled.result.sources.filter((source) => source?.type === "embed" || source?.url);
        const embedSources = playableSources.filter((source) => source?.type === "embed");
        const directSources = playableSources.filter((source) => source?.type !== "embed");
        const validated =
          directSources.length === 0
            ? { sources: embedSources, failures: [] }
            : await validateSources(directSources, {
                allowedHosts: [],
                checkNetwork: false,
                requireAllowlist: false,
                timeoutMs: Math.min(boundedRequestTimeoutMs, 5000),
              });
        if (validated.sources.length > 0 || embedSources.length > 0) {
          const directOrEmbed = directSources.length === 0 ? embedSources : [...validated.sources, ...embedSources];
          if (discoveredTmdbId) {
            try {
              const fallback = await resolveEmbedFallback(discoveredTmdbId, epNum);
              if (fallback?.sources?.length) {
                directOrEmbed.push(...fallback.sources);
              }
            } catch {}
          }
          const subtitles = enrichSubtitles(settled.result.subtitles, {
            title,
            nativeTitle,
            episode: epNum,
            isDonghua,
          });
          const result = {
            ...settled.result,
            sources: directOrEmbed,
            subtitles,
            hasSub: settled.result.hasSub !== undefined ? settled.result.hasSub : true,
            hasDub: settled.result.hasDub !== undefined ? settled.result.hasDub : false,
            isDonghua,
          };
          const payload = { success: true, ...result };
          writeStreamCache(cacheKey, payload, Date.now());
          resolutionDeadline.abort();
          return payload;
        }
      } else if (settled?.error) {
        const reason = getFailureReason(settled.error);
        errors.push(`Reanime: ${reason}`);
        logDevelopmentWarning("Reanime", reason);
      }
    } catch (error) {
      if (resolutionDeadline.signal.aborted) throw resolutionDeadline.signal.reason;
      const reason = getFailureReason(error);
      errors.push(`Reanime: ${reason}`);
      logDevelopmentWarning("Reanime", reason);
    }

    // Next, attempt Senshi if Reanime has no playable sources
    try {
      const settled = await withResolutionTimeout(senshiAttempt);
      if (settled?.result?.sources?.length) {
        const playableSources = settled.result.sources.filter((source) => source?.type === "embed" || source?.url);
        const embedSources = playableSources.filter((source) => source?.type === "embed");
        const directSources = playableSources.filter((source) => source?.type !== "embed");
        const validated =
          directSources.length === 0
            ? { sources: embedSources, failures: [] }
            : await validateSources(directSources, {
                allowedHosts: [],
                checkNetwork: false,
                requireAllowlist: false,
                timeoutMs: Math.min(boundedRequestTimeoutMs, 5000),
              });
        if (validated.sources.length > 0 || embedSources.length > 0) {
          const directOrEmbed = directSources.length === 0 ? embedSources : [...validated.sources, ...embedSources];
          if (discoveredTmdbId) {
            try {
              const fallback = await resolveEmbedFallback(discoveredTmdbId, epNum);
              if (fallback?.sources?.length) {
                directOrEmbed.push(...fallback.sources);
              }
            } catch {}
          }
          const subtitles = enrichSubtitles(settled.result.subtitles, {
            title,
            nativeTitle,
            episode: epNum,
            isDonghua,
          });
          const result = {
            ...settled.result,
            sources: directOrEmbed,
            subtitles,
            hasSub: true,
            hasDub: isDub,
            isDonghua,
          };
          const payload = { success: true, ...result };
          writeStreamCache(cacheKey, payload, Date.now());
          resolutionDeadline.abort();
          return payload;
        }
      } else if (settled?.error) {
        const reason = getFailureReason(settled.error);
        errors.push(`Senshi: ${reason}`);
        logDevelopmentWarning("Senshi", reason);
      }
    } catch (error) {
      if (resolutionDeadline.signal.aborted) throw resolutionDeadline.signal.reason;
      const reason = getFailureReason(error);
      errors.push(`Senshi: ${reason}`);
      logDevelopmentWarning("Senshi", reason);
    }

    if (!discoveredTmdbId) {
      try {
        const mappings = await mappingPromise;
        if (mappings?.themoviedb_id && !discoveredTmdbId) {
          discoveredTmdbId = mappings.themoviedb_id;
        }
        if (mappings?.mal_id && !discoveredMalId) {
          discoveredMalId = mappings.mal_id;
        }
        if (mappings?.countryOfOrigin === "CN") {
          isDonghua = true;
        }
        if (!title && mappings?.title) {
          title = mappings.title.english || mappings.title.romaji || null;
        }
        if (!nativeTitle && mappings?.title?.native) {
          nativeTitle = mappings.title.native;
        }
      } catch (err) {}
    }

    if (discoveredTmdbId) {
      try {
        const result = await withResolutionTimeout(resolveEmbedFallback(discoveredTmdbId, epNum));
        if (result?.sources?.length) {
          const subtitles = enrichSubtitles(result.subtitles, {
            title,
            nativeTitle,
            episode: epNum,
            isDonghua,
          });
          const payload = {
            success: true,
            ...result,
            subtitles,
            hasSub: true,
            hasDub: false,
            isDonghua,
          };
          writeStreamCache(cacheKey, payload, Date.now());
          return payload;
        }
      } catch (error) {
        if (resolutionDeadline.signal.aborted) throw resolutionDeadline.signal.reason;
        errors.push(`Embed fallback: ${getFailureReason(error)}`);
      }
    }

    // Official stream discovery when third-party servers have no indexed streams
    let externalLink = null;
    try {
      const mappings = await mappingPromise;
      if (mappings?.countryOfOrigin === "CN") isDonghua = true;
      const streamEps = mappings?.streamingEpisodes || [];
      const extLinks = mappings?.externalLinks || [];

      const epMatch = streamEps.find((se) => {
        if (!se?.url) return false;
        const m = se.title?.match(/Episode\s*(\d+)/i) || se.title?.match(/^(\d+)\b/);
        return m && Number(m[1]) === epNum;
      });

      if (epMatch?.url) {
        externalLink = {
          site: epMatch.site || "Official Stream",
          url: epMatch.url,
          title: epMatch.title || `Episode ${epNum}`,
        };
      } else {
        const official = extLinks.find((l) =>
          ["Crunchyroll", "Bilibili", "YouTube", "WeTV", "iQIYI", "Viki"].some((s) =>
            (l.site || "").toLowerCase().includes(s.toLowerCase())
          )
        );
        if (official?.url) {
          externalLink = {
            site: official.site,
            url: official.url,
            title: official.site,
          };
        }
      }
    } catch {}

    const friendlyError = isDonghua
      ? externalLink
        ? `No third-party stream server currently indexes episode ${epNum}. Official stream is available on ${externalLink.site}.`
        : `This Donghua episode (${epNum}) is not currently available from stream providers. Please try another episode or check back later.`
      : `No playable source was returned for episode ${epNum}. (${errors.join("; ")})`;

    return {
      success: false,
      error: friendlyError,
      sources: [],
      subtitles: [],
      isDonghua,
      externalLink,
    };
  } catch (error) {
    const reason = getFailureReason(error);
    if (!resolutionDeadline.signal.aborted) {
      errors.push(`Resolver: ${reason}`);
    }
    logDevelopmentWarning("Stream resolution", reason);
    return {
      success: false,
      error: resolutionDeadline.signal.aborted
        ? `Stream resolution timed out after ${boundedResolutionTimeoutMs}ms. (${errors.join("; ")})`
        : `No playable source was returned for episode ${epNum}. (${errors.join("; ")})`,
      sources: [],
      subtitles: [],
      isDonghua,
    };
  } finally {
    resolutionDeadline.cancel();
  }
}

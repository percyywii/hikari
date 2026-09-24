const sourceTypes = new Set(["hls", "mp4"]);

export function normalizeSources(data, provider) {
  const sources = Array.isArray(data?.sources) ? data.sources : [];
  return sources
    .map((source) => ({
      url: source.url,
      type: source.type === "hls" || source.url?.includes(".m3u8") ? "hls" : "mp4",
      quality: source.quality || source.qualityLabel || undefined,
      language: source.language || undefined,
      subtitles: Array.isArray(data.subtitles) ? data.subtitles : [],
      headers: source.headers || data.headers || {},
      provider,
    }))
    .filter((source) => isValidSourceShape(source));
}

export function isValidSourceShape(source) {
  try {
    const parsed = new URL(source.url);
    return sourceTypes.has(source.type) && ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export async function validateSources(sources, options = {}) {
  const allowedHosts = options.allowedHosts || [];
  const checkNetwork = options.checkNetwork !== false;
  const validated = [];
  const failures = [];

  for (const source of sources) {
    const host = new URL(source.url).hostname;
    if (options.requireAllowlist && allowedHosts.length === 0) {
      failures.push({ url: source.url, reason: "No source host allowlist configured" });
      continue;
    }
    if (allowedHosts.length > 0 && !allowedHosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))) {
      failures.push({ url: source.url, reason: "Source host is not allowlisted" });
      continue;
    }

    if (checkNetwork) {
      try {
        const response = await fetch(source.url, {
          method: "GET",
          headers: { Range: "bytes=0-512", ...source.headers },
          signal: AbortSignal.timeout(options.timeoutMs || 5000),
        });
        const contentType = response.headers.get("content-type") || "";
        const body = (await response.text()).slice(0, 512).toLowerCase();
        const isPlaylist =
          source.type === "hls" &&
          (contentType.includes("mpegurl") ||
            body.includes("#extm3u") ||
            Boolean(source.pk || source.headers?.pk));
        const isVideo = source.type === "mp4" && (contentType.startsWith("video/") || response.status === 206);
        if (!response.ok || (!isPlaylist && !isVideo) || (body.includes("<html") && !body.includes("#extm3u"))) {
          failures.push({ url: source.url, reason: `Invalid source response (${response.status})` });
          continue;
        }
      } catch (error) {
        failures.push({ url: source.url, reason: error.message });
        continue;
      }
    }
    validated.push(source);
  }

  return { sources: validated, failures };
}

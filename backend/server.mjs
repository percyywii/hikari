import http from "node:http";
import { URL } from "node:url";
import { StreamingServers } from "@consumet/extensions";
import * as HianimeModule from "@consumet/extensions/dist/providers/anime/hianime.js";
import * as AnimePaheModule from "@consumet/extensions/dist/providers/anime/animepahe.js";
import * as AnimeUnityModule from "@consumet/extensions/dist/providers/anime/animeunity.js";
import { ProviderRegistry } from "./provider-registry.mjs";
import { normalizeSources, validateSources } from "./source-validation.mjs";

const Hianime = HianimeModule.default?.default || HianimeModule.default;
const AnimePahe = AnimePaheModule.default?.default || AnimePaheModule.default;
const AnimeUnity = AnimeUnityModule.default?.default || AnimeUnityModule.default;

const port = Number(process.env.SOURCE_API_PORT || 4000);
const providers = [
  { name: "hianime", enabled: process.env.ENABLE_PROVIDER_HIANIME !== "false", create: () => new Hianime() },
  { name: "animepahe", enabled: process.env.ENABLE_PROVIDER_ANIMEPAHE !== "false", create: () => new AnimePahe() },
  { name: "animeunity", enabled: process.env.ENABLE_PROVIDER_ANIMEUNITY !== "false", create: () => new AnimeUnity() },
];
const registry = new ProviderRegistry(providers, {
  timeoutMs: Number(process.env.PROVIDER_TIMEOUT_MS || 8000),
  maxRetries: Number(process.env.PROVIDER_MAX_RETRIES || 1),
  cooldownMs: Number(process.env.PROVIDER_COOLDOWN_MS || 30_000),
});
const allowedHosts = (process.env.STREAM_ALLOWED_HOSTS || "")
  .split(",")
  .map((host) => host.trim())
  .filter(Boolean);

const send = (response, status, body) => {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(body));
};

const titleList = (title) => [title.english, title.romaji, title.userPreferred]
  .filter(Boolean)
  .filter((value, index, values) => values.indexOf(value) === index);

const normalizeEpisodes = (episodes, provider) => (episodes || [])
  .map((episode) => ({
    ...episode,
    id: `${provider}:${episode.id}`,
    number: Number(episode.number),
    isSubbed: episode.isSubbed !== false,
    isDubbed: episode.isDubbed === true,
  }))
  .filter((episode) => Number.isFinite(episode.number));

async function findEpisodes(provider, titles) {
  const searches = await Promise.allSettled(
    titles.map((title) => registry.execute(provider, (client) => client.search(title)))
  );
  const result = searches
    .find((item) => item.status === "fulfilled" && item.value?.results?.[0])
    ?.value?.results?.[0];
  if (!result?.id) return [];

  const info = await registry.execute(provider, (client) => client.fetchAnimeInfo(result.id));
  return normalizeEpisodes(info?.episodes, provider.name);
}

async function episodeList(url) {
  const title = {
    english: url.searchParams.get("english") || "",
    romaji: url.searchParams.get("romaji") || "",
    userPreferred: url.searchParams.get("userPreferred") || "",
  };
  const titles = titleList(title);
  if (titles.length === 0) throw new Error("An anime title is required");

  for (const provider of registry.availableProviders()) {
    try {
      const episodes = await findEpisodes(provider, titles);
      if (episodes.length > 0) return episodes;
    } catch (error) {
      console.warn(`${provider.name} unavailable: ${error.message}`);
    }
  }
  throw new Error("No provider returned released episodes");
}

async function watchSource(url) {
  const episodeId = url.searchParams.get("episodeid") || "";
  const isDub = url.searchParams.get("isdub") === "true";
  const separator = episodeId.indexOf(":");
  const providerName = separator > 0 ? episodeId.slice(0, separator) : "hianime";
  const providerEpisodeId = separator > 0 ? episodeId.slice(separator + 1) : episodeId;
  const provider = registry.availableProviders().find((item) => item.name === providerName);
  if (!provider || !providerEpisodeId) throw new Error("Invalid provider episode ID");

  const data = await registry.execute(provider, (client) => providerName === "hianime"
    ? client.fetchEpisodeSources(providerEpisodeId, StreamingServers.MegaUp, isDub ? "dub" : "sub")
    : client.fetchEpisodeSources(providerEpisodeId));

  const sources = normalizeSources(data, providerName);
  const validated = await validateSources(sources, {
    allowedHosts,
    requireAllowlist: process.env.NODE_ENV === "production",
  });
  if (validated.sources.length === 0) {
    throw new Error("No validated playable source returned");
  }
  return { ...data, sources: validated.sources };
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    });
    response.end();
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host}`);
  try {
    if (url.pathname === "/health" || url.pathname === "/api/health") {
      return send(response, 200, { ok: true, service: "source-api", providers: registry.health() });
    }
    if (url.pathname === "/api/providers/health") return send(response, 200, { providers: registry.health() });
    if (url.pathname === "/anime/episodes") return send(response, 200, await episodeList(url));
    if (url.pathname === "/anime/watch") return send(response, 200, await watchSource(url));
    return send(response, 404, { error: "Not found" });
  } catch (error) {
    console.error(`${request.method} ${url.pathname}: ${error.message}`);
    return send(response, 503, {
      success: false,
      error: {
        code: "NO_PLAYABLE_SOURCE",
        message: "No playable source is currently available.",
        providerStatus: registry.health().map(({ provider, status, responseTime }) => ({ provider, status, responseTime })),
      },
    });
  }
});

server.listen(port, () => {
  console.log(`Source API listening at http://localhost:${port}`);
});

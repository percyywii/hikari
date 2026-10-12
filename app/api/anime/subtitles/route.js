import { NextResponse } from "next/server";
import { gunzipSync } from "node:zlib";
import https from "node:https";
import http from "node:http";

export const dynamic = "force-dynamic";

delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;
delete process.env.http_proxy;
delete process.env.https_proxy;
delete process.env.ALL_PROXY;
delete process.env._;

const subtitleCache = new Map();
const SUB_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function fetchHttps(urlStr, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    console.log("[fetchHttps debug] hostname:", u.hostname, "path:", u.pathname);
    const options = {
      hostname: u.hostname,
      port: u.port || (u.protocol === "http:" ? 80 : 443),
      path: u.pathname + u.search,
      headers: {
        Host: u.hostname,
        ...headers,
      },
      timeout: 7000,
    };
    const client = u.protocol === "http:" ? http : https;
    const req = client.get(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let loc = res.headers.location;
        if (loc.startsWith("https://_/") || loc.startsWith("http://_/")) {
          loc = loc.replace(/^https?:\/\/_/, "https://rest.opensubtitles.org");
        } else if (!loc.startsWith("http")) {
          loc = `https://rest.opensubtitles.org${loc.startsWith("/") ? "" : "/"}${loc}`;
        }
        return fetchHttps(loc, headers).then(resolve, reject);
      }
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () =>
        resolve({
          ok: res.statusCode === 200,
          status: res.statusCode,
          buffer: Buffer.concat(chunks),
        })
      );
    });
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Timeout"));
    });
  });
}

function formatAssTime(timeStr) {
  const parts = String(timeStr || "").split(":");
  if (parts.length === 3) {
    const h = parts[0].padStart(2, "0");
    const m = parts[1].padStart(2, "0");
    const [s, cs] = (parts[2] || "").split(".");
    const sec = (s || "00").padStart(2, "0");
    const ms = (cs || "00").padEnd(3, "0").slice(0, 3);
    return `${h}:${m}:${sec}.${ms}`;
  }
  return timeStr;
}

function assToVtt(assText) {
  const lines = assText.split(/\r?\n/);
  const cues = [];
  for (const line of lines) {
    if (line.startsWith("Dialogue:")) {
      const parts = line.substring(9).split(",");
      if (parts.length >= 10) {
        const start = parts[1].trim();
        const end = parts[2].trim();
        const rawText = parts.slice(9).join(",").trim();
        const clean = rawText
          .replace(/\{[^}]*\}/g, "")
          .replace(/\\N/gi, "\n")
          .replace(/\\n/gi, "\n")
          .trim();
        if (
          clean &&
          start &&
          end &&
          !/opensubtitles|become vip member|remove all ads|ai\.opensubtitles/i.test(clean)
        ) {
          cues.push(`${formatAssTime(start)} --> ${formatAssTime(end)}\n${clean}`);
        }
      }
    }
  }
  return `WEBVTT\n\n${cues.join("\n\n")}`;
}

function srtToVtt(srtText) {
  const normalized = srtText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  const blocks = normalized.split(/\n\n+/);
  const cleanBlocks = [];

  for (const block of blocks) {
    const lines = block.split("\n");
    if (lines.length < 2) continue;
    const textLines = lines.slice(2).join(" ");
    if (
      /opensubtitles|ai\.opensubtitles|become vip member|remove all ads/i.test(
        textLines
      )
    ) {
      continue;
    }
    const converted = lines
      .map((l, i) => (i === 1 ? l.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2") : l))
      .join("\n");
    cleanBlocks.push(converted);
  }

  return `WEBVTT\n\n${cleanBlocks.join("\n\n")}`;
}

function cleanTitle(raw) {
  return String(raw || "")
    .replace(/[–—\-:–_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "";
  const ep = Number(searchParams.get("ep") || 1);
  const lang = searchParams.get("lang") || "eng";

  if (!title) {
    return new NextResponse("WEBVTT\n\n", {
      status: 200,
      headers: { "Content-Type": "text/vtt; charset=utf-8" },
    });
  }

  const cacheKey = `${cleanTitle(title).toLowerCase()}:${ep}:${lang}`;
  const cached = subtitleCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() && cached.vtt && cached.vtt.length > 20) {
    return new NextResponse(cached.vtt, {
      status: 200,
      headers: {
        "Content-Type": "text/vtt; charset=utf-8",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  const sanitized = cleanTitle(title).toLowerCase();
  const searchQueries = [
    `${sanitized} episode ${ep}`.replace(/\s+/g, "+"),
    `${sanitized} ${ep}`.replace(/\s+/g, "+"),
  ];

  let downloadedVtt = null;

  for (const q of searchQueries) {
    try {
      const url = `https://rest.opensubtitles.org/search/query-${q}/sublanguageid-${encodeURIComponent(lang)}`;
      const res = await fetchHttps(url, { "User-Agent": "TemporaryUserAgent" });
      if (!res.ok) continue;

      const rawJson = res.buffer.toString("utf-8");
      const results = JSON.parse(rawJson);
      if (!Array.isArray(results) || results.length === 0) continue;

      const match = results.find((sub) => {
        const file = String(sub.SubFileName || "").toLowerCase();
        const subEp = Number(sub.SeriesEpisode || 0);
        if (subEp === ep) return true;
        const epRegex = new RegExp(`(?:ep|episode|e)[._\\s-]*0*${ep}(?:[^0-9]|$)`, "i");
        return epRegex.test(file);
      }) || results[0];

      if (match?.SubDownloadLink) {
        const subRes = await fetchHttps(match.SubDownloadLink, { "User-Agent": "TemporaryUserAgent" });
        if (subRes.ok) {
          let text = "";
          try {
            text = gunzipSync(subRes.buffer).toString("utf-8");
          } catch {
            text = subRes.buffer.toString("utf-8");
          }

          if (text) {
            const isAss = match.SubFormat === "ass" || text.includes("[Script Info]") || text.includes("Dialogue:");
            downloadedVtt = isAss ? assToVtt(text) : srtToVtt(text);
            break;
          }
        }
      }
    } catch (err) {
      console.error("[subtitles error]", q, err?.message || err);
    }
  }

  const finalVtt = downloadedVtt || "WEBVTT\n\n";

  if (downloadedVtt && downloadedVtt.length > 20) {
    subtitleCache.set(cacheKey, {
      vtt: downloadedVtt,
      expiresAt: Date.now() + SUB_CACHE_TTL_MS,
    });
  }

  return new NextResponse(finalVtt, {
    status: 200,
    headers: {
      "Content-Type": "text/vtt; charset=utf-8",
      "Cache-Control": downloadedVtt
        ? "public, s-maxage=86400, stale-while-revalidate=604800"
        : "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

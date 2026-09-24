import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

/**
 * Local HLS / Media Proxy with Obfuscation Decryption.
 *
 * Upstream streaming CDNs require specific headers (Referer / Origin / User-Agent),
 * do not send browser-friendly CORS headers, and may encrypt M3U8 playlists with
 * dynamic XOR keystreams derived from WebAssembly runtime seeds.
 *
 * This route:
 * 1. Proxies playlists, encryption keys, and segments while preserving provider headers.
 * 2. Decrypts obfuscated M3U8 master and child playlists using the provided `pk` key.
 * 3. Rewrites child URIs (#EXT-X-KEY, #EXT-X-MEDIA audio tracks, video sub-playlists)
 *    to route through the proxy with persistent auth and decryption parameters.
 * 4. Enables standard HLS playback across Artplayer, HLS.js, and native browser video players.
 */

const DEFAULT_TIMEOUT_MS = 15000;
const MAX_PROXY_RETRIES = 2;

const PRIVATE_IP_REGEX =
  /^(?:localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+|169\.254\.\d+\.\d+|0\.0\.0\.0|::1|fc00:|fe80:)/i;

function isPrivateHost(hostname) {
  return PRIVATE_IP_REGEX.test(hostname);
}

function getAllowedHosts() {
  const raw = process.env.STREAM_ALLOWED_HOSTS || "";
  return raw
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

function isAllowedHost(hostname, allowedHosts) {
  if (!allowedHosts.length) return true;
  return allowedHosts.some(
    (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
  );
}

function getTimeoutMs() {
  const value = Number(process.env.HLS_PROXY_TIMEOUT_MS);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_TIMEOUT_MS;
}

function parseHeaders(raw) {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      const headers = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof key === "string" && typeof value === "string") {
          headers[key] = value;
        }
      }
      return headers;
    }
  } catch {
    // Ignore malformed JSON headers
  }
  return {};
}

function b64toU8(value) {
  const binary = atob(value);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function decryptPlaylist(rawText, pk) {
  if (!pk) return rawText;
  const trimmed = rawText.trim();
  if (trimmed.startsWith("#EXTM3U")) return rawText;

  try {
    const keyBuf = b64toU8(pk);
    const cipherBuf = b64toU8(trimmed);
    if (!cipherBuf.length || !keyBuf.length) return rawText;

    const decryptedBytes = new Uint8Array(cipherBuf.length);
    for (let i = 0; i < cipherBuf.length; i++) {
      decryptedBytes[i] = cipherBuf[i] ^ keyBuf[i % keyBuf.length];
    }
    const decryptedText = new TextDecoder().decode(decryptedBytes);
    if (decryptedText.includes("#EXTM3U") || decryptedText.includes("#EXT-X-")) {
      return decryptedText;
    }
  } catch {
    // If decryption fails, fall back to raw text
  }
  return rawText;
}

export async function GET(req) {
  const urlParam = req.nextUrl.searchParams.get("url");
  if (!urlParam) {
    return NextResponse.json({ error: "url parameter is required" }, { status: 400 });
  }

  let targetUrl;
  try {
    targetUrl = new URL(urlParam);
  } catch {
    return NextResponse.json({ error: "Invalid url parameter" }, { status: 400 });
  }

  if (targetUrl.protocol !== "http:" && targetUrl.protocol !== "https:") {
    return NextResponse.json({ error: "Unsupported url protocol" }, { status: 400 });
  }

  if (isPrivateHost(targetUrl.hostname)) {
    return NextResponse.json({ error: "Forbidden target host" }, { status: 403 });
  }

  const allowedHosts = getAllowedHosts();
  if (process.env.NODE_ENV === "production" && !isAllowedHost(targetUrl.hostname, allowedHosts)) {
    return NextResponse.json({ error: "Source host is not authorized" }, { status: 403 });
  }

  const rawHeadersParam = req.nextUrl.searchParams.get("headers") || "";
  const providerHeaders = parseHeaders(rawHeadersParam);
  const pkParam = req.nextUrl.searchParams.get("pk") || providerHeaders["pk"] || "";
  const isDubParam = req.nextUrl.searchParams.get("dub") === "1";

  const requestHeaders = {
    Accept: "*/*",
    "User-Agent":
      providerHeaders["User-Agent"] ||
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    ...providerHeaders,
  };

  const clientRange = req.headers.get("range");
  if (clientRange) {
    requestHeaders["Range"] = clientRange;
  }

  let lastError;
  for (let attempt = 0; attempt <= MAX_PROXY_RETRIES; attempt += 1) {
    try {
      const response = await fetch(targetUrl.href, {
        method: "GET",
        headers: requestHeaders,
        signal: AbortSignal.timeout(getTimeoutMs()),
      });

      const contentType = response.headers.get("content-type") || "";
      const isM3U8 =
        contentType.includes("mpegurl") ||
        contentType.includes("x-mpegurl") ||
        targetUrl.pathname.endsWith(".m3u8") ||
        targetUrl.pathname.endsWith(".m3u") ||
        targetUrl.pathname.endsWith(".txt");
      const body = await response.arrayBuffer();

      if (isM3U8) {
        let text = new TextDecoder().decode(body);
        text = decryptPlaylist(text, pkParam);

        if (text.includes("#EXTM3U") || text.includes("#EXT-X-")) {
          const rewritten = rewritePlaylist(text, targetUrl.href, rawHeadersParam, pkParam, isDubParam);
          return new NextResponse(rewritten, {
            status: 200,
            headers: {
              "Content-Type": "application/vnd.apple.mpegurl",
              "Cache-Control": "public, max-age=1800",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "*",
              "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges",
            },
          });
        }

        return new NextResponse(text, {
          status: response.status,
          headers: {
            "Content-Type": contentType || "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
          },
        });
      }

      let finalContentType = contentType || "application/octet-stream";
      const isMediaSegment =
        targetUrl.pathname.includes("/seg-") ||
        targetUrl.pathname.endsWith(".ts") ||
        (targetUrl.pathname.includes("seg") && (targetUrl.pathname.endsWith(".png") || targetUrl.pathname.endsWith(".webp")));

      if (isMediaSegment) {
        finalContentType = "video/mp2t";
      }

      const responseHeaders = {
        "Content-Type": finalContentType,
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges",
      };
      if (response.headers.get("accept-ranges")) {
        responseHeaders["Accept-Ranges"] = response.headers.get("accept-ranges");
      }
      if (response.headers.get("content-range")) {
        responseHeaders["Content-Range"] = response.headers.get("content-range");
      }

      return new NextResponse(body, {
        status: response.status,
        headers: responseHeaders,
      });
    } catch (error) {
      lastError = error;
      if (attempt < MAX_PROXY_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
      }
    }
  }

  console.error("Stream proxy error:", lastError?.message);
  return NextResponse.json(
    { error: "Failed to proxy stream", detail: lastError?.message },
    { status: 502 }
  );
}

/**
 * Rewrites URLs inside an m3u8 playlist so all child playlists, audio tracks,
 * encryption keys (#EXT-X-KEY), and init segments (#EXT-X-MAP) route through
 * this proxy preserving the provider's required authentication headers and decryption key.
 *
 * When isDub is requested:
 * Automatically re-prioritizes English audio tracks to DEFAULT=YES and orders them first
 * so players automatically default to the English dub.
 */
function rewritePlaylist(text, baseUrl, rawHeadersParam, pk, isDub = false) {
  const base = new URL(baseUrl);
  const lines = text.split(/\r?\n/);
  const out = [];
  const audioLines = [];

  const headersQuery = rawHeadersParam ? `&headers=${encodeURIComponent(rawHeadersParam)}` : "";
  const pkQuery = pk ? `&pk=${encodeURIComponent(pk)}` : "";
  const dubQuery = isDub ? "&dub=1" : "";

  function makeProxyUrl(relativeOrAbsoluteUrl, isSubPlaylist = false) {
    let resolved;
    try {
      resolved = new URL(relativeOrAbsoluteUrl, base);
    } catch {
      return relativeOrAbsoluteUrl;
    }
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:") {
      return relativeOrAbsoluteUrl;
    }
    const extra = isSubPlaylist ? `${headersQuery}${pkQuery}${dubQuery}` : headersQuery;
    return `/api/proxy/stream?url=${encodeURIComponent(resolved.href)}${extra}`;
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      out.push(line);
      continue;
    }

    // Rewrite URI in #EXT-X-KEY:METHOD=...,URI="..." and #EXT-X-MAP:URI="..."
    if (trimmed.startsWith("#EXT-X-KEY:") || trimmed.startsWith("#EXT-X-MAP:")) {
      const rewrittenLine = line.replace(/URI=(["'])(.*?)\1/i, (_, quote, uri) => {
        return `URI=${quote}${makeProxyUrl(uri, false)}${quote}`;
      });
      out.push(rewrittenLine);
      continue;
    }

    // Rewrite URI in #EXT-X-MEDIA:TYPE=AUDIO and prioritize audio track based on isDub
    if (trimmed.startsWith("#EXT-X-MEDIA:TYPE=AUDIO") || trimmed.startsWith("#EXT-X-MEDIA:TYPE=\"AUDIO\"")) {
      let rewrittenLine = line.replace(/URI=(["'])(.*?)\1/i, (_, quote, uri) => {
        return `URI=${quote}${makeProxyUrl(uri, true)}${quote}`;
      });

      const isEng = /LANGUAGE=["']?eng/i.test(rewrittenLine) || /NAME=["']?(?:English|Dub)/i.test(rewrittenLine);
      const isJpn = /LANGUAGE=["']?jpn/i.test(rewrittenLine) || /NAME=["']?(?:Native|Japanese)/i.test(rewrittenLine);

      if (isDub) {
        if (isEng) {
          rewrittenLine = /DEFAULT=/i.test(rewrittenLine)
            ? rewrittenLine.replace(/DEFAULT=NO/i, "DEFAULT=YES")
            : `${rewrittenLine},DEFAULT=YES`;
        } else if (isJpn) {
          rewrittenLine = /DEFAULT=/i.test(rewrittenLine)
            ? rewrittenLine.replace(/DEFAULT=YES/i, "DEFAULT=NO")
            : `${rewrittenLine},DEFAULT=NO`;
        }
      } else {
        if (isEng) {
          rewrittenLine = /DEFAULT=/i.test(rewrittenLine)
            ? rewrittenLine.replace(/DEFAULT=YES/i, "DEFAULT=NO")
            : `${rewrittenLine},DEFAULT=NO`;
        } else if (isJpn) {
          rewrittenLine = /DEFAULT=/i.test(rewrittenLine)
            ? rewrittenLine.replace(/DEFAULT=NO/i, "DEFAULT=YES")
            : `${rewrittenLine},DEFAULT=YES`;
        }
      }

      audioLines.push({ line: rewrittenLine, isEng });
      continue;
    }

    // Rewrite URI in other #EXT-X-MEDIA:TYPE=... (subtitles / other tracks)
    if (trimmed.startsWith("#EXT-X-MEDIA:")) {
      const rewrittenLine = line.replace(/URI=(["'])(.*?)\1/i, (_, quote, uri) => {
        return `URI=${quote}${makeProxyUrl(uri, true)}${quote}`;
      });
      out.push(rewrittenLine);
      continue;
    }

    // Pass through all other comments / tags
    if (trimmed.startsWith("#")) {
      out.push(line);
      continue;
    }

    // Rewrite media segment or sub-playlist URI (video.m3u8)
    const isSubPlaylist =
      trimmed.includes(".m3u8") ||
      (!trimmed.includes(".png") &&
        !trimmed.includes(".webp") &&
        !trimmed.includes(".ts") &&
        !trimmed.includes(".m4s") &&
        !trimmed.includes(".mp4"));
    out.push(makeProxyUrl(trimmed, isSubPlaylist));
  }

  // Place audio tracks back into the playlist, ordered by preference
  if (audioLines.length > 0) {
    if (isDub) {
      audioLines.sort((a, b) => (b.isEng ? 1 : 0) - (a.isEng ? 1 : 0));
    } else {
      audioLines.sort((a, b) => (a.isEng ? 1 : 0) - (b.isEng ? 1 : 0));
    }

    const headerIdx = out.findIndex((l) => !l.startsWith("#EXTM3U") && !l.startsWith("#EXT-X-VERSION"));
    const insertIdx = headerIdx >= 0 ? headerIdx : 1;
    out.splice(insertIdx, 0, ...audioLines.map((a) => a.line));
  }

  return out.join("\n");
}
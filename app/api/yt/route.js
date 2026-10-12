import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ytCache = new Map();
const YT_CACHE_TTL_MS = 2 * 60 * 60 * 1000;

function getEmbedUrl(id) {
  return `https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${encodeURIComponent(id)}`;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const quality = searchParams.get('q') || null;

  if (!id) {
    return NextResponse.json({ message: 'Id is required' }, { status: 400 });
  }

  const cacheKey = `${id}:${quality || 'default'}`;
  const cached = ytCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data, {
      headers: {
        "Cache-Control": "public, s-maxage=7200, stale-while-revalidate=86400",
      },
    });
  }

  try {
    const ytdlModule = await import('@distube/ytdl-core');
    const ytdl = ytdlModule?.default || ytdlModule;

    if (!ytdl || typeof ytdl.getInfo !== 'function') {
      const fallback = { url: null, embedUrl: getEmbedUrl(id), message: 'Trailer parser unavailable' };
      ytCache.set(cacheKey, { data: fallback, expiresAt: Date.now() + YT_CACHE_TTL_MS });
      return NextResponse.json(fallback);
    }

    const constructedUrl =
      typeof ytdl.getURLVideoID === 'function'
        ? ytdl.getURLVideoID(`https://www.youtube.com/watch?v=${id}`)
        : `https://www.youtube.com/watch?v=${id}`;

    // 3.5-second hard timeout to avoid blocking page navigation
    const info = await Promise.race([
      ytdl.getInfo(constructedUrl),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("YouTube parser timed out")), 3500)
      ),
    ]);

    let video = null;
    if (quality === "all") {
      video = info.formats?.filter((e) => e.hasVideo && !e.isHLS) || [];
    } else if (quality) {
      video =
        info.formats?.filter(
          (e) => e.hasVideo && !e.isHLS && e.qualityLabel === quality
        ) || [];
    } else {
      video =
        info.formats
          ?.filter((e) => e.hasVideo && e.hasAudio && !e.isHLS)
          ?.sort((a, b) => (b.height || 0) - (a.height || 0))
          ?.find((e) => e.url)?.url || null;
    }

    const payload = { url: video, embedUrl: getEmbedUrl(id) };
    ytCache.set(cacheKey, { data: payload, expiresAt: Date.now() + YT_CACHE_TTL_MS });

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=7200, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    const fallback = {
      url: null,
      embedUrl: getEmbedUrl(id),
      message: 'Trailer unavailable',
    };
    ytCache.set(cacheKey, { data: fallback, expiresAt: Date.now() + 15 * 60 * 1000 });
    return NextResponse.json(fallback, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
      },
    });
  }
}

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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

  try {
    // Import external @distube/ytdl-core (Node native)
    const ytdlModule = await import('@distube/ytdl-core');
    const ytdl = ytdlModule?.default || ytdlModule;

    if (!ytdl || typeof ytdl.getInfo !== 'function') {
      return NextResponse.json(
        { url: null, embedUrl: getEmbedUrl(id), message: 'Trailer parser unavailable' },
        { status: 200 }
      );
    }

    const constructedUrl =
      typeof ytdl.getURLVideoID === 'function'
        ? ytdl.getURLVideoID(`https://www.youtube.com/watch?v=${id}`)
        : `https://www.youtube.com/watch?v=${id}`;

    const info = await ytdl.getInfo(constructedUrl);

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

    return NextResponse.json({ url: video, embedUrl: getEmbedUrl(id) });
  } catch (error) {
    console.warn(`YouTube trailer unavailable for ${id}:`, error?.message || error);
    return NextResponse.json(
      {
        url: null,
        embedUrl: getEmbedUrl(id),
        message: 'Trailer unavailable',
      },
      { status: 200 }
    );
  }
}

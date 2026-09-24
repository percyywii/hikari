import { NextResponse } from "next/server";
import { resolveStreamingSources } from "@/lib/streamResolver";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET(req) {
  try {
    const searchParams = req.nextUrl.searchParams;
    let episodeId = searchParams.get("episodeid") ? decodeURIComponent(searchParams.get("episodeid")) : "";
    let animeId = searchParams.get("animeId") || searchParams.get("animeid");
    let episode = searchParams.get("episode") || searchParams.get("ep");
    const isDub = searchParams.get("isdub") === "true";
    const malId = searchParams.get("malId") || searchParams.get("mal_id");
    const tmdbId = searchParams.get("tmdbId") || searchParams.get("themoviedb_id");
    const title = searchParams.get("title");
    const retry = searchParams.get("retry");

    // Parse legacy episodeId if explicit animeId or episode is missing
    if (episodeId) {
      if (episodeId.startsWith("anizip:") || episodeId.startsWith("ep:")) {
        const parts = episodeId.split(":");
        if (!animeId && parts[1]) animeId = parts[1];
        if (!episode && parts[2]) episode = parts[2];
      } else if (episodeId.includes(":")) {
        const parts = episodeId.split(":");
        if (!episode && !isNaN(Number(parts[parts.length - 1]))) {
          episode = parts[parts.length - 1];
        }
        if (!animeId && parts[1]) {
          animeId = parts[1];
        }
      } else if (!episode && !isNaN(Number(episodeId))) {
        episode = episodeId;
      }
    }

    if (!animeId && !malId) {
      return NextResponse.json(
        { error: "Anime ID or MAL ID is required to resolve stream sources." },
        { status: 400 }
      );
    }

    const streamData = await resolveStreamingSources({
      animeId: animeId ? Number(animeId) || animeId : null,
      episode: Number(episode) || 1,
      isDub,
      malId: malId ? Number(malId) : null,
      tmdbId: tmdbId ? Number(tmdbId) : null,
      title,
      retry: retry ? Number(retry) || 0 : null,
    });

    if (!streamData?.success || !streamData?.sources?.length) {
      return NextResponse.json(
        {
          error: streamData?.error || "No playable stream source could be found for this episode.",
          sources: [],
          subtitles: [],
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        provider: streamData.provider,
        sources: streamData.sources,
        subtitles: streamData.subtitles || [],
        intro: streamData.intro || null,
        outro: streamData.outro || null,
        headers: streamData.sources[0]?.headers || {},
        pk: streamData.pk || streamData.sources[0]?.pk || "",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Watch route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to resolve streaming sources." },
      { status: 500 }
    );
  }
}

import { AiringScheduleAnilist } from "@/lib/Anilistfunction";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "150", 10);
    const start = searchParams.get("start") ? parseInt(searchParams.get("start"), 10) : null;
    const end = searchParams.get("end") ? parseInt(searchParams.get("end"), 10) : null;

    const rawSchedules = await AiringScheduleAnilist(start, end, limit);

    // Format and sanitize items
    const schedule = rawSchedules
      .filter((item) => item?.media?.id && (item.media.title?.english || item.media.title?.romaji || item.media.title?.userPreferred))
      .map((item) => {
        const media = item.media;
        const title =
          media.title?.english ||
          media.title?.romaji ||
          media.title?.userPreferred ||
          "Untitled Anime";

        const image =
          media.coverImage?.extraLarge ||
          media.coverImage?.large ||
          "/placeholder.png";

        const score = media.averageScore
          ? (media.averageScore / 10).toFixed(1)
          : null;

        const studio = media.studios?.nodes?.[0]?.name || null;

        return {
          id: media.id,
          title,
          image,
          episode: item.episode,
          airingAt: item.airingAt,
          timeUntilAiring: item.timeUntilAiring,
          format: media.format || "TV",
          status: media.status || "RELEASING",
          genres: media.genres || [],
          score,
          studio,
        };
      });

    return NextResponse.json(
      {
        success: true,
        count: schedule.length,
        schedule,
        updatedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    console.error("Error in schedule route:", error?.message || error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch airing schedule" },
      { status: 500 }
    );
  }
}

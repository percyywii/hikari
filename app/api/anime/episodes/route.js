import { getEpisodes } from "@/actions/episode";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    const animeId = decodeURIComponent(req.nextUrl.searchParams.get("animeid"))
    const titles = JSON.parse(decodeURIComponent(req.nextUrl.searchParams.get("tits")) || "{}")



    const hasValidTitle = Boolean(titles?.english || titles?.romaji || titles?.native || titles?.userPreferred);
    if (!animeId || !hasValidTitle) {
      return NextResponse.json({ error: "Anime ID or title is required" }, { status: 400 });
    }

    const data = await getEpisodes(animeId, titles);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error handling GET request:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch streaming data. Please try again later." },
      { status: 500 }
    );
  }
}

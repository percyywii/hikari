import { NextResponse } from "next/server";
import { AdvancedSearch } from "@/lib/Anilistfunction";

export async function GET(request) {
  const query = request.nextUrl.searchParams.get("query")?.trim();

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const page = await AdvancedSearch(query, null, null, null, null, null, 1);
    const results = (page?.media || []).map((anime) => ({
      id: anime.id,
      title: anime.title,
      image: anime.coverImage?.large || anime.coverImage?.extraLarge,
      rating: anime.averageScore,
      type: anime.format || anime.type,
      status: anime.status,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error fetching search results:", error);
    return NextResponse.json(
      { error: "Failed to fetch search results" },
      { status: 502 }
    );
  }
}

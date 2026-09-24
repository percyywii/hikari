import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req) {
  const anilistId = req.nextUrl.searchParams.get("id") || "151807";
  const ep = req.nextUrl.searchParams.get("ep") || "1";
  const url = `https://reanime.to/api/flix/${anilistId}/${ep}`;
  const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json, */*",
        Referer: "https://reanime.to/",
      },
      signal: AbortSignal.timeout(8000),
    });
    const text = await res.text();
    return NextResponse.json({
      status: res.status,
      ok: res.ok,
      runtime: "edge",
      headers: Object.fromEntries(res.headers.entries()),
      bodyPreview: text.slice(0, 500),
    });
  } catch (err) {
    return NextResponse.json({
      error: err.message,
      name: err.name,
      code: err.code,
      runtime: "edge",
    });
  }
}

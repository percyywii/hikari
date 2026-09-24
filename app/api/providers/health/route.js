import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const sourceApiUrl = process.env.SOURCE_API_URL?.replace(/\/$/, "");
  if (!sourceApiUrl) {
    return NextResponse.json({ providers: [], message: "Source API is not configured" });
  }

  try {
    const response = await fetch(`${sourceApiUrl}/api/providers/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.ok ? 200 : 503 });
  } catch (error) {
    return NextResponse.json(
      { providers: [], error: { code: "SOURCE_API_UNAVAILABLE", message: error.message } },
      { status: 503 }
    );
  }
}

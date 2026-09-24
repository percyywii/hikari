import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const sourceApiUrl = process.env.SOURCE_API_URL?.replace(/\/$/, "");
  if (!sourceApiUrl) {
    return NextResponse.json({ ok: true, service: "next-app", sourceApi: "not configured" });
  }

  try {
    const response = await fetch(`${sourceApiUrl}/api/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    const data = await response.json();
    return NextResponse.json({ ok: response.ok, service: "next-app", sourceApi: data }, { status: response.ok ? 200 : 503 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, service: "next-app", sourceApi: { status: "unavailable" }, error: error.message },
      { status: 503 }
    );
  }
}

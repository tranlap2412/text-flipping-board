import { NextResponse } from "next/server";
import { fetchZingLyrics } from "@/lib/zing-lyric-fetch";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Query parameter 'id' is required" },
      { status: 400 },
    );
  }

  try {
    const lyrics = await fetchZingLyrics(id);

    if (!lyrics) {
      return NextResponse.json(
        { success: false, error: "Lyrics not available for this track" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: lyrics });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Lyric lookup failed",
      },
      { status: 500 },
    );
  }
}

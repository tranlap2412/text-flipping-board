import { NextResponse } from "next/server";
import { getZingClient } from "@/lib/zing-client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json(
      { success: false, error: "Query parameter 'q' is required" },
      { status: 400 },
    );
  }

  try {
    const results = await getZingClient().search(query, "music");

    return NextResponse.json({
      success: true,
      data: results.map((song) => ({
        id: song.id,
        name: song.name,
        artist: song.artists.map((artist) => artist.name).join(", "),
        thumbnail: song.thumbnail?.w94 ?? null,
      })),
    });
  } catch (error) {
    console.error("Zing search error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Search failed",
      },
      { status: 500 },
    );
  }
}

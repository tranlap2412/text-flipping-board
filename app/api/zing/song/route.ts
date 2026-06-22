import { NextResponse } from "next/server";
import { getZingClient } from "@/lib/zing-client";

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
    const song = await getZingClient().mediaDetails(id);

    return NextResponse.json({
      success: true,
      data: {
        id: song.id,
        name: song.name,
        artist: song.artists.map((artist) => artist.name).join(", "),
        thumbnail: song.thumbnail?.w94 ?? null,
      },
    });
  } catch (error) {
    console.error("Zing song info error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Song lookup failed",
      },
      { status: 500 },
    );
  }
}

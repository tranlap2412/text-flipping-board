import { NextResponse } from "next/server";
import { resolveZingStreamUrl } from "@/lib/zing-stream-url";

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
    const url = await resolveZingStreamUrl(id);
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Zing stream-url error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Stream URL failed",
      },
      { status: 500 },
    );
  }
}

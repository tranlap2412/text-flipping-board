import { Readable } from "node:stream";
import { getZingClient } from "@/lib/zing-client";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();

  if (!id) {
    return Response.json(
      { success: false, error: "Query parameter 'id' is required" },
      { status: 400 },
    );
  }

  try {
    const stream = await getZingClient().music(id);
    const webStream = Readable.toWeb(stream) as ReadableStream;

    return new Response(webStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Stream failed",
      },
      { status: 500 },
    );
  }
}

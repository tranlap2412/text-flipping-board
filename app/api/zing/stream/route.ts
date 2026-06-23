import { Readable } from "node:stream";
import { getZingClient, getZingClientCtime } from "@/lib/zing-client";
import {
  buildZingStreamDebug,
  logZingStreamEvent,
} from "@/lib/zing-error";

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

  const client = getZingClient();
  const clientCtime = getZingClientCtime(client);

  try {
    logZingStreamEvent("info", {
      event: "start",
      songId: id,
      clientCtime,
      clientCtimeAgeSec: Math.max(
        0,
        Math.floor(Date.now() / 1000) - Number.parseInt(clientCtime, 10),
      ),
    });

    const stream = await client.music(id);
    const webStream = Readable.toWeb(stream) as ReadableStream;

    logZingStreamEvent("info", {
      event: "ok",
      songId: id,
      clientCtime,
    });

    return new Response(webStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    const debug = buildZingStreamDebug(id, clientCtime, error);

    logZingStreamEvent("error", {
      event: "fail",
      ...debug,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return Response.json(
      {
        success: false,
        error: debug.message,
        debug,
      },
      { status: 500 },
    );
  }
}

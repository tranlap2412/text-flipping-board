import { probeZingStream } from "@/lib/zing-probe";
import { logZingStreamEvent } from "@/lib/zing-error";

export const runtime = "nodejs";

/** Diagnostic endpoint — returns raw Zing API steps without streaming audio. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();

  if (!id) {
    return Response.json(
      { success: false, error: "Query parameter 'id' is required" },
      { status: 400 },
    );
  }

  const probe = await probeZingStream(id);

  logZingStreamEvent("info", {
    event: "probe",
    ...probe,
  });

  const streamingOk =
    probe.streaming?.err === 0 ||
    (probe.streaming?.err === -1150 && probe.vipRetry?.err === 0);

  return Response.json({
    success: streamingOk,
    probe,
  });
}

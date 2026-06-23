import { Client } from "@khang07/zing-mp3-api";

interface ZingLapseLike {
  name?: string;
  message: string;
  code?: string;
  status?: number;
  cause?: unknown;
}

export interface ZingStreamDebugInfo {
  songId: string;
  clientCtime: string;
  clientCtimeAgeSec: number;
  zingCode?: string;
  zingStatus?: number;
  message: string;
  at: string;
}

export function getClientCtimeAgeSec(ctime: string): number {
  const parsed = Number.parseInt(ctime, 10);
  if (Number.isNaN(parsed)) return -1;
  return Math.max(0, Math.floor(Date.now() / 1000) - parsed);
}

export function buildZingStreamDebug(
  songId: string,
  clientCtime: string,
  error: unknown,
): ZingStreamDebugInfo {
  const lapse = error as ZingLapseLike;
  const isLapse = lapse?.name === "ZING_MP3_ERROR";

  return {
    songId,
    clientCtime,
    clientCtimeAgeSec: getClientCtimeAgeSec(clientCtime),
    zingCode: isLapse ? lapse.code : undefined,
    zingStatus: isLapse ? lapse.status : undefined,
    message: error instanceof Error ? error.message : "Stream failed",
    at: new Date().toISOString(),
  };
}

export function logZingStreamEvent(
  level: "info" | "error",
  payload: Record<string, unknown>,
) {
  const line = JSON.stringify({ scope: "zing/stream", ...payload });
  if (level === "error") {
    console.error(line);
  } else {
    console.log(line);
  }
}

export type { Client };

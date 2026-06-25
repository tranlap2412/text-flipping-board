import crypto from "node:crypto";
import { parseZingLyricResponse } from "@/lib/parse-zing-lyric";
import type { SongLyrics } from "@/lib/zing-lyric-types";

const ZING_BASE = "https://zingmp3.vn";
const LYRIC_VERSION = "1.6.34";
const LYRIC_SECRET = "2aa2d1c561e809b267f3638c4a307aab";
const LYRIC_API_KEY = "88265e23d4284f25963e6eedac8fbfa3";
const LYRIC_PATH = "/api/v2/lyric/get/lyric";

function signLyricRequest(songId: string, ctime: string): string {
  const hash256 = crypto
    .createHash("sha256")
    .update(`ctime=${ctime}id=${songId}version=${LYRIC_VERSION}`)
    .digest("hex");

  return crypto
    .createHmac("sha512", LYRIC_SECRET)
    .update(LYRIC_PATH + hash256)
    .digest("hex");
}

async function getZingCookie(): Promise<string | undefined> {
  const response = await fetch(ZING_BASE, { redirect: "follow" });
  const cookies =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [];

  if (cookies.length > 0) {
    return cookies.map((entry) => entry.split(";")[0]).join("; ");
  }

  const header = response.headers.get("set-cookie");
  if (!header) return undefined;

  return header
    .split(",")
    .map((part) => part.split(";")[0].trim())
    .join("; ");
}

type LyricApiBody = {
  err: number;
  data?: { sentences?: unknown[] };
};

async function fetchLyricApiBody(
  songId: string,
  cookie?: string,
): Promise<LyricApiBody | null> {
  const id = songId.trim();
  if (!id) return null;

  const ctime = String(Math.floor(Date.now() / 1000));
  const sig = signLyricRequest(id, ctime);

  const url = new URL(`${ZING_BASE}${LYRIC_PATH}`);
  url.searchParams.set("id", id);
  url.searchParams.set("ctime", ctime);
  url.searchParams.set("version", LYRIC_VERSION);
  url.searchParams.set("apiKey", LYRIC_API_KEY);
  url.searchParams.set("sig", sig);

  const resolvedCookie = cookie ?? (await getZingCookie());

  const response = await fetch(url, {
    headers: resolvedCookie ? { Cookie: resolvedCookie } : undefined,
  });

  if (!response.ok) return null;
  return (await response.json()) as LyricApiBody;
}

export async function checkZingLyricsAvailable(
  songId: string,
  cookie?: string,
): Promise<boolean> {
  const resolvedCookie = cookie ?? (await getZingCookie());
  const body = await fetchLyricApiBody(songId, resolvedCookie);
  if (!body || body.err !== 0 || !body.data) return false;
  return Array.isArray(body.data.sentences) && body.data.sentences.length > 0;
}

export async function checkZingLyricsBatch(
  songIds: string[],
): Promise<Record<string, boolean>> {
  const uniqueIds = [...new Set(songIds.map((id) => id.trim()).filter(Boolean))];
  if (uniqueIds.length === 0) return {};

  const cookie = await getZingCookie();
  const entries = await Promise.all(
    uniqueIds.map(async (id) => {
      const hasLyric = await checkZingLyricsAvailable(id, cookie);
      return [id, hasLyric] as const;
    }),
  );

  return Object.fromEntries(entries);
}

export async function fetchZingLyrics(songId: string): Promise<SongLyrics | null> {
  const body = await fetchLyricApiBody(songId);
  if (!body || body.err !== 0 || !body.data) return null;
  return parseZingLyricResponse(
    songId.trim(),
    body.data as Parameters<typeof parseZingLyricResponse>[1],
  );
}

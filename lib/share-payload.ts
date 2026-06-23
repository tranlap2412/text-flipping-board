import type { MusicSelection } from "@/lib/music-types";
import {
  DEFAULT_MUSIC_SELECTION,
  DEFAULT_ONLINE_SONG,
  parseMusicParam,
} from "@/lib/music-types";
import type { BoardStep, StepAdvanceMode } from "@/lib/steps";
import { createStep, decodeStepsPayload } from "@/lib/steps";

/** Compact on-wire shape (short keys → smaller before compression) */
interface CompactSharePayload {
  s: string[];
  m?: "a";
  i?: number;
  mu?: string;
  l?: string;
}

export interface DecodedShareState {
  steps: BoardStep[];
  advanceMode: StepAdvanceMode;
  autoInterval: number;
  musicSelection: MusicSelection;
  passwordHash: string | null;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + "=".repeat(padLen));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deflateUtf8(text: string): Promise<string> {
  const input = new TextEncoder().encode(text);
  const stream = new Blob([input])
    .stream()
    .pipeThrough(new CompressionStream("deflate"));
  const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
  return toBase64Url(compressed);
}

async function inflateToUtf8(encoded: string): Promise<string> {
  const bytes = fromBase64Url(encoded);
  const stream = new Blob([new Uint8Array(bytes)])
    .stream()
    .pipeThrough(new DecompressionStream("deflate"));
  return new Response(stream).text();
}

function serializeMusicCompact(selection: MusicSelection): string | undefined {
  if (
    selection.mode === "online" &&
    selection.onlineSong?.id === DEFAULT_ONLINE_SONG.id
  ) {
    return undefined;
  }
  if (selection.mode === "online" && selection.onlineSong) {
    return `o:${selection.onlineSong.id}`;
  }
  if (selection.mode === "preset") {
    return `p:${selection.presetId}`;
  }
  return undefined;
}

function parseMusicCompact(value: string | undefined): MusicSelection {
  if (!value) return DEFAULT_MUSIC_SELECTION;

  if (value.startsWith("o:")) {
    const id = value.slice(2);
    if (id === DEFAULT_ONLINE_SONG.id) return DEFAULT_MUSIC_SELECTION;
    return {
      mode: "online",
      presetId: DEFAULT_MUSIC_SELECTION.presetId,
      onlineSong: { id, name: "Zing MP3 Track", artist: "" },
    };
  }

  if (value.startsWith("p:")) {
    const presetId = value.slice(2);
    return { mode: "preset", presetId, onlineSong: null };
  }

  return DEFAULT_MUSIC_SELECTION;
}

function toCompactPayload(
  steps: BoardStep[],
  advanceMode: StepAdvanceMode,
  autoInterval: number,
  musicSelection: MusicSelection,
  passwordHash?: string | null,
): CompactSharePayload {
  const payload: CompactSharePayload = {
    s: steps.map((step) => step.text),
  };

  if (advanceMode === "auto") {
    payload.m = "a";
    if (autoInterval !== 5) payload.i = autoInterval;
  }

  const mu = serializeMusicCompact(musicSelection);
  if (mu) payload.mu = mu;

  if (passwordHash) payload.l = passwordHash;

  return payload;
}

function fromCompactPayload(payload: CompactSharePayload): DecodedShareState | null {
  if (!Array.isArray(payload.s) || payload.s.length === 0) return null;

  return {
    steps: payload.s.map((text) => createStep(text)),
    advanceMode: payload.m === "a" ? "auto" : "manual",
    autoInterval:
      typeof payload.i === "number"
        ? Math.min(30, Math.max(2, payload.i))
        : 5,
    musicSelection: parseMusicCompact(payload.mu),
    passwordHash: payload.l?.trim() || null,
  };
}

/** v2: single compressed `d` param — much shorter than raw base64 JSON in `data` */
export async function encodeShareToken(
  steps: BoardStep[],
  advanceMode: StepAdvanceMode,
  autoInterval: number,
  musicSelection: MusicSelection,
  passwordHash?: string | null,
): Promise<string> {
  const json = JSON.stringify(
    toCompactPayload(steps, advanceMode, autoInterval, musicSelection, passwordHash),
  );
  return deflateUtf8(json);
}

export async function decodeShareToken(token: string): Promise<DecodedShareState | null> {
  try {
    const json = await inflateToUtf8(token);
    const payload = JSON.parse(json) as CompactSharePayload;
    return fromCompactPayload(payload);
  } catch {
    return null;
  }
}

/** Legacy: ?data=&music=&lock=&view= */
export function decodeLegacyShareParams(params: URLSearchParams): DecodedShareState | null {
  const dataParam = params.get("data");
  if (!dataParam) return null;

  const decoded = decodeStepsPayload(dataParam);
  if (!decoded) return null;

  const musicParam = params.get("music");
  const lockParam = params.get("lock")?.trim() || null;

  let musicSelection = DEFAULT_MUSIC_SELECTION;
  if (musicParam) {
    musicSelection = parseMusicParam(musicParam);
  }

  return {
    steps: decoded.steps,
    advanceMode: decoded.advanceMode,
    autoInterval: decoded.autoInterval,
    musicSelection,
    passwordHash: lockParam,
  };
}

export async function decodeShareFromSearchParams(
  params: URLSearchParams,
): Promise<DecodedShareState | null> {
  const compact = params.get("d");
  if (compact) {
    const decoded = await decodeShareToken(compact);
    if (decoded) return decoded;
  }

  return decodeLegacyShareParams(params);
}

export function isShareUrl(params: URLSearchParams): boolean {
  return params.has("d") || params.has("data");
}

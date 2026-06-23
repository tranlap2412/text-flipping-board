import {
  DEFAULT_MUSIC_ID,
  findPresetById,
  type MusicPreset,
} from "@/lib/music-presets";
import { ZING_API_ENABLED } from "@/lib/deploy";

export type MusicSourceMode = "preset" | "online";

export interface OnlineSong {
  id: string;
  name: string;
  artist: string;
  thumbnail?: string | null;
}

export interface MusicSelection {
  mode: MusicSourceMode;
  presetId: string;
  onlineSong: OnlineSong | null;
}

/** Default: Shakira — Waka Waka (Esto Es Africa) (K-Mix) on Zing MP3 */
export const DEFAULT_ONLINE_SONG: OnlineSong = {
  id: "ZWZ9EOIO",
  name: "Waka Waka (Esto Es Africa) (K-Mix)",
  artist: "Shakira",
  thumbnail:
    "https://photo-resize-zmp3.zmdcdn.me/w94_r1x1_jpeg/cover/3/2/a/3/32a35f4d26ee56366397c09953f6c269.jpg",
};

export const DEFAULT_MUSIC_SELECTION: MusicSelection = {
  mode: "online",
  presetId: DEFAULT_MUSIC_ID,
  onlineSong: DEFAULT_ONLINE_SONG,
};

export function getMusicPlaybackUrl(selection: MusicSelection): string {
  if (
    ZING_API_ENABLED &&
    selection.mode === "online" &&
    selection.onlineSong
  ) {
    return `/api/zing/stream?id=${encodeURIComponent(selection.onlineSong.id)}`;
  }
  if (selection.mode === "online" && selection.onlineSong && !ZING_API_ENABLED) {
    const preset = findPresetById(selection.presetId);
    return preset?.url ?? findPresetById(DEFAULT_MUSIC_ID)!.url;
  }
  const preset = findPresetById(selection.presetId);
  return preset?.url ?? findPresetById(DEFAULT_MUSIC_ID)!.url;
}

export function serializeMusicParam(selection: MusicSelection): string {
  if (selection.mode === "online" && selection.onlineSong) {
    return `online:${selection.onlineSong.id}`;
  }
  return `preset:${selection.presetId}`;
}

export function parseMusicParam(param: string): MusicSelection {
  if (param.startsWith("online:")) {
    const id = param.slice("online:".length);
    if (id) {
      return {
        mode: "online",
        presetId: DEFAULT_MUSIC_ID,
        onlineSong: { id, name: "Zing MP3 Track", artist: "" },
      };
    }
  }

  if (param.startsWith("preset:")) {
    const presetId = param.slice("preset:".length);
    const preset = findPresetById(presetId);
    if (preset) {
      return { mode: "preset", presetId: preset.id, onlineSong: null };
    }
  }

  const legacyPreset = findPresetById(param);
  if (legacyPreset) {
    return { mode: "preset", presetId: legacyPreset.id, onlineSong: null };
  }

  return DEFAULT_MUSIC_SELECTION;
}

export function getMusicTitle(selection: MusicSelection): string {
  if (selection.mode === "online" && selection.onlineSong) {
    return selection.onlineSong.name;
  }
  const preset = findPresetById(selection.presetId);
  return preset?.name ?? "";
}

export function getMusicLabel(selection: MusicSelection): string {
  if (selection.mode === "online" && selection.onlineSong) {
    return `${selection.onlineSong.name} — ${selection.onlineSong.artist}`;
  }
  const preset = findPresetById(selection.presetId);
  return preset?.name ?? "Preset";
}

export function getActivePreset(selection: MusicSelection): MusicPreset {
  return findPresetById(selection.presetId) ?? findPresetById(DEFAULT_MUSIC_ID)!;
}

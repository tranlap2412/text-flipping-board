import {
  parseMusicParam,
  type MusicSelection,
} from "@/lib/music-types";
import {
  decodeShareFromSearchParams,
  encodeShareToken,
  isShareUrl,
  type DecodedShareState,
} from "@/lib/share-payload";
import { decodeStepsPayload, type StepAdvanceMode, type BoardStep } from "@/lib/steps";

export type { DecodedShareState };

export interface SharedBoardPayload {
  steps: BoardStep[];
  advanceMode: StepAdvanceMode;
  autoInterval: number;
}

export interface ParsedBoardUrl {
  sharedPayload: SharedBoardPayload | null;
  musicSelection: MusicSelection | null;
  stepIndex: number | null;
  cinematic: boolean;
  isSharedView: boolean;
  passwordHash: string | null;
}

export function parseBoardSearchParams(
  params: URLSearchParams,
): ParsedBoardUrl {
  const dataParam = params.get("data");
  const viewParam = params.get("view");
  const musicParam = params.get("music");
  const stepParam = params.get("step");
  const lockParam = params.get("lock")?.trim() || null;
  const compactParam = params.get("d");

  let sharedPayload: SharedBoardPayload | null = null;
  if (dataParam) {
    const decoded = decodeStepsPayload(dataParam);
    if (decoded) {
      sharedPayload = {
        steps: decoded.steps,
        advanceMode: decoded.advanceMode,
        autoInterval: decoded.autoInterval,
      };
    }
  }

  let stepIndex: number | null = null;
  if (stepParam) {
    const idx = parseInt(stepParam, 10);
    if (!Number.isNaN(idx) && idx >= 0) {
      stepIndex = idx;
    }
  }

  const isSharedView = Boolean(compactParam || dataParam);
  const cinematic = viewParam === "cinematic" || isSharedView;

  return {
    sharedPayload,
    musicSelection: musicParam ? parseMusicParam(musicParam) : null,
    stepIndex,
    cinematic,
    isSharedView,
    passwordHash: lockParam,
  };
}

export async function buildShareUrl(
  origin: string,
  pathname: string,
  steps: BoardStep[],
  advanceMode: StepAdvanceMode,
  autoInterval: number,
  musicSelection: MusicSelection,
  passwordHash?: string | null,
): Promise<string> {
  const token = await encodeShareToken(
    steps,
    advanceMode,
    autoInterval,
    musicSelection,
    passwordHash,
  );

  const params = new URLSearchParams({ d: token });
  return `${origin}${pathname}?${params.toString()}`;
}

export { decodeShareFromSearchParams, encodeShareToken, isShareUrl };

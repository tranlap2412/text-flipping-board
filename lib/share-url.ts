import {
  parseMusicParam,
  serializeMusicParam,
  type MusicSelection,
} from "@/lib/music-types";
import {
  decodeStepsPayload,
  encodeStepsPayload,
  type StepAdvanceMode,
  type BoardStep,
} from "@/lib/steps";

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
}

export function parseBoardSearchParams(
  params: URLSearchParams,
): ParsedBoardUrl {
  const dataParam = params.get("data");
  const viewParam = params.get("view");
  const musicParam = params.get("music");
  const stepParam = params.get("step");

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

  const isSharedView = Boolean(dataParam);
  const cinematic = viewParam === "cinematic" || isSharedView;

  return {
    sharedPayload,
    musicSelection: musicParam ? parseMusicParam(musicParam) : null,
    stepIndex,
    cinematic,
    isSharedView,
  };
}

export function buildShareUrl(
  origin: string,
  pathname: string,
  steps: BoardStep[],
  advanceMode: StepAdvanceMode,
  autoInterval: number,
  musicSelection: MusicSelection,
): string {
  const encoded = encodeStepsPayload(steps, advanceMode, autoInterval);
  const music = serializeMusicParam(musicSelection);
  const params = new URLSearchParams({
    data: encoded,
    view: "cinematic",
    music,
  });

  return `${origin}${pathname}?${params.toString()}`;
}

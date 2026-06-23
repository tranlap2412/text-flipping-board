export interface BoardStep {
  id: string;
  text: string;
}

export type StepAdvanceMode = "manual" | "auto";

export interface StepsPayload {
  steps: string[];
  advanceMode?: StepAdvanceMode;
  autoInterval?: number;
}

import { welcomeBoardText } from "@/lib/content";

export const DEFAULT_WELCOME_TEXT = welcomeBoardText;

export function createStep(text = ""): BoardStep {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return { id, text };
}

export function createDefaultSteps(): BoardStep[] {
  return [createStep(DEFAULT_WELCOME_TEXT)];
}

export function encodeStepsPayload(
  steps: BoardStep[],
  advanceMode: StepAdvanceMode,
  autoInterval: number,
): string {
  const payload: StepsPayload = {
    steps: steps.map((step) => step.text),
    advanceMode,
    autoInterval,
  };
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

export function decodeStepsPayload(dataParam: string): {
  steps: BoardStep[];
  advanceMode: StepAdvanceMode;
  autoInterval: number;
} | null {
  try {
    const decoded = decodeURIComponent(atob(dataParam));
    const parsed = JSON.parse(decoded) as StepsPayload;
    if (Array.isArray(parsed.steps) && parsed.steps.length > 0) {
      return {
        steps: parsed.steps.map((text) => createStep(text)),
        advanceMode: parsed.advanceMode === "auto" ? "auto" : "manual",
        autoInterval:
          typeof parsed.autoInterval === "number"
            ? Math.min(30, Math.max(2, parsed.autoInterval))
            : 5,
      };
    }
  } catch {
    // fall through to legacy plain-text payload
  }

  try {
    const legacyText = decodeURIComponent(atob(dataParam));
    return {
      steps: [createStep(legacyText)],
      advanceMode: "manual",
      autoInterval: 5,
    };
  } catch {
    return null;
  }
}

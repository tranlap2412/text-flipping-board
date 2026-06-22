"use client";

import { useEffect } from "react";
import { parseBoardSearchParams } from "@/lib/share-url";
import type { MusicSelection } from "@/lib/music-types";
import type { BoardStep, StepAdvanceMode } from "@/lib/steps";

interface BoardUrlBootstrapOptions {
  onSharedPayload: (payload: {
    steps: BoardStep[];
    advanceMode: StepAdvanceMode;
    autoInterval: number;
  }) => void;
  onMusicSelection: (selection: MusicSelection) => void;
  onStepIndex: (index: number) => void;
  onCinematic: (enabled: boolean) => void;
  onSharedView: (enabled: boolean) => void;
}

export function useBoardUrlBootstrap({
  onSharedPayload,
  onMusicSelection,
  onStepIndex,
  onCinematic,
  onSharedView,
}: BoardUrlBootstrapOptions): void {
  useEffect(() => {
    const parsed = parseBoardSearchParams(
      new URLSearchParams(window.location.search),
    );

    if (parsed.sharedPayload) {
      onSharedView(true);
      onSharedPayload(parsed.sharedPayload);
    }

    if (parsed.musicSelection) {
      onMusicSelection(parsed.musicSelection);

      const song = parsed.musicSelection.onlineSong;
      if (parsed.musicSelection.mode === "online" && song) {
        fetch(`/api/zing/song?id=${encodeURIComponent(song.id)}`)
          .then((res) => res.json())
          .then((body) => {
            if (body.success && body.data) {
              onMusicSelection({
                ...parsed.musicSelection!,
                mode: "online",
                onlineSong: body.data,
              });
            }
          })
          .catch(() => undefined);
      }
    }

    if (parsed.stepIndex !== null) {
      onStepIndex(parsed.stepIndex);
    }

    if (parsed.cinematic) {
      onCinematic(true);
    }
    // Run once on mount to hydrate from share URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

"use client";

import { useEffect } from "react";
import { ZING_API_ENABLED } from "@/lib/deploy";
import type { MusicSelection } from "@/lib/music-types";
import { decodeShareFromSearchParams, isShareUrl } from "@/lib/share-url";
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
  onPasswordHash: (hash: string | null) => void;
}

export function useBoardUrlBootstrap({
  onSharedPayload,
  onMusicSelection,
  onStepIndex,
  onCinematic,
  onSharedView,
  onPasswordHash,
}: BoardUrlBootstrapOptions): void {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (!isShareUrl(params)) return;

    onSharedView(true);
    onCinematic(true);

    const stepParam = params.get("step");
    if (stepParam) {
      const idx = parseInt(stepParam, 10);
      if (!Number.isNaN(idx) && idx >= 0) {
        onStepIndex(idx);
      }
    }

    void decodeShareFromSearchParams(params).then((decoded) => {
      if (!decoded) return;

      onSharedPayload({
        steps: decoded.steps,
        advanceMode: decoded.advanceMode,
        autoInterval: decoded.autoInterval,
      });
      onMusicSelection(decoded.musicSelection);
      onPasswordHash(decoded.passwordHash);

      const song = decoded.musicSelection.onlineSong;
      if (
        ZING_API_ENABLED &&
        decoded.musicSelection.mode === "online" &&
        song &&
        song.name === "Zing MP3 Track"
      ) {
        fetch(`/api/zing/song?id=${encodeURIComponent(song.id)}`)
          .then((res) => res.json())
          .then((body) => {
            if (body.success && body.data) {
              onMusicSelection({
                ...decoded.musicSelection,
                mode: "online",
                onlineSong: body.data,
              });
            }
          })
          .catch(() => undefined);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

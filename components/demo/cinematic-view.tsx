"use client";

import { useEffect, useLayoutEffect, useMemo } from "react";
import { TextFlippingBoard } from "@/components/ui/text-flipping-board";
import { DeckToast } from "@/components/demo/deck-toast";
import { SpinningDisc } from "@/components/demo/spinning-disc";
import { StepNavigator } from "@/components/demo/step-editor";
import {
  getMusicTitle,
  type MusicSelection,
} from "@/lib/music-types";
import { SyncedLyricsPanel } from "@/components/synced-lyrics-panel";
import type { StepAdvanceMode } from "@/lib/steps";

interface CinematicViewProps {
  boardText: string;
  duration: number;
  stepIndex: number;
  totalSteps: number;
  advanceMode: StepAdvanceMode;
  autoInterval: number;
  musicSelection: MusicSelection;
  playMusic: boolean;
  showToast: boolean;
  toastMessage: string;
  onStepPrev: () => void;
  onStepNext: () => void;
  onPlayRequest: () => void;
}

export function CinematicView({
  boardText,
  duration,
  stepIndex,
  totalSteps,
  advanceMode,
  autoInterval,
  musicSelection,
  playMusic,
  showToast,
  toastMessage,
  onStepPrev,
  onStepNext,
  onPlayRequest,
}: CinematicViewProps) {
  const songTitle = getMusicTitle(musicSelection);
  const onlineSong =
    musicSelection.mode === "online" ? musicSelection.onlineSong : null;
  const lyricSongId =
    playMusic && onlineSong ? onlineSong.id : null;

  const lyricMeta = useMemo(() => {
    if (!onlineSong) return undefined;
    return {
      title: onlineSong.name,
      artist: onlineSong.artist,
      thumbnail: onlineSong.thumbnail,
    };
  }, [onlineSong]);

  const nowPlayingTitle = lyricMeta?.title ?? songTitle;
  const nowPlayingArtist = lyricMeta?.artist;
  const nowPlayingThumbnail = onlineSong?.thumbnail ?? null;
  const showNowPlaying = playMusic && Boolean(nowPlayingTitle);

  useLayoutEffect(() => {
    if (playMusic) onPlayRequest();
  }, [playMusic, musicSelection, onPlayRequest]);

  useEffect(() => {
    if (advanceMode !== "auto" || totalSteps <= 1) return;
    const delay = (duration + autoInterval) * 1000;
    const timer = setTimeout(onStepNext, delay);
    return () => clearTimeout(timer);
  }, [
    advanceMode,
    autoInterval,
    duration,
    stepIndex,
    totalSteps,
    boardText,
    onStepNext,
  ]);

  return (
    <div className="fixed inset-0 z-20 overflow-hidden">
      {showToast && <DeckToast message={toastMessage} />}

      <div
        className="absolute inset-0 flex items-center justify-center px-4"
        style={{
          paddingBottom: showNowPlaying ? "7.5rem" : "3rem",
          paddingTop: "2rem",
        }}
      >
        <div className="mx-auto w-full max-w-[min(44rem,96vw)] md:max-w-[min(64rem,78vw)] lg:max-w-[min(72rem,85vw)]">
          <TextFlippingBoard
            text={boardText}
            duration={duration}
            className="w-full bg-transparent p-3 sm:p-4 md:p-5"
          />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-[4.75rem] z-10 flex flex-col items-center justify-center gap-2 px-4">
        <SyncedLyricsPanel
          songId={lyricSongId}
          enabled={playMusic}
          className="mx-auto"
        />

        {advanceMode === "manual" && totalSteps > 1 && (
          <StepNavigator
            stepIndex={stepIndex}
            totalSteps={totalSteps}
            onPrev={onStepPrev}
            onNext={onStepNext}
            minimal
          />
        )}

        {advanceMode === "auto" && totalSteps > 1 && (
          <span className="text-center font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            Step {stepIndex + 1} / {totalSteps} · Auto
          </span>
        )}
      </div>

      {showNowPlaying && (
        <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex w-full max-w-xl items-start justify-center gap-2">
            <SpinningDisc
              thumbnail={nowPlayingThumbnail}
              alt={nowPlayingTitle}
            />
            <div className="min-w-0 max-w-[min(16rem,52vw)] pt-0.5 text-left">
              <p className="truncate text-sm font-semibold tracking-tight text-foreground/90">
                {nowPlayingTitle}
              </p>
              {nowPlayingArtist && (
                <p className="truncate text-xs text-muted-foreground/60">
                  {nowPlayingArtist}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

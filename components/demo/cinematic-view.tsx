"use client";

import { useEffect } from "react";
import { Music } from "lucide-react";
import { TextFlippingBoard } from "@/components/ui/text-flipping-board";
import { BackgroundMusicPlayer } from "@/components/background-music-player";
import { DeckToast } from "@/components/demo/deck-toast";
import { StepNavigator } from "@/components/demo/step-editor";
import { Button } from "@/components/ui/button";
import {
  getMusicPlaybackUrl,
  getMusicTitle,
  type MusicSelection,
} from "@/lib/music-types";
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
  playTrigger: number;
  musicBlocked: boolean;
  showToast: boolean;
  toastMessage: string;
  onStepPrev: () => void;
  onStepNext: () => void;
  onPlayRequest: () => void;
  onPlayBlocked: () => void;
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
  playTrigger,
  musicBlocked,
  showToast,
  toastMessage,
  onStepPrev,
  onStepNext,
  onPlayRequest,
  onPlayBlocked,
}: CinematicViewProps) {
  const playbackUrl = getMusicPlaybackUrl(musicSelection);
  const songTitle = getMusicTitle(musicSelection);

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
    <div className="fixed inset-0 z-20 flex items-center justify-center">
      {showToast && <DeckToast message={toastMessage} />}

      <div className="w-full max-w-[min(44rem,96vw)] md:max-w-[min(64rem,78vw)] lg:max-w-[min(72rem,85vw)]">
        <TextFlippingBoard
          text={boardText}
          duration={duration}
          className="bg-transparent p-3 shadow-[0_0_50px_color-mix(in_oklch,var(--primary)_10%,transparent)] sm:p-4 md:p-5"
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-gradient-to-t from-background/90 via-background/45 to-transparent pt-16 pb-8">
        <div className="pointer-events-auto flex flex-col items-center gap-3">
          {songTitle && (
            <p className="flex max-w-[90vw] items-center gap-1.5 truncate font-mono text-[10px] tracking-widest text-primary/70 uppercase">
              <Music className="h-3 w-3 shrink-0" />
              {songTitle}
            </p>
          )}

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
            <span className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
              Step {stepIndex + 1} / {totalSteps} · Auto
            </span>
          )}

          {musicBlocked && playMusic && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={onPlayRequest}
              className="border-amber-500/30 text-amber-300/80 hover:text-amber-200"
            >
              Tap to play music
            </Button>
          )}
        </div>
      </div>

      <BackgroundMusicPlayer
        url={playbackUrl}
        playing={playMusic}
        playTrigger={playTrigger}
        onPlayBlocked={onPlayBlocked}
        hidden
      />
    </div>
  );
}

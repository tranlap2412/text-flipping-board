"use client";

import { memo } from "react";
import { StepNavigator } from "@/components/demo/step-editor";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TextFlippingBoard } from "@/components/ui/text-flipping-board";
import type { StepAdvanceMode } from "@/lib/steps";

interface BoardPreviewPanelProps {
  boardText: string;
  duration: number;
  previewStepIndex: number;
  totalSteps: number;
  advanceMode: StepAdvanceMode;
  isDirty: boolean;
  onPreviewStepPrev: () => void;
  onPreviewStepNext: () => void;
}

const MemoizedBoard = memo(function MemoizedBoard({
  boardText,
  duration,
}: {
  boardText: string;
  duration: number;
}) {
  return (
    <TextFlippingBoard
      text={boardText}
      duration={duration}
      className="!max-w-full !border-0 !bg-transparent !p-0 !shadow-none"
    />
  );
});

export function BoardPreviewPanel({
  boardText,
  duration,
  previewStepIndex,
  totalSteps,
  advanceMode,
  isDirty,
  onPreviewStepPrev,
  onPreviewStepNext,
}: BoardPreviewPanelProps) {
  return (
    <Card className="studio-panel overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping bg-primary/60 opacity-75" />
                <span className="relative inline-flex h-2 w-2 bg-primary" />
              </span>
              <CardTitle className="text-sm uppercase tracking-wider">
                Live preview
              </CardTitle>
            </div>
          </div>
          {totalSteps > 1 && (
            <StepNavigator
              stepIndex={previewStepIndex}
              totalSteps={totalSteps}
              onPrev={onPreviewStepPrev}
              onNext={onPreviewStepNext}
            />
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
          <Badge variant="outline" className="border-primary/25 bg-primary/5 text-primary">
            Step {previewStepIndex + 1} of {totalSteps}
          </Badge>
          <Badge variant="outline" className="border-border/60">
            {advanceMode === "auto" ? "Auto advance" : "Manual advance"}
          </Badge>
          {isDirty && (
            <Badge variant="outline" className="border-amber-500/30 text-amber-400/90">
              Unsaved edits
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="border border-border bg-muted/20 p-3 sm:p-4 md:p-5">
          <MemoizedBoard boardText={boardText} duration={duration} />
        </div>
      </CardContent>
    </Card>
  );
}

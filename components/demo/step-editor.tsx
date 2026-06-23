"use client";

import { ChevronLeft, ChevronRight, Layers, Plus, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { BoardStep, StepAdvanceMode } from "@/lib/steps";
import { stepEditorCopy } from "@/lib/content";

interface StepEditorProps {
  steps: BoardStep[];
  activeIndex: number;
  isActiveStepDirty: boolean;
  isStepDirty: (index: number) => boolean;
  advanceMode: StepAdvanceMode;
  autoInterval: number;
  onActiveIndexChange: (index: number) => void;
  onStepTextChange: (index: number, text: string) => void;
  onStepBlur: (index: number) => void;
  onSaveToPreview: () => void;
  onAddStep: () => void;
  onRemoveStep: (index: number) => void;
  onAdvanceModeChange: (mode: StepAdvanceMode) => void;
  onAutoIntervalChange: (seconds: number) => void;
}

export function StepEditor({
  steps,
  activeIndex,
  isActiveStepDirty,
  isStepDirty,
  advanceMode,
  autoInterval,
  onActiveIndexChange,
  onStepTextChange,
  onStepBlur,
  onSaveToPreview,
  onAddStep,
  onRemoveStep,
  onAdvanceModeChange,
  onAutoIntervalChange,
}: StepEditorProps) {
  const activeStep = steps[activeIndex];
  const charCount = activeStep?.text.length ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-none border border-border/60 bg-muted/10 p-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold tracking-wider uppercase">
            {stepEditorCopy.steps(steps.length)}
          </h3>
          </div>
        <Button type="button" variant="outline" size="xs" onClick={onAddStep}>
          <Plus data-icon="inline-start" />
          {stepEditorCopy.addStep}
        </Button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {steps.map((step, index) => (
            <Button
              key={step.id}
              type="button"
              variant={index === activeIndex ? "default" : "outline"}
              size="xs"
              onClick={() => onActiveIndexChange(index)}
              className="gap-1"
            >
              Step {index + 1}
              {isStepDirty(index) && (
                <span className="h-1.5 w-1.5 bg-amber-400" />
              )}
              {steps.length > 1 && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveStep(index);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemoveStep(index);
                    }
                  }}
                  className="rounded p-0.5 opacity-50 hover:text-destructive hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3" />
                </span>
              )}
            </Button>
          ))}
        </div>
      </section>

      {activeStep && (
        <section className="rounded-none border border-primary/15 bg-muted/10 p-4">
          <div className="mb-3 flex items-center justify-between gap-2 border-b border-border/40 pb-3">
            <Label htmlFor="step-content" className="text-sm font-semibold">
              {stepEditorCopy.messageText(activeIndex)}
            </Label>
            <Badge variant="outline" className="shrink-0 tabular-nums">
              {charCount} / 132
            </Badge>
          </div>

          <Textarea
            id="step-content"
            value={activeStep.text}
            onChange={(e) => onStepTextChange(activeIndex, e.target.value)}
            onBlur={() => onStepBlur(activeIndex)}
            placeholder={stepEditorCopy.placeholder}
            rows={6}
            maxLength={132}
            className="min-h-[148px] resize-none rounded-none border border-border/50 bg-transparent px-3 py-3 font-mono text-sm uppercase tracking-wider shadow-none focus-visible:border-primary/35 focus-visible:ring-0"
          />

          <div className="mt-3 flex justify-end border-t border-border/40 pt-3">
            <Button
              type="button"
              size="sm"
              disabled={!isActiveStepDirty}
              onClick={onSaveToPreview}
            >
              <Eye data-icon="inline-start" />
              {stepEditorCopy.updatePreview}
            </Button>
          </div>
        </section>
      )}

      {steps.length > 1 && (
        <section className="rounded-none border border-border/60 bg-muted/10 p-4">
          <Label className="mb-3 block text-sm font-semibold">
            {stepEditorCopy.advanceLabel}
          </Label>
          <Tabs
            value={advanceMode}
            onValueChange={(value) =>
              onAdvanceModeChange(value as StepAdvanceMode)
            }
          >
            <TabsList className="w-full">
              <TabsTrigger value="manual" className="flex-1">
                Manual
              </TabsTrigger>
              <TabsTrigger value="auto" className="flex-1">
                Auto
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {advanceMode === "auto" && (
            <div className="mt-4 flex flex-col gap-2 border-t border-border/40 pt-4">
              <div className="flex items-center justify-between">
                <Label>{stepEditorCopy.holdTime}</Label>
                <span className="text-xs font-semibold tabular-nums">
                  {autoInterval}s
                </span>
              </div>
              <Slider
                min={2}
                max={20}
                step={1}
                value={[autoInterval]}
                onValueChange={([value]) => onAutoIntervalChange(value)}
              />
            </div>
          )}
        </section>
      )}
    </div>
  );
}

interface StepNavigatorProps {
  stepIndex: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  minimal?: boolean;
}

export function StepNavigator({
  stepIndex,
  totalSteps,
  onPrev,
  onNext,
  minimal = false,
}: StepNavigatorProps) {
  if (totalSteps <= 1) return null;

  return (
    <div className={`flex items-center gap-3 ${minimal ? "opacity-80" : ""}`}>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={onPrev}
        disabled={stepIndex === 0}
        aria-label="Previous step"
      >
        <ChevronLeft />
      </Button>
      <span className="text-xs font-semibold tabular-nums tracking-widest text-muted-foreground">
        {stepIndex + 1} / {totalSteps}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={onNext}
        disabled={stepIndex >= totalSteps - 1}
        aria-label="Next step"
      >
        <ChevronRight />
      </Button>
    </div>
  );
}

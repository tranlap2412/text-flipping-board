"use client";

import { Share2, Maximize2, Sparkles } from "lucide-react";
import { BoardPreviewPanel } from "@/components/demo/board-preview-panel";
import { DeckToast } from "@/components/demo/deck-toast";
import { MusicControls } from "@/components/demo/music-controls";
import { SharePasswordSettings } from "@/components/demo/share-password-settings";
import { SiteFooter } from "@/components/demo/site-footer";
import { StepEditor } from "@/components/demo/step-editor";
import { WhatThisIsCard } from "@/components/demo/what-this-is-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { MusicSelection } from "@/lib/music-types";
import type { BoardStep, StepAdvanceMode } from "@/lib/steps";
import { dashboardCopy, siteCopy } from "@/lib/content";

interface DashboardViewProps {
  steps: BoardStep[];
  activeStepIndex: number;
  previewStepIndex: number;
  previewBoardText: string;
  isPreviewDirty: boolean;
  isActiveStepDirty: boolean;
  isStepDirty: (index: number) => boolean;
  advanceMode: StepAdvanceMode;
  autoInterval: number;
  duration: number;
  soundOn: boolean;
  musicSelection: MusicSelection;
  playMusic: boolean;
  showToast: boolean;
  toastMessage: string;
  onActiveStepIndexChange: (index: number) => void;
  onStepTextChange: (index: number, text: string) => void;
  onStepBlur: (index: number) => void;
  onSaveToPreview: () => void;
  onAddStep: () => void;
  onRemoveStep: (index: number) => void;
  onAdvanceModeChange: (mode: StepAdvanceMode) => void;
  onAutoIntervalChange: (seconds: number) => void;
  onPreviewStepPrev: () => void;
  onPreviewStepNext: () => void;
  onShare: () => void;
  onCinematic: () => void;
  onDurationChange: (value: number) => void;
  onSoundToggle: (enabled: boolean) => void;
  onMusicSelectionChange: (selection: MusicSelection) => void;
  onPlayMusicChange: (playing: boolean) => void;
  onPlayRequest: () => void;
  sharePasswordEnabled: boolean;
  sharePassword: string;
  onSharePasswordEnabledChange: (enabled: boolean) => void;
  onSharePasswordChange: (password: string) => void;
}

export function DashboardView({
  steps,
  activeStepIndex,
  previewStepIndex,
  previewBoardText,
  isPreviewDirty,
  isActiveStepDirty,
  isStepDirty,
  advanceMode,
  autoInterval,
  duration,
  soundOn,
  musicSelection,
  playMusic,
  showToast,
  toastMessage,
  onActiveStepIndexChange,
  onStepTextChange,
  onStepBlur,
  onSaveToPreview,
  onAddStep,
  onRemoveStep,
  onAdvanceModeChange,
  onAutoIntervalChange,
  onPreviewStepPrev,
  onPreviewStepNext,
  onShare,
  onCinematic,
  onDurationChange,
  onSoundToggle,
  onMusicSelectionChange,
  onPlayMusicChange,
  onPlayRequest,
  sharePasswordEnabled,
  sharePassword,
  onSharePasswordEnabledChange,
  onSharePasswordChange,
}: DashboardViewProps) {
  return (
    <div className="flex w-full flex-col gap-5 lg:gap-6">
      {showToast && <DeckToast message={toastMessage} />}

      <header className="studio-panel flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5 md:py-5">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-primary/25 bg-primary/10 md:h-11 md:w-11">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="mb-0.5 text-[10px] font-semibold tracking-[0.2em] text-primary/80 uppercase">
              {siteCopy.subtitle}
            </p>
            <h1 className="font-heading text-xl font-bold tracking-tight md:text-2xl lg:text-3xl">
              {siteCopy.name}
            </h1>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
          <Button type="button" size="sm" onClick={onCinematic}>
            <Maximize2 data-icon="inline-start" />
            {dashboardCopy.fullscreen}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onShare}>
            <Share2 data-icon="inline-start" />
            {dashboardCopy.shareLink}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12 lg:gap-5">
        <div className="order-1 flex flex-col gap-3 lg:order-2 lg:col-span-8 lg:col-start-5 lg:row-start-1">
          <BoardPreviewPanel
            boardText={previewBoardText}
            duration={duration}
            previewStepIndex={previewStepIndex}
            totalSteps={steps.length}
            advanceMode={advanceMode}
            isDirty={isPreviewDirty}
            onPreviewStepPrev={onPreviewStepPrev}
            onPreviewStepNext={onPreviewStepNext}
          />
          <WhatThisIsCard className="studio-panel hidden lg:block" />
        </div>

        <WhatThisIsCard className="studio-panel order-4 lg:hidden" />

        <div className="order-2 flex flex-col gap-4 lg:order-1 lg:col-span-4 lg:col-start-1 lg:row-start-1">
          <Card className="studio-panel">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{dashboardCopy.messageSteps}</CardTitle>
            </CardHeader>
            <CardContent>
              <StepEditor
                steps={steps}
                activeIndex={activeStepIndex}
                isActiveStepDirty={isActiveStepDirty}
                isStepDirty={isStepDirty}
                advanceMode={advanceMode}
                autoInterval={autoInterval}
                onActiveIndexChange={onActiveStepIndexChange}
                onStepTextChange={onStepTextChange}
                onStepBlur={onStepBlur}
                onSaveToPreview={onSaveToPreview}
                onAddStep={onAddStep}
                onRemoveStep={onRemoveStep}
                onAdvanceModeChange={onAdvanceModeChange}
                onAutoIntervalChange={onAutoIntervalChange}
              />
            </CardContent>
          </Card>

          <Card className="studio-panel">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{dashboardCopy.boardSettings}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label>{dashboardCopy.flipSpeed}</Label>
                  <span className="text-xs font-semibold tabular-nums text-primary">
                    {duration.toFixed(1)}s
                  </span>
                </div>
                <Slider
                  min={0.5}
                  max={4}
                  step={0.1}
                  value={[duration]}
                  onValueChange={([value]) => onDurationChange(value)}
                />
              </div>

              <div className="flex items-center justify-between border border-border/50 bg-muted/30 px-3 py-3">
                <Label htmlFor="sound-toggle">{dashboardCopy.clickSound}</Label>
                <Switch
                  id="sound-toggle"
                  checked={soundOn}
                  onCheckedChange={onSoundToggle}
                />
              </div>

              <MusicControls
                selection={musicSelection}
                playing={playMusic}
                onSelectionChange={onMusicSelectionChange}
                onPlayingChange={onPlayMusicChange}
                onPlayRequest={onPlayRequest}
              />

              <SharePasswordSettings
                enabled={sharePasswordEnabled}
                password={sharePassword}
                onEnabledChange={onSharePasswordEnabledChange}
                onPasswordChange={onSharePasswordChange}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

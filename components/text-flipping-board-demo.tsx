"use client";

import { useState, useEffect, useCallback, useLayoutEffect } from "react";
import { useBoardUrlBootstrap } from "@/hooks/use-board-url-bootstrap";
import { MusicPlaybackProvider } from "@/components/music-playback-context";
import { toggleSound, isSoundEnabled } from "@/lib/audio";
import {
  DEFAULT_MUSIC_SELECTION,
  getMusicPlaybackUrl,
  type MusicSelection,
} from "@/lib/music-types";
import { buildShareUrl } from "@/lib/share-url";
import { hashSharePassword, readStoredUnlock } from "@/lib/share-password";
import { shareCopy } from "@/lib/content";
import {
  createDefaultSteps,
  createStep,
  type BoardStep,
  type StepAdvanceMode,
} from "@/lib/steps";
import { CinematicView } from "@/components/demo/cinematic-view";
import { SharePasswordGate } from "@/components/demo/share-password-gate";
import { DashboardView } from "@/components/demo/dashboard-view";
import { Button } from "@/components/ui/button";

function cloneSteps(steps: BoardStep[]): BoardStep[] {
  return steps.map((step) => ({ ...step }));
}

export default function TextFlippingBoardDemo() {
  const [steps, setSteps] = useState<BoardStep[]>(createDefaultSteps);
  const [previewSteps, setPreviewSteps] = useState<BoardStep[]>(createDefaultSteps);
  const [renderedSteps, setRenderedSteps] = useState<BoardStep[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [previewStepIndex, setPreviewStepIndex] = useState(0);
  const [boardStepIndex, setBoardStepIndex] = useState(0);
  const [advanceMode, setAdvanceMode] = useState<StepAdvanceMode>("manual");
  const [autoInterval, setAutoInterval] = useState(5);
  const [soundOn, setSoundOn] = useState(true);
  const [duration, setDuration] = useState(1.5);
  const [isCinematic, setIsCinematic] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);
  const [musicSelection, setMusicSelection] = useState<MusicSelection>(
    DEFAULT_MUSIC_SELECTION,
  );
  const [playMusic, setPlayMusic] = useState(true);
  const [playTrigger, setPlayTrigger] = useState(0);
  const [musicBlocked, setMusicBlocked] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [sharePasswordEnabled, setSharePasswordEnabled] = useState(false);
  const [sharePassword, setSharePassword] = useState("");
  const [sharedLockHash, setSharedLockHash] = useState<string | null>(null);
  const [isShareUnlocked, setIsShareUnlocked] = useState(false);

  const previewBoardText = previewSteps[previewStepIndex]?.text ?? "";
  const boardText = renderedSteps[boardStepIndex]?.text ?? "";
  const playbackUrl = getMusicPlaybackUrl(musicSelection);

  const isStepDirty = useCallback(
    (index: number) =>
      (steps[index]?.text ?? "") !== (previewSteps[index]?.text ?? ""),
    [steps, previewSteps],
  );

  const isActiveStepDirty = isStepDirty(activeStepIndex);
  const isPreviewDirty = isStepDirty(previewStepIndex);

  const saveStepToPreview = useCallback((index: number) => {
    setSteps((currentSteps) => {
      const text = currentSteps[index]?.text ?? "";
      setPreviewSteps((prev) => {
        if ((prev[index]?.text ?? "") === text) return prev;
        return prev.map((step, i) => (i === index ? { ...step, text } : step));
      });
      setPreviewStepIndex(index);
      return currentSteps;
    });
  }, []);

  const requestMusicPlay = useCallback(() => {
    setPlayTrigger((count) => count + 1);
    setMusicBlocked(false);
  }, []);

  const handleMusicPlayStarted = useCallback(() => {
    setMusicBlocked(false);
  }, []);

  const handleMusicPlayBlocked = useCallback(() => {
    setMusicBlocked(true);
  }, []);

  useBoardUrlBootstrap({
    onSharedPayload: ({ steps: loadedSteps, advanceMode, autoInterval }) => {
      const cloned = cloneSteps(loadedSteps);
      setSteps(cloned);
      setPreviewSteps(cloneSteps(loadedSteps));
      setRenderedSteps(cloned);
      setAdvanceMode(advanceMode);
      setAutoInterval(autoInterval);
      setBoardStepIndex(0);
      setActiveStepIndex(0);
      setPreviewStepIndex(0);
    },
    onMusicSelection: (selection) => {
      setMusicSelection(selection);
      requestMusicPlay();
    },
    onStepIndex: setBoardStepIndex,
    onCinematic: (enabled) => {
      setIsCinematic(enabled);
      if (enabled) requestMusicPlay();
    },
    onSharedView: setIsSharedView,
    onPasswordHash: (hash) => {
      setSharedLockHash(hash);
      if (hash && readStoredUnlock(hash)) {
        setIsShareUnlocked(true);
      }
    },
  });

  useLayoutEffect(() => {
    if (playMusic) requestMusicPlay();
  }, []);

  useEffect(() => {
    toggleSound(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSoundOn(isSoundEnabled());
  }, []);

  useEffect(() => {
    if (!playMusic) return;
    requestMusicPlay();
  }, [playMusic, musicSelection, requestMusicPlay]);

  useEffect(() => {
    if (!musicBlocked || !playMusic) return;

    const unlock = () => {
      requestMusicPlay();
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [musicBlocked, playMusic, requestMusicPlay]);

  const handleStepTextChange = (index: number, text: string) => {
    setSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, text } : step)),
    );
  };

  const handleStepBlur = (index: number) => {
    saveStepToPreview(index);
  };

  const handleSaveToPreview = () => {
    saveStepToPreview(activeStepIndex);
  };

  const handleActiveStepIndexChange = (index: number) => {
    setActiveStepIndex(index);
  };

  const handleAddStep = () => {
    const newStep = createStep("");
    setSteps((prev) => {
      setActiveStepIndex(prev.length);
      return [...prev, newStep];
    });
    setPreviewSteps((prev) => [...prev, { ...newStep }]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) return;
    setSteps((prev) => prev.filter((_, i) => i !== index));
    setPreviewSteps((prev) => prev.filter((_, i) => i !== index));
    setActiveStepIndex((prev) => Math.max(0, prev >= index ? prev - 1 : prev));
    setPreviewStepIndex((prev) => Math.max(0, prev >= index ? prev - 1 : prev));
    setBoardStepIndex((prev) => Math.max(0, prev >= index ? prev - 1 : prev));
  };

  const handlePreviewStepPrev = () => {
    setPreviewStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handlePreviewStepNext = () => {
    setPreviewStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
  };

  const handleBoardStepPrev = () => {
    setBoardStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleBoardStepNext = () => {
    setBoardStepIndex((prev) => {
      if (prev < renderedSteps.length - 1) return prev + 1;
      if (advanceMode === "auto") return 0;
      return prev;
    });
  };

  const handleShare = async () => {
    if (sharePasswordEnabled && !sharePassword.trim()) {
      setToastMessage(shareCopy.setPasswordFirst);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
      return;
    }

    let passwordHash: string | null = null;
    if (sharePasswordEnabled && sharePassword.trim()) {
      passwordHash = await hashSharePassword(sharePassword);
    }

    const shareUrl = await buildShareUrl(
      window.location.origin,
      window.location.pathname,
      steps,
      advanceMode,
      autoInterval,
      musicSelection,
      passwordHash,
    );

    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setToastMessage(shareCopy.linkCopied);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      })
      .catch(() => {
        setToastMessage(shareCopy.linkCopyFailed);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      });
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSoundOn(toggleSound(enabled));
  };

  const handleMusicSelectionChange = useCallback(
    (selection: MusicSelection) => {
      setMusicSelection(selection);
      if (playMusic) requestMusicPlay();
    },
    [playMusic, requestMusicPlay],
  );

  const enterCinematic = () => {
    const snapshot = cloneSteps(steps);
    setRenderedSteps(snapshot);
    setBoardStepIndex(0);
    setIsCinematic(true);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("view", "cinematic");
      window.history.pushState({}, "", url.toString());
    }
    if (playMusic) requestMusicPlay();
  };

  const exitCinematic = () => {
    setIsCinematic(false);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("view");
      window.history.pushState({}, "", url.toString());
    }
  };

  const needsPassword =
    isSharedView && Boolean(sharedLockHash) && !isShareUnlocked;
  const musicShouldPlay = playMusic && !needsPassword;

  return (
    <MusicPlaybackProvider
      url={playbackUrl}
      playing={musicShouldPlay}
      playTrigger={playTrigger}
      onPlayBlocked={handleMusicPlayBlocked}
      onPlayStarted={handleMusicPlayStarted}
    >
      {needsPassword ? (
        <SharePasswordGate
          lockHash={sharedLockHash!}
          onUnlock={() => {
            setIsShareUnlocked(true);
            requestMusicPlay();
          }}
        />
      ) : isCinematic ? (
        <>
          <CinematicView
            boardText={boardText}
            duration={duration}
            stepIndex={boardStepIndex}
            totalSteps={renderedSteps.length}
            advanceMode={advanceMode}
            autoInterval={autoInterval}
            musicSelection={musicSelection}
            playMusic={musicShouldPlay}
            showToast={showToast}
            toastMessage={toastMessage}
            onStepPrev={handleBoardStepPrev}
            onStepNext={handleBoardStepNext}
            onPlayRequest={requestMusicPlay}
          />
          {!isSharedView && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={exitCinematic}
              className="fixed top-4 left-4 z-30 opacity-30 hover:opacity-100"
            >
              ← Edit
            </Button>
          )}
        </>
      ) : (
        <DashboardView
          steps={steps}
          activeStepIndex={activeStepIndex}
          previewStepIndex={previewStepIndex}
          previewBoardText={previewBoardText}
          isPreviewDirty={isPreviewDirty}
          isActiveStepDirty={isActiveStepDirty}
          isStepDirty={isStepDirty}
          advanceMode={advanceMode}
          autoInterval={autoInterval}
          duration={duration}
          soundOn={soundOn}
          musicSelection={musicSelection}
          playMusic={playMusic}
          showToast={showToast}
          toastMessage={toastMessage}
          onActiveStepIndexChange={handleActiveStepIndexChange}
          onStepTextChange={handleStepTextChange}
          onStepBlur={handleStepBlur}
          onSaveToPreview={handleSaveToPreview}
          onAddStep={handleAddStep}
          onRemoveStep={handleRemoveStep}
          onAdvanceModeChange={setAdvanceMode}
          onAutoIntervalChange={setAutoInterval}
          onPreviewStepPrev={handlePreviewStepPrev}
          onPreviewStepNext={handlePreviewStepNext}
          onShare={handleShare}
          onCinematic={enterCinematic}
          onDurationChange={setDuration}
          onSoundToggle={handleSoundToggle}
          onMusicSelectionChange={handleMusicSelectionChange}
          onPlayMusicChange={setPlayMusic}
          onPlayRequest={requestMusicPlay}
          sharePasswordEnabled={sharePasswordEnabled}
          sharePassword={sharePassword}
          onSharePasswordEnabledChange={setSharePasswordEnabled}
          onSharePasswordChange={setSharePassword}
        />
      )}

    </MusicPlaybackProvider>
  );
}

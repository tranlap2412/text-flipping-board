"use client";

import { useEffect, useRef } from "react";

interface BackgroundMusicPlayerProps {
  url: string;
  playing: boolean;
  playTrigger?: number;
  autoPlay?: boolean;
  onPlayBlocked?: () => void;
  onPlayStarted?: () => void;
  hidden?: boolean;
}

export function BackgroundMusicPlayer({
  url,
  playing,
  playTrigger = 0,
  onPlayBlocked,
  onPlayStarted,
  hidden = false,
}: BackgroundMusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const onPlayBlockedRef = useRef(onPlayBlocked);
  const onPlayStartedRef = useRef(onPlayStarted);
  const lastPlayTriggerRef = useRef(playTrigger);

  onPlayBlockedRef.current = onPlayBlocked;
  onPlayStartedRef.current = onPlayStarted;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!playing) {
      audio.pause();
      return;
    }

    const shouldRestart = playTrigger !== lastPlayTriggerRef.current;
    lastPlayTriggerRef.current = playTrigger;

    if (shouldRestart) {
      audio.currentTime = 0;
    } else if (!audio.paused) {
      return;
    }

    let cancelled = false;

    const attemptPlay = async () => {
      if (cancelled || !playing) return;

      try {
        audio.muted = false;
        await audio.play();
        onPlayStartedRef.current?.();
        return;
      } catch {
        // Muted autoplay is allowed in most browsers; unmute once playback starts.
      }

      try {
        audio.muted = true;
        await audio.play();
        audio.muted = false;
        onPlayStartedRef.current?.();
      } catch {
        onPlayBlockedRef.current?.();
      }
    };

    if (audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      void attemptPlay();
      return () => {
        cancelled = true;
      };
    }

    const onCanPlay = () => {
      void attemptPlay();
    };

    audio.addEventListener("canplay", onCanPlay, { once: true });
    return () => {
      cancelled = true;
      audio.removeEventListener("canplay", onCanPlay);
    };
  }, [url, playing, playTrigger]);

  return (
    <audio
      ref={audioRef}
      src={url}
      loop
      preload="auto"
      playsInline
      className={hidden ? "hidden" : "w-full"}
    />
  );
}

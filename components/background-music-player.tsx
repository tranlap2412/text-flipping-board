"use client";

import { useEffect, useRef } from "react";

interface BackgroundMusicPlayerProps {
  url: string;
  playing: boolean;
  playTrigger?: number;
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
  const lastPlayTriggerRef = useRef(-1);
  const lastUrlRef = useRef("");
  const needsUnmuteRef = useRef(false);

  onPlayBlockedRef.current = onPlayBlocked;
  onPlayStartedRef.current = onPlayStarted;

  useEffect(() => {
    if (!needsUnmuteRef.current || !playing) return;

    const unmute = () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.muted = false;
      needsUnmuteRef.current = false;
      void audio.play().catch(() => undefined);
    };

    window.addEventListener("pointerdown", unmute, { once: true });
    window.addEventListener("keydown", unmute, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unmute);
      window.removeEventListener("keydown", unmute);
    };
  }, [playing, playTrigger, url]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!playing) {
      audio.pause();
      needsUnmuteRef.current = false;
      return;
    }

    const urlChanged = lastUrlRef.current !== url;
    lastUrlRef.current = url;

    const shouldRestart =
      playTrigger !== lastPlayTriggerRef.current || urlChanged;
    lastPlayTriggerRef.current = playTrigger;

    if (shouldRestart) {
      audio.currentTime = 0;
    } else if (!audio.paused && !urlChanged) {
      return;
    }

    let cancelled = false;

    const attemptPlay = async () => {
      if (cancelled || !playing) return;

      try {
        audio.muted = false;
        needsUnmuteRef.current = false;
        await audio.play();
        onPlayStartedRef.current?.();
        return;
      } catch {
        // Fall back to muted autoplay (allowed without a gesture in most browsers).
      }

      try {
        audio.muted = true;
        await audio.play();
        needsUnmuteRef.current = true;
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

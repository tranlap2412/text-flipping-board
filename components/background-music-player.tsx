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
  autoPlay = false,
  onPlayBlocked,
  onPlayStarted,
  hidden = false,
}: BackgroundMusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.load();

    if (!playing) {
      audio.pause();
      return;
    }

    let cancelled = false;

    const attemptPlay = async () => {
      if (cancelled || !playing) return;

      try {
        audio.muted = false;
        await audio.play();
        onPlayStarted?.();
        return;
      } catch {
        // Muted autoplay is allowed in most browsers; unmute once playback starts.
      }

      try {
        audio.muted = true;
        await audio.play();
        audio.muted = false;
        onPlayStarted?.();
        return;
      } catch {
        onPlayBlocked?.();
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
  }, [url, playing, playTrigger, onPlayBlocked, onPlayStarted]);

  return (
    <audio
      ref={audioRef}
      src={url}
      loop
      autoPlay={autoPlay && playing}
      preload="auto"
      playsInline
      className={hidden ? "hidden" : "w-full"}
    />
  );
}

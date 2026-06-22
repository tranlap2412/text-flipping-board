"use client";

import { useEffect, useRef } from "react";

interface BackgroundMusicPlayerProps {
  url: string;
  playing: boolean;
  playTrigger?: number;
  onPlayBlocked?: () => void;
  hidden?: boolean;
}

export function BackgroundMusicPlayer({
  url,
  playing,
  playTrigger = 0,
  onPlayBlocked,
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

    const attemptPlay = () => {
      audio.play().catch(() => onPlayBlocked?.());
    };

    if (audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      attemptPlay();
      return;
    }

    audio.addEventListener("canplay", attemptPlay, { once: true });
    return () => audio.removeEventListener("canplay", attemptPlay);
  }, [url, playing, playTrigger, onPlayBlocked]);

  return (
    <audio
      ref={audioRef}
      src={url}
      loop
      preload="none"
      className={hidden ? "hidden" : "w-full"}
    />
  );
}

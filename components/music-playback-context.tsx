"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface MusicPlaybackContextValue {
  currentTimeMs: number;
  isPlaying: boolean;
}

const MusicPlaybackContext = createContext<MusicPlaybackContextValue>({
  currentTimeMs: 0,
  isPlaying: false,
});

export function useMusicPlayback(): MusicPlaybackContextValue {
  return useContext(MusicPlaybackContext);
}

interface MusicPlaybackProviderProps {
  url: string;
  playing: boolean;
  playTrigger?: number;
  onPlayBlocked?: () => void;
  onPlayStarted?: () => void;
  children: ReactNode;
}

export function MusicPlaybackProvider({
  url,
  playing,
  playTrigger = 0,
  onPlayBlocked,
  onPlayStarted,
  children,
}: MusicPlaybackProviderProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const onPlayBlockedRef = useRef(onPlayBlocked);
  const onPlayStartedRef = useRef(onPlayStarted);
  const lastPlayTriggerRef = useRef(-1);
  const lastUrlRef = useRef("");
  const mutedForPolicyRef = useRef(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    onPlayBlockedRef.current = onPlayBlocked;
    onPlayStartedRef.current = onPlayStarted;
  }, [onPlayBlocked, onPlayStarted]);

  const unmuteAndPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !playing) return false;

    try {
      audio.muted = false;
      mutedForPolicyRef.current = false;
      await audio.play();
      setIsPlaying(true);
      onPlayStartedRef.current?.();
      return true;
    } catch {
      return false;
    }
  }, [playing]);

  const attemptPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !playing) return;

    try {
      audio.muted = false;
      mutedForPolicyRef.current = false;
      await audio.play();
      setIsPlaying(true);
      onPlayStartedRef.current?.();
      return;
    } catch {
      // Unmuted autoplay blocked — fall back to muted start.
    }

    try {
      audio.muted = true;
      mutedForPolicyRef.current = true;
      await audio.play();
      setIsPlaying(true);
      onPlayStartedRef.current?.();
      if (await unmuteAndPlay()) return;
    } catch {
      mutedForPolicyRef.current = false;
      setIsPlaying(false);
      onPlayBlockedRef.current?.();
    }
  }, [playing, unmuteAndPlay]);

  useEffect(() => {
    if (!playing || !mutedForPolicyRef.current) return;

    const unlock = () => {
      void unmuteAndPlay();
    };

    const events = ["pointerdown", "touchstart", "keydown", "click"] as const;
    for (const event of events) {
      window.addEventListener(event, unlock, { once: true, passive: true });
    }

    return () => {
      for (const event of events) {
        window.removeEventListener(event, unlock);
      }
    };
  }, [playing, playTrigger, url, unmuteAndPlay]);

  useLayoutEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!playing) {
      audio.pause();
      mutedForPolicyRef.current = false;
      setIsPlaying(false);
      return;
    }

    const urlChanged = lastUrlRef.current !== url;
    lastUrlRef.current = url;

    const shouldRestart =
      playTrigger !== lastPlayTriggerRef.current || urlChanged;
    lastPlayTriggerRef.current = playTrigger;

    if (urlChanged) {
      audio.load();
      setCurrentTimeMs(0);
    }

    if (shouldRestart) {
      audio.currentTime = 0;
      setCurrentTimeMs(0);
    } else if (!audio.paused && !urlChanged) {
      return;
    }

    void attemptPlay();

    const onReady = () => {
      void attemptPlay();
    };

    audio.addEventListener("canplay", onReady);
    audio.addEventListener("loadeddata", onReady);

    return () => {
      audio.removeEventListener("canplay", onReady);
      audio.removeEventListener("loadeddata", onReady);
    };
  }, [url, playing, playTrigger, attemptPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const syncTime = () => {
      setCurrentTimeMs(Math.floor(audio.currentTime * 1000));
      setIsPlaying(!audio.paused && !audio.ended);
    };

    syncTime();
    audio.addEventListener("timeupdate", syncTime);
    audio.addEventListener("play", syncTime);
    audio.addEventListener("pause", syncTime);
    audio.addEventListener("seeked", syncTime);

    return () => {
      audio.removeEventListener("timeupdate", syncTime);
      audio.removeEventListener("play", syncTime);
      audio.removeEventListener("pause", syncTime);
      audio.removeEventListener("seeked", syncTime);
    };
  }, [url, playing]);

  const value = useMemo(
    () => ({ currentTimeMs, isPlaying }),
    [currentTimeMs, isPlaying],
  );

  return (
    <MusicPlaybackContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        src={url}
        loop
        preload="auto"
        autoPlay={playing}
        playsInline
        className="hidden"
      />
    </MusicPlaybackContext.Provider>
  );
}

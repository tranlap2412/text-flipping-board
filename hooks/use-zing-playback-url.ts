"use client";

import { useEffect, useRef, useState } from "react";
import { ZING_API_ENABLED } from "@/lib/deploy";
import { getMusicPlaybackUrl, type MusicSelection } from "@/lib/music-types";

export function useZingPlaybackUrl(
  selection: MusicSelection,
  onStreamReady?: () => void,
): { playbackUrl: string; isReady: boolean } {
  const [playbackUrl, setPlaybackUrl] = useState("");
  const [isReady, setIsReady] = useState(false);
  const onStreamReadyRef = useRef(onStreamReady);
  onStreamReadyRef.current = onStreamReady;

  useEffect(() => {
    let cancelled = false;

    if (selection.mode !== "online" || !selection.onlineSong) {
      const url = getMusicPlaybackUrl(selection);
      setPlaybackUrl(url);
      setIsReady(Boolean(url));
      onStreamReadyRef.current?.();
      return;
    }

    if (!ZING_API_ENABLED) {
      const url = getMusicPlaybackUrl(selection);
      setPlaybackUrl(url);
      setIsReady(Boolean(url));
      onStreamReadyRef.current?.();
      return;
    }

    setIsReady(false);
    setPlaybackUrl("");

    const songId = selection.onlineSong.id;

    fetch(`/api/zing/stream-url?id=${encodeURIComponent(songId)}`)
      .then((res) => res.json())
      .then((body: { success?: boolean; url?: string }) => {
        if (cancelled) return;

        if (body.success && body.url) {
          setPlaybackUrl(body.url);
        } else {
          setPlaybackUrl(`/api/zing/stream?id=${encodeURIComponent(songId)}`);
        }

        setIsReady(true);
        onStreamReadyRef.current?.();
      })
      .catch(() => {
        if (cancelled) return;
        setPlaybackUrl(`/api/zing/stream?id=${encodeURIComponent(songId)}`);
        setIsReady(true);
        onStreamReadyRef.current?.();
      });

    return () => {
      cancelled = true;
    };
  }, [selection]);

  return {
    playbackUrl,
    isReady: isReady && Boolean(playbackUrl),
  };
}

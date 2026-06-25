"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { SongLyrics } from "@/lib/zing-lyric-types";
import { useMusicPlayback } from "@/components/music-playback-context";

export interface SyncedLyricsMeta {
  title: string;
  artist?: string;
  thumbnail?: string | null;
}

interface SyncedLyricsPanelProps {
  songId: string | null;
  meta?: SyncedLyricsMeta;
  enabled?: boolean;
  className?: string;
}

const VISIBLE_LINES_EACH_SIDE = 3;
const LINE_SLOT = "calc(1.22rem + 0.7rem)";

function findActiveLineIndex(lines: SongLyrics["lines"], timeMs: number): number {
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    if (timeMs >= lines[i].startMs - 120) return i;
  }
  return 0;
}

function getLineDistanceStyle(distance: number): string {
  if (distance === 0) {
    return "lyrics-line-active text-[clamp(1.12rem,3.5vw,1.38rem)] font-semibold text-foreground";
  }
  if (distance === 1) {
    return "lyrics-line-idle text-[clamp(0.98rem,2.8vw,1.1rem)] font-medium text-foreground/42 scale-[0.98]";
  }
  if (distance === 2) {
    return "lyrics-line-idle text-[clamp(0.88rem,2.4vw,0.98rem)] font-normal text-foreground/24 scale-[0.96]";
  }
  if (distance === 3) {
    return "lyrics-line-idle text-sm font-normal text-foreground/18 scale-[0.94]";
  }
  return "lyrics-line-idle text-xs font-normal text-foreground/12 scale-95";
}

export function SyncedLyricsPanel({
  songId,
  enabled = true,
  className,
}: SyncedLyricsPanelProps) {
  const { currentTimeMs, isPlaying } = useMusicPlayback();
  const [lyrics, setLyrics] = useState<SongLyrics | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "missing">(
    "idle",
  );
  const listRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Array<HTMLParagraphElement | null>>([]);

  useEffect(() => {
    if (!enabled || !songId) {
      setLyrics(null);
      setStatus("idle");
      return;
    }

    let cancelled = false;
    setStatus("loading");
    setLyrics(null);

    fetch(`/api/zing/lyric?id=${encodeURIComponent(songId)}`)
      .then((res) => res.json())
      .then((body) => {
        if (cancelled) return;
        if (body.success && body.data?.lines?.length) {
          setLyrics(body.data as SongLyrics);
          setStatus("ready");
          return;
        }
        setStatus("missing");
      })
      .catch(() => {
        if (!cancelled) setStatus("missing");
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, songId]);

  const activeLineIndex = useMemo(() => {
    if (!lyrics) return -1;
    return findActiveLineIndex(lyrics.lines, currentTimeMs);
  }, [lyrics, currentTimeMs]);

  useEffect(() => {
    if (activeLineIndex < 0) return;
    const node = lineRefs.current[activeLineIndex];
    const container = listRef.current;
    if (!node || !container) return;

    const targetTop =
      node.offsetTop - container.clientHeight / 2 + node.clientHeight / 2;

    container.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth",
    });
  }, [activeLineIndex]);

  if (!enabled || !songId || status === "idle") return null;

  if (status === "loading") {
    return (
      <p
        className={cn(
          "lyrics-panel text-center text-xs font-medium tracking-wide text-muted-foreground/60",
          className,
        )}
      >
        Loading lyrics…
      </p>
    );
  }

  if (status === "missing" || !lyrics) return null;

  const viewportLines = VISIBLE_LINES_EACH_SIDE * 2 + 1;

  return (
    <section
      className={cn(
        "lyrics-panel relative mx-auto w-full max-w-xl bg-transparent",
        className,
      )}
    >
      <div
        ref={listRef}
        className="lyrics-spotify-scroll lyrics-spotify-mask overflow-y-auto scroll-smooth px-1"
        style={{
          maxHeight: `calc(${viewportLines} * ${LINE_SLOT})`,
        }}
      >
        <div
          className="flex flex-col items-center gap-2.5 text-center"
          style={{
            paddingTop: `calc(${VISIBLE_LINES_EACH_SIDE} * ${LINE_SLOT})`,
            paddingBottom: `calc(${VISIBLE_LINES_EACH_SIDE} * ${LINE_SLOT})`,
          }}
        >
          {lyrics.lines.map((line, lineIndex) => {
            const isActive = lineIndex === activeLineIndex;
            const distance = Math.abs(lineIndex - activeLineIndex);

            return (
              <p
                key={`${line.startMs}-${lineIndex}`}
                ref={(node) => {
                  lineRefs.current[lineIndex] = node;
                }}
                className={cn(
                  "lyrics-line mx-auto max-w-[94%] transition-[opacity,color,transform] duration-500 ease-out",
                  getLineDistanceStyle(distance),
                )}
              >
                {isActive && line.words.length > 0
                  ? line.words.map((word, wordIndex) => {
                      const isSung = currentTimeMs >= word.endMs;
                      const isCurrent =
                        isPlaying &&
                        currentTimeMs >= word.startMs - 40 &&
                        currentTimeMs <= word.endMs + 50;

                      return (
                        <span
                          key={`${word.startMs}-${wordIndex}`}
                          className={cn(
                            "transition-[color,opacity] duration-300 ease-out",
                            isCurrent && "text-primary",
                            isSung && !isCurrent && "text-primary/85",
                            !isSung &&
                              !isCurrent &&
                              "text-foreground/30",
                          )}
                        >
                          {word.text}
                          {wordIndex < line.words.length - 1 &&
                          !word.text.endsWith(" ") &&
                          !line.words[wordIndex + 1]?.text.startsWith(" ")
                            ? " "
                            : ""}
                        </span>
                      );
                    })
                  : line.text}
              </p>
            );
          })}
        </div>
      </div>
    </section>
  );
}

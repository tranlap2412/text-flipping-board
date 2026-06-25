"use client";

import { Music2 } from "lucide-react";
import { useMusicPlayback } from "@/components/music-playback-context";
import { cn } from "@/lib/utils";

interface SpinningDiscProps {
  thumbnail?: string | null;
  alt?: string;
  playing?: boolean;
  className?: string;
  size?: "sm" | "md";
}

function VinylRingSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <circle
        cx="32"
        cy="32"
        r="30.5"
        stroke="currentColor"
        strokeWidth="0.6"
        className="text-primary/50"
      />
      {[27, 23, 19, 15, 11].map((r) => (
        <circle
          key={r}
          cx="32"
          cy="32"
          r={r}
          stroke="currentColor"
          strokeWidth="0.3"
          className="text-foreground/18"
        />
      ))}
      <circle
        cx="32"
        cy="32"
        r="25"
        stroke="currentColor"
        strokeWidth="0.55"
        className="text-primary/45"
      />
      <circle cx="32" cy="32" r="1.8" fill="currentColor" className="text-primary/70" />
    </svg>
  );
}

export function SpinningDisc({
  thumbnail,
  alt = "Now playing",
  playing,
  className,
  size = "md",
}: SpinningDiscProps) {
  const { isPlaying } = useMusicPlayback();
  const spin = playing ?? isPlaying;
  const dimension = size === "sm" ? "size-9" : "size-12";

  return (
    <div className={cn("relative shrink-0", dimension, className)}>
      {spin && (
        <div
          className="pointer-events-none absolute inset-0 scale-[1.35] rounded-full bg-primary/10 blur-md"
          aria-hidden
        />
      )}

      <div className={cn("relative size-full", spin && "animate-vinyl-spin")}>
        <VinylRingSvg className="absolute inset-0 size-full" />

        <div className="absolute inset-[11%] overflow-hidden rounded-full ring-1 ring-primary/35">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={alt}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <Music2 className="size-[44%] text-primary/75" strokeWidth={1.5} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

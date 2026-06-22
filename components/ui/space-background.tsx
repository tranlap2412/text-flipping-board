"use client";

import StarsCanvas from "@/components/effects/star-background";

export function SpaceBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background select-none">
      <div className="space-bg-gradient absolute inset-0" />

      <div className="bg-grid-cyber space-bg-grid-mask absolute inset-0 opacity-40" />

      <div className="absolute top-[-10%] left-[-10%] h-[60vw] w-[60vw] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--chart-2)_18%,transparent)_0%,transparent_70%)] blur-[80px] animate-nebula-1" />
      <div className="absolute right-[-10%] bottom-[-10%] h-[70vw] w-[70vw] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--chart-3)_14%,transparent)_0%,transparent_70%)] blur-[90px] animate-nebula-2" />
      <div className="absolute top-[30%] right-[20%] h-[40vw] w-[40vw] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--primary)_10%,transparent)_0%,transparent_70%)] blur-[80px] animate-nebula-1" />

      <div className="absolute inset-0 z-0 opacity-70">
        <StarsCanvas />
      </div>

      <div className="animate-shooting-star-1 absolute top-[5%] right-[5%] h-[2px] w-[150px] bg-gradient-to-l from-foreground/80 via-primary/50 to-transparent blur-[1px] rotate-[-45deg]" />
      <div className="animate-shooting-star-2 absolute top-[20%] right-[25%] h-[1.5px] w-[120px] bg-gradient-to-l from-foreground/80 via-primary/50 to-transparent blur-[1px] rotate-[-45deg]" />
    </div>
  );
}

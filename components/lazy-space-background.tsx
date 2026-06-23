"use client";

import dynamic from "next/dynamic";

export const LazySpaceBackground = dynamic(
  () =>
    import("@/components/ui/space-background").then((m) => m.SpaceBackground),
  { ssr: false },
);

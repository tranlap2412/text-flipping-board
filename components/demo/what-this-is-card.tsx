import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function WhatThisIsCard({ className }: { className?: string }) {
  return (
    <Card size="sm" className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-[11px] font-semibold tracking-widest uppercase">
          What this is
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-2">
        <CardDescription className="text-xs leading-snug">
          AetherGate Flip-Board recreates the quiet drama of classic departure
          boards — each letter with weight, each message arriving one flip at a
          time.
        </CardDescription>
        <CardDescription className="text-xs leading-snug">
          Write for someone waiting, a celebration, or a line the room should
          feel. Chain steps, tune speed and sound, add music, then go
          fullscreen or share a link for the same slow reveal.
        </CardDescription>
        <CardDescription className="text-[11px] leading-snug text-primary/75">
          Not a slide. Not a ping. A moment that lands, flap by flap.
        </CardDescription>
      </CardContent>
    </Card>
  );
}

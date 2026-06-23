import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { whatThisIs } from "@/lib/content";

export function WhatThisIsCard({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="border-b border-primary/10 pb-3">
        <CardTitle className="text-sm font-semibold tracking-[0.22em] uppercase text-primary/90 md:text-base">
          {whatThisIs.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-5 md:space-y-3 md:pt-4">
        {whatThisIs.paragraphs.map((paragraph) => (
          <CardDescription
            key={paragraph.slice(0, 24)}
            className="text-sm leading-relaxed text-foreground/85 md:text-base md:leading-relaxed"
          >
            {paragraph}
          </CardDescription>
        ))}
        <p className="border-t border-primary/15 pt-4 text-sm font-medium leading-snug tracking-wide text-primary md:pt-4 md:text-base md:leading-relaxed">
          {whatThisIs.closing}
        </p>
      </CardContent>
    </Card>
  );
}

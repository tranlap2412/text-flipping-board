"use client";

interface DeckToastProps {
  message: string;
}

export function DeckToast({ message }: DeckToastProps) {
  return (
    <div className="studio-panel fixed right-6 bottom-6 z-50 px-5 py-3">
      <div className="flex items-center gap-3">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping bg-primary/70 opacity-75" />
          <span className="relative inline-flex h-2 w-2 bg-primary" />
        </span>
        <span className="text-xs font-semibold tracking-widest uppercase">
          {message}
        </span>
      </div>
    </div>
  );
}

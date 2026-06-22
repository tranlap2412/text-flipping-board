"use client";

import React, {
  useEffect,
  useRef,
  useMemo,
  useReducer,
  useState,
  startTransition,
} from "react";
import {
  LazyMotion,
  domAnimation,
  m,
  useAnimationControls,
} from "motion/react";
import { cn } from "@/lib/utils";
import { playFlipSound, playSuccessSound } from "@/lib/audio";
import {
  normalizeFlapChar,
  normalizeBoardText,
  graphemeLength,
  randomFlapChar,
  sliceGraphemes,
} from "@/lib/flap-chars";

const BOARD_ROWS = 6;
const BOARD_COLS = 22;

const BASE_COL_DELAY = 30;
const BASE_ROW_DELAY = 20;
const BASE_STEP_MS = 55;
const BASE_FLIP_S = 0.35;
const BASE_TOTAL_S =
  ((BOARD_COLS - 1) * BASE_COL_DELAY +
    (BOARD_ROWS - 1) * BASE_ROW_DELAY +
    8 * BASE_STEP_MS) /
  1000;

type AccentColor = {
  top: string;
  bottom: string;
  text: string;
};

const ACCENT_COLORS: AccentColor[] = [
  { top: "bg-red-600", bottom: "bg-red-700", text: "text-white" },
  { top: "bg-orange-500", bottom: "bg-orange-600", text: "text-white" },
  { top: "bg-yellow-400", bottom: "bg-yellow-500", text: "text-foreground" },
  { top: "bg-green-600", bottom: "bg-green-700", text: "text-white" },
  { top: "bg-blue-600", bottom: "bg-blue-700", text: "text-white" },
  { top: "bg-violet-600", bottom: "bg-violet-700", text: "text-white" },
  { top: "bg-white", bottom: "bg-neutral-100", text: "text-foreground" },
];

const CELL_TEXT_CLASS = "flap-cell-char";

type FlapState = {
  current: string;
  prev: string;
  flipId: number;
  accent: AccentColor | null;
  prevAccent: AccentColor | null;
};

const INITIAL_FLAP_STATE: FlapState = {
  current: " ",
  prev: " ",
  flipId: 0,
  accent: null,
  prevAccent: null,
};

type FlapAction = {
  type: "step";
  current: string;
  prev: string;
  accent: AccentColor | null;
  prevAccent: AccentColor | null;
  flipId: number;
};

function flapReducer(state: FlapState, action: FlapAction): FlapState {
  if (action.type === "step") {
    return {
      current: action.current,
      prev: action.prev,
      flipId: action.flipId,
      accent: action.accent,
      prevAccent: action.prevAccent,
    };
  }
  return state;
}

const FlapCell = React.memo(function FlapCell({
  target,
  delay,
  stepMs,
  flipDuration,
}: {
  target: string;
  delay: number;
  stepMs: number;
  flipDuration: number;
}) {
  const [state, dispatch] = useReducer(flapReducer, INITIAL_FLAP_STATE);
  const curRef = useRef(" ");
  const tgtRef = useRef<string | null>(null);
  const accentRef = useRef<AccentColor | null>(null);
  const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flapsMounted = useRef(false);
  const flipIdRef = useRef(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const topControls = useAnimationControls();
  const bottomControls = useAnimationControls();

  useEffect(() => {
    if (startTimer.current) clearTimeout(startTimer.current);
    if (stepTimer.current) clearTimeout(stepTimer.current);
    startTimer.current = null;
    stepTimer.current = null;

    const normalized = normalizeFlapChar(target);
    if (normalized === tgtRef.current) return;
    tgtRef.current = normalized;

    if (normalized === " " && curRef.current === " ") return;

    const scrambleCount =
      normalized === " "
        ? 8 + Math.floor(Math.random() * 8)
        : 20 + Math.floor(Math.random() * 12);

    let flipCounter = flipIdRef.current;

    const runStep = (i: number) => {
      const isLast = i === scrambleCount;
      const ch = isLast
        ? normalized
        : randomFlapChar();

      const newAccent = isLast
        ? null
        : Math.random() < 0.2
          ? ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)]
          : null;

      flipCounter += 1;
      flipIdRef.current = flipCounter;
      const prevChar = curRef.current;
      const prevAccentVal = accentRef.current;

      curRef.current = ch;
      accentRef.current = newAccent;

      startTransition(() => {
        dispatch({
          type: "step",
          current: ch,
          prev: prevChar,
          accent: newAccent,
          prevAccent: prevAccentVal,
          flipId: flipCounter,
        });
      });

      playFlipSound();

      if (!isLast) {
        stepTimer.current = setTimeout(() => runStep(i + 1), stepMs);
      }
    };

    startTimer.current = setTimeout(() => runStep(1), delay);

    return () => {
      if (startTimer.current) clearTimeout(startTimer.current);
      if (stepTimer.current) clearTimeout(stepTimer.current);
      startTimer.current = null;
      stepTimer.current = null;
      tgtRef.current = null;
    };
  }, [target, delay, stepMs]);

  useEffect(() => {
    if (state.flipId === 0) return;

    const bottomDelay = flipDuration * 0.5;
    const animMs = (flipDuration + bottomDelay + flipDuration * 0.85) * 1000;

    setIsFlipping(true);
    flapsMounted.current = true;

    topControls.set({ rotateX: 0 });
    void topControls.start({
      rotateX: -90,
      transition: {
        duration: flipDuration,
        ease: [0.55, 0.055, 0.675, 0.19],
      },
    });

    bottomControls.set({ rotateX: 90 });
    void bottomControls.start({
      rotateX: 0,
      transition: {
        duration: flipDuration * 0.85,
        delay: bottomDelay,
        ease: [0.33, 1.55, 0.64, 1],
      },
    });

    const hideTimer = setTimeout(() => setIsFlipping(false), animMs + 16);
    return () => clearTimeout(hideTimer);
  }, [state.flipId, flipDuration, topControls, bottomControls]);

  const show = state.current === " " ? "\u00A0" : state.current;
  const showPrev = state.prev === " " ? "\u00A0" : state.prev;

  const textCx =
    "absolute inset-x-0 flex select-none items-center justify-center font-bold tracking-tight";
  const topBg = state.accent?.top ?? "board-cell-surface";
  const bottomBg = state.accent?.bottom ?? "board-cell-surface";
  const textColor = state.accent?.text ?? "text-primary glow-cyan";
  const flapTopBg = state.prevAccent?.top ?? "board-cell-flap";
  const flapTextColor = state.prevAccent?.text ?? "text-primary glow-cyan";
  const flipStyle = { "--flip-dur": `${flipDuration}s` } as React.CSSProperties;

  return (
    <div className="flap-cell flex aspect-3/6 flex-col overflow-hidden rounded-none border border-border">
      <div className="relative flex-1 perspective-dramatic transform-3d bg-transparent">
        <div
          className={cn(
            "absolute inset-x-0 top-0 z-[1] h-[calc(50%-0.5px)] overflow-hidden",
            topBg,
          )}
        >
          <div
            className={cn(textCx, textColor, CELL_TEXT_CLASS, "top-0 h-[200%]")}
          >
            {show}
          </div>
        </div>

        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-[1] h-[calc(50%-0.5px)] overflow-hidden",
            bottomBg,
          )}
        >
          <div
            className={cn(textCx, textColor, CELL_TEXT_CLASS, "bottom-0 h-[200%]")}
          >
            {show}
          </div>
          {isFlipping && (
            <div
              key={`shine-${state.flipId}`}
              className="flap-shine-static pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.35),transparent_55%)]"
              style={flipStyle}
            />
          )}
        </div>

        {flapsMounted.current && isFlipping && (
          <m.div
            animate={topControls}
            className={cn(
              "absolute inset-x-0 top-0 z-10 h-[calc(50%-0.5px)] origin-bottom overflow-hidden backface-hidden transform-3d will-change-transform",
              flapTopBg,
            )}
          >
            <div
              className={cn(textCx, flapTextColor, CELL_TEXT_CLASS, "top-0 h-[200%]")}
            >
              {showPrev}
            </div>
            <div
              key={`top-shadow-${state.flipId}`}
              className="flap-top-shadow pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0.45))]"
              style={flipStyle}
            />
          </m.div>
        )}

        {flapsMounted.current && isFlipping && (
          <m.div
            animate={bottomControls}
            className={cn(
              "absolute inset-x-0 bottom-0 z-10 h-[calc(50%-0.5px)] origin-top overflow-hidden backface-hidden transform-3d will-change-transform",
              bottomBg,
            )}
          >
            <div
              className={cn(textCx, textColor, CELL_TEXT_CLASS, "bottom-0 h-[200%]")}
            >
              {show}
            </div>
            <div
              key={`bottom-shadow-${state.flipId}`}
              className="flap-bottom-shadow pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(255,255,255,0),rgba(255,255,255,0.3))]"
              style={flipStyle}
            />
          </m.div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 h-px -translate-y-[0.5px] bg-border" />
      </div>
      <div className="h-2 w-full shrink-0 bg-[repeating-linear-gradient(to_bottom,currentColor_0,currentColor_1px,transparent_1px,transparent_0.15rem)] mask-t-from-50% text-muted-foreground opacity-25 md:h-4 md:bg-[repeating-linear-gradient(to_bottom,currentColor_0,currentColor_1px,transparent_1px,transparent_0.2rem)]" />
    </div>
  );
},
  (prevProps, nextProps) =>
    prevProps.target === nextProps.target &&
    prevProps.delay === nextProps.delay &&
    prevProps.stepMs === nextProps.stepMs &&
    prevProps.flipDuration === nextProps.flipDuration);

const COLOR_MAP: Record<string, string> = {
  "{R}": "#D32F2F",
  "{O}": "#F57C00",
  "{Y}": "#FBC02D",
  "{G}": "#43A047",
  "{B}": "#1E88E5",
  "{V}": "#8E24AA",
  "{W}": "#FAFAFA",
};

const ColorCell = React.memo(function ColorCell({ color }: { color: string }) {
  return (
    <div className="flex aspect-3/6 flex-col overflow-hidden rounded-none border-2 border-border">
      <div className="flex-1" style={{ backgroundColor: color }} />
      <div className="h-2 w-full shrink-0 bg-[repeating-linear-gradient(to_bottom,currentColor_0,currentColor_1px,transparent_1px,transparent_0.15rem)] mask-t-from-50% text-muted-foreground opacity-25 md:h-4 md:bg-[repeating-linear-gradient(to_bottom,currentColor_0,currentColor_1px,transparent_1px,transparent_0.2rem)]" />
    </div>
  );
});

type ParsedCell =
  | { type: "char"; value: string }
  | { type: "color"; hex: string };

function parseRow(row: string): ParsedCell[] {
  const cells: ParsedCell[] = [];
  const normalized = normalizeBoardText(row);
  let i = 0;
  while (i < normalized.length) {
    if (normalized[i] === "{" && i + 2 < normalized.length && normalized[i + 2] === "}") {
      const code = normalized.substring(i, i + 3);
      if (COLOR_MAP[code]) {
        cells.push({ type: "color", hex: COLOR_MAP[code] });
        i += 3;
        continue;
      }
    }
    const codePoint = normalized.codePointAt(i)!;
    const char = String.fromCodePoint(codePoint);
    cells.push({ type: "char", value: char });
    i += char.length;
  }
  return cells;
}

function wrapParagraph(paragraph: string, maxCols: number): string[] {
  const lines: string[] = [];
  const words = normalizeBoardText(paragraph).split(/[ \t]+/).filter(Boolean);
  let currentLine = "";

  for (const word of words) {
    const wordLen = graphemeLength(word);
    if (wordLen > maxCols) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = "";
      }
      lines.push(sliceGraphemes(word, maxCols));
      continue;
    }

    const lineLen = graphemeLength(currentLine);
    if (!currentLine) {
      currentLine = word;
    } else if (lineLen + 1 + wordLen <= maxCols) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}

function wrapText(input: string, maxCols: number): string[] {
  return normalizeBoardText(input)
    .split("\n")
    .flatMap((paragraph) =>
      paragraph.trim() === "" ? [""] : wrapParagraph(paragraph, maxCols),
    );
}

export interface TextFlippingBoardProps {
  rows?: string[];
  text?: string;
  className?: string;
  duration?: number;
}

export function TextFlippingBoard({
  rows,
  text,
  className,
  duration = BASE_TOTAL_S,
}: TextFlippingBoardProps) {
  const scale = duration / BASE_TOTAL_S;
  const colDelay = BASE_COL_DELAY * scale;
  const rowDelay = BASE_ROW_DELAY * scale;
  const stepMs = BASE_STEP_MS * scale;
  const flipDur = Math.min(0.6, Math.max(0.15, BASE_FLIP_S * scale));

  useEffect(() => {
    if (text || rows) {
      const delay = (duration + 0.2) * 1000;
      const timer = setTimeout(() => {
        playSuccessSound();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [text, rows, duration]);

  const board = useMemo(() => {
    const grid: ParsedCell[][] = Array.from({ length: BOARD_ROWS }, () =>
      Array.from({ length: BOARD_COLS }, () => ({
        type: "char" as const,
        value: " ",
      })),
    );

    if (text) {
      const lines = wrapText(text, BOARD_COLS).slice(0, BOARD_ROWS);
      const startRow = Math.max(0, Math.floor((BOARD_ROWS - lines.length) / 2));
      lines.forEach((line, i) => {
        const row = startRow + i;
        if (row >= BOARD_ROWS) return;
        const parsed = parseRow(line);
        const startCol = Math.max(
          0,
          Math.floor((BOARD_COLS - parsed.length) / 2),
        );
        parsed.forEach((cell, c) => {
          if (startCol + c < BOARD_COLS) {
            grid[row][startCol + c] = cell;
          }
        });
      });
    } else if (rows) {
      rows.forEach((row, r) => {
        if (r >= BOARD_ROWS) return;
        const parsed = parseRow(row);
        parsed.forEach((cell, c) => {
          if (c < BOARD_COLS) {
            grid[r][c] = cell;
          }
        });
      });
    }

    return grid;
  }, [rows, text]);

  return (
    <LazyMotion features={domAnimation}>
      <div
        className={cn(
          "relative mx-auto w-full bg-transparent p-2 sm:p-3 md:p-4",
          className,
        )}
      >
        <div className="flip-board">
          {board.map((row, r) =>
            row.map((cell, c) =>
              cell.type === "color" ? (
                <ColorCell key={`${r}-${c}`} color={cell.hex} />
              ) : (
                <FlapCell
                  key={`${r}-${c}`}
                  target={cell.value}
                  delay={c * colDelay + r * rowDelay}
                  stepMs={stepMs}
                  flipDuration={flipDur}
                />
              ),
            ),
          )}
        </div>
      </div>
    </LazyMotion>
  );
}

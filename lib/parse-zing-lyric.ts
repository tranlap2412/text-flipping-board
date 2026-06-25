import type { LyricLine, LyricWord, SongLyrics } from "@/lib/zing-lyric-types";

interface ZingLyricWord {
  startTime: number;
  endTime: number;
  data: string;
}

interface ZingLyricSentence {
  words: ZingLyricWord[];
}

interface ZingLyricPayload {
  sentences?: ZingLyricSentence[];
}

export function parseZingLyricResponse(
  songId: string,
  payload: ZingLyricPayload,
): SongLyrics | null {
  const sentences = payload.sentences;
  if (!Array.isArray(sentences) || sentences.length === 0) return null;

  const lines: LyricLine[] = sentences
    .map((sentence) => {
      const words: LyricWord[] = (sentence.words ?? [])
        .filter((word) => word.data?.trim())
        .map((word) => ({
          text: word.data,
          startMs: word.startTime,
          endMs: Math.max(word.endTime, word.startTime),
        }));

      if (words.length === 0) return null;

      return {
        text: words.map((word) => word.text).join(" ").replace(/\s+/g, " ").trim(),
        startMs: words[0].startMs,
        endMs: words[words.length - 1].endMs,
        words,
      };
    })
    .filter((line): line is LyricLine => line !== null);

  if (lines.length === 0) return null;
  return { songId, lines };
}

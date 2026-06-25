export interface LyricWord {
  text: string;
  startMs: number;
  endMs: number;
}

export interface LyricLine {
  text: string;
  startMs: number;
  endMs: number;
  words: LyricWord[];
}

export interface SongLyrics {
  songId: string;
  lines: LyricLine[];
}

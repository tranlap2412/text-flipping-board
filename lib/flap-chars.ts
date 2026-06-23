/** Characters the split-flap board can display (uppercase, incl. Vietnamese). */
export const FLAP_CHARS =
  " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$()-+&=;:'\"%,./?°" +
  "ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ" +
  "ÈÉẸẺẼÊỀẾỆỂỄ" +
  "ÌÍỊỈĨ" +
  "ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ" +
  "ÙÚỤỦŨƯỪỨỰỬỮ" +
  "ỲÝỴỶỸ" +
  "Đ";

export const FLAP_CHAR_SET = new Set([...FLAP_CHARS]);

export function normalizeBoardText(text: string): string {
  return text.normalize("NFC");
}

/** Uppercase for editor input — vi-VN keeps Vietnamese diacritics correct */
export function toBoardInputText(text: string): string {
  return normalizeBoardText(text).toLocaleUpperCase("vi-VN");
}

export function normalizeFlapChar(char: string): string {
  if (char === " ") return " ";
  const upper = char.normalize("NFC").toLocaleUpperCase("vi-VN");
  return FLAP_CHAR_SET.has(upper) ? upper : " ";
}

export function graphemeLength(text: string): number {
  const normalized = text.normalize("NFC");
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("vi", { granularity: "grapheme" });
    return [...segmenter.segment(normalized)].length;
  }
  return [...normalized].length;
}

export function randomFlapChar(): string {
  return FLAP_CHARS[1 + Math.floor(Math.random() * (FLAP_CHARS.length - 1))];
}

export function sliceGraphemes(text: string, max: number): string {
  const normalized = text.normalize("NFC");
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("vi", { granularity: "grapheme" });
    return [...segmenter.segment(normalized)]
      .slice(0, max)
      .map((part) => part.segment)
      .join("");
  }
  return [...normalized].slice(0, max).join("");
}

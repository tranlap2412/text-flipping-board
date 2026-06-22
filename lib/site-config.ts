const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const siteConfig = {
  name: "AetherGate Flip-Board",
  shortName: "Flip-Board",
  title: "AetherGate Flip-Board — Split-flap message studio",
  description:
    "Compose multi-step split-flap messages with sound, music, and fullscreen cinematic playback. Share a link for the same slow reveal — flap by flap.",
  tagline: "A moment that lands, flap by flap.",
  author: {
    name: "William Bond",
    url: "https://github.com/tranlap2412",
  },
  url: siteUrl,
  locale: "en_US",
  keywords: [
    "split-flap display",
    "flip board",
    "departure board",
    "message studio",
    "cinematic text",
    "shareable messages",
    "Vietnamese text",
  ],
} as const;

export function getSiteUrl(): string {
  return siteConfig.url;
}

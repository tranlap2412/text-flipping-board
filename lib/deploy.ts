/** Static export (Netlify `out/`) has no server — Zing MP3 API routes are unavailable. */
export const IS_STATIC_EXPORT =
  process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

export const ZING_API_ENABLED = !IS_STATIC_EXPORT;

import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const runtime = "edge";
export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          background: "linear-gradient(160deg, #05080c 0%, #0a1218 45%, #071018 100%)",
          color: "#e8f4f8",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
            fontSize: 22,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "#5eead4",
          }}
        >
          AetherGate
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            maxWidth: 900,
          }}
        >
          Flip-Board
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 28,
            lineHeight: 1.45,
            color: "rgba(232, 244, 248, 0.72)",
            maxWidth: 820,
          }}
        >
          {siteConfig.tagline}
        </div>
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            gap: 10,
          }}
        >
          {["SPLIT-FLAP", "CINEMATIC", "SHAREABLE"].map((label) => (
            <div
              key={label}
              style={{
                padding: "10px 18px",
                border: "1px solid rgba(94, 234, 212, 0.35)",
                fontSize: 16,
                letterSpacing: "0.2em",
                color: "rgba(94, 234, 212, 0.9)",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}

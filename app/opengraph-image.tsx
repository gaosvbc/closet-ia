import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AtelIA — Your AI Personal Stylist";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand colors, kept in sync with tailwind.config.ts. Duplicated here on
// purpose: this file runs on the Edge runtime and can't import the Tailwind
// config at build time.
const BACKGROUND = "#FBFAF7";
const INK = "#171717";
const MUTED = "#8C8580";
const ACCENT = "#8B1524";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          backgroundColor: BACKGROUND,
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              backgroundColor: ACCENT,
              display: "flex",
            }}
          />
          <span style={{ fontSize: 32, color: MUTED, letterSpacing: 2 }}>
            ATELIA
          </span>
        </div>
        <div
          style={{
            fontSize: 76,
            color: INK,
            lineHeight: 1.1,
            maxWidth: 920,
            display: "flex",
          }}
        >
          Your AI Personal Stylist
        </div>
        <div
          style={{
            fontSize: 32,
            color: MUTED,
            marginTop: 28,
            maxWidth: 880,
            display: "flex",
          }}
        >
          Knows your body, your calendar, and your wardrobe — dresses you
          every morning.
        </div>
      </div>
    ),
    { ...size }
  );
}

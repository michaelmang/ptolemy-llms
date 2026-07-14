import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "The Celestial Mirror — an interactive 3D visualization of the Ptolemaic cosmos, mirrored against transformer architecture";

const RING_RADII = [520, 440, 360, 280, 200, 130];

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#050608",
        position: "relative",
      }}
    >
      {/* Concentric rings — the spheres of the tower, seen from above */}
      {RING_RADII.map((r) => (
        <div
          key={r}
          style={{
            position: "absolute",
            width: r,
            height: r,
            borderRadius: "50%",
            border: "1px solid rgba(242,199,110,0.16)",
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "#f2c76e",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 8,
            color: "#f2c76e",
            textTransform: "uppercase",
            marginBottom: 28,
          }}
        >
          Ptolemaic Cosmos &nbsp;·&nbsp; LLM Architecture
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 92,
            color: "#f5f2e8",
            fontWeight: 600,
            textAlign: "center",
            lineHeight: 1.05,
          }}
        >
          The Celestial Mirror
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 28,
            color: "#a8a29e",
            textAlign: "center",
            maxWidth: 880,
            justifyContent: "center",
          }}
        >
          An interactive 3D tower of spheres — Earth to the Empyrean — mirrored
          against transformer architecture
        </div>
      </div>
    </div>,
    { ...size },
  );
}

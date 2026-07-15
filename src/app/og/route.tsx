import { ImageResponse } from "next/og";
import { getSphere, KIND_LABEL, SPHERES } from "@/lib/cosmology";

// Open Graph card generator. With no params it renders the site-wide
// card; with ?rung=<sphere-id>(&view=llm) it renders a card for that
// rung of the tower, so every deep link previews as its own sphere.
// This replaces the file-convention opengraph-image/twitter-image,
// which would otherwise take precedence over per-sphere images.

export const dynamic = "force-dynamic";

const SIZE = { width: 1200, height: 630 };
const RING_RADII = [520, 440, 360, 280, 200, 130];

const firstSentence = (text: string): string => {
  const period = text.indexOf(". ");
  return period === -1 ? text : text.slice(0, period + 1);
};

function Backdrop({ accent }: { accent: string }) {
  return (
    <>
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
          background: accent,
        }}
      />
    </>
  );
}

function DefaultCard() {
  return (
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
      <Backdrop accent="#f2c76e" />
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
    </div>
  );
}

function SphereCard({ id, llmView }: { id: string; llmView: boolean }) {
  const sphere = getSphere(id)!;
  const rung = SPHERES.findIndex((s) => s.id === sphere.id) + 1;
  const accent = llmView ? "#7dd3fc" : "#f2c76e";
  const title = llmView ? sphere.llmParallel.label : sphere.name;
  const subtitle = llmView
    ? `${sphere.name} · ${firstSentence(sphere.llmParallel.description)}`
    : sphere.summary;

  return (
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
      <Backdrop accent={sphere.color} />
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
            color: accent,
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          Rung {rung} of {SPHERES.length} &nbsp;·&nbsp;{" "}
          {KIND_LABEL[sphere.kind]}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 24 ? 64 : 88,
            color: "#f5f2e8",
            fontWeight: 600,
            textAlign: "center",
            lineHeight: 1.05,
          }}
        >
          {title}
        </div>
        {sphere.latin && !llmView ? (
          <div
            style={{
              display: "flex",
              marginTop: 12,
              fontSize: 26,
              color: "#78716c",
              fontStyle: "italic",
            }}
          >
            {sphere.latin}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 27,
            color: "#a8a29e",
            textAlign: "center",
            maxWidth: 920,
            justifyContent: "center",
            lineHeight: 1.35,
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 20,
            letterSpacing: 6,
            color: "#57534e",
            textTransform: "uppercase",
          }}
        >
          The Celestial Mirror
        </div>
      </div>
    </div>
  );
}

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rung = searchParams.get("rung") ?? "";
  const llmView = searchParams.get("view") === "llm";
  const sphere = getSphere(rung);

  return new ImageResponse(
    sphere ? <SphereCard id={sphere.id} llmView={llmView} /> : <DefaultCard />,
    { ...SIZE },
  );
}

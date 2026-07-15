import type { Metadata } from "next";
import CosmosCanvas from "@/components/scene/CosmosCanvas";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import ForwardPassPanel from "@/components/ui/ForwardPassPanel";
import InfoPanel from "@/components/ui/InfoPanel";
import IntroOverlay from "@/components/ui/IntroOverlay";
import KeyboardNav from "@/components/ui/KeyboardNav";
import RungFeedback from "@/components/ui/RungFeedback";
import TourController from "@/components/ui/TourController";
import { getSphere, KIND_LABEL, type SphereInfo } from "@/lib/cosmology";
import { ForwardPassProvider } from "@/lib/forward-pass-context";
import { SceneProvider, type ViewMode } from "@/lib/scene-context";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

interface PageProps {
  searchParams: SearchParams;
}

const first = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v;

async function parseDeepLink(searchParams: SearchParams): Promise<{
  sphere: SphereInfo | undefined;
  view: ViewMode;
}> {
  const params = await searchParams;
  return {
    sphere: getSphere(first(params.rung) ?? ""),
    view: first(params.view) === "llm" ? "llm" : "cosmology",
  };
}

const SITE_URL = "https://ptolemy-llms.vercel.app";
const SITE_TITLE = "The Celestial Mirror — The Ptolemaic Cosmos";
const SITE_DESCRIPTION =
  "An interactive 3D visualization of the Ptolemaic architecture of the cosmos — Earth, the seven planetary spheres, the Stellatum, the Primum Mobile, and the Empyrean beyond — with its parallel in LLM architecture.";

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { sphere, view } = await parseDeepLink(searchParams);

  const title = sphere
    ? view === "llm"
      ? `${sphere.llmParallel.label} · ${sphere.name} — The Celestial Mirror`
      : `${sphere.name} (${KIND_LABEL[sphere.kind]}) — The Celestial Mirror`
    : SITE_TITLE;
  const description = sphere
    ? view === "llm"
      ? sphere.llmParallel.description
      : sphere.summary
    : SITE_DESCRIPTION;
  const ogImage = sphere
    ? `/og?rung=${sphere.id}${view === "llm" ? "&view=llm" : ""}`
    : "/og";
  const url = sphere
    ? `${SITE_URL}/?rung=${sphere.id}${view === "llm" ? "&view=llm" : ""}`
    : SITE_URL;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "The Celestial Mirror",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function Home({ searchParams }: PageProps) {
  const { sphere, view } = await parseDeepLink(searchParams);

  return (
    <SceneProvider initialSelectedId={sphere?.id ?? null} initialMode={view}>
      <ForwardPassProvider>
        <main className="relative h-dvh w-full overflow-hidden bg-black">
          <CosmosCanvas />
          <Header />
          <Footer />
          <ForwardPassPanel />
          <InfoPanel />
          {/* A deep link lands the visitor at their rung, not the intro. */}
          <IntroOverlay initiallyOpen={!sphere} />
          <KeyboardNav />
          <RungFeedback />
          <TourController />
        </main>
      </ForwardPassProvider>
    </SceneProvider>
  );
}

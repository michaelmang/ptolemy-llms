import type { Metadata } from "next";
import CosmosCanvas from "@/components/scene/CosmosCanvas";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import ForwardPassPanel from "@/components/ui/ForwardPassPanel";
import InfoPanel from "@/components/ui/InfoPanel";
import IntroOverlay from "@/components/ui/IntroOverlay";
import KeyboardNav from "@/components/ui/KeyboardNav";
import RungFeedback from "@/components/ui/RungFeedback";
import SphereProse from "@/components/ui/SphereProse";
import TourController from "@/components/ui/TourController";
import {
  getSphere,
  KIND_LABEL,
  PAPER_URL,
  type SphereInfo,
} from "@/lib/cosmology";
import { ForwardPassProvider } from "@/lib/forward-pass-context";
import { SceneProvider, type ViewMode } from "@/lib/scene-context";
import {
  AUTHOR_NAME,
  ESSAY_TITLE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  rungUrl,
} from "@/lib/site";

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
  const url = sphere ? rungUrl(sphere.id, view) : SITE_URL;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
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

  // Structured data describing the app and the essay it accompanies.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_TITLE,
    url: sphere ? rungUrl(sphere.id, view) : SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Any (web browser)",
    isAccessibleForFree: true,
    author: { "@type": "Person", name: AUTHOR_NAME },
    about: [
      { "@type": "Thing", name: "Ptolemaic cosmology" },
      {
        "@type": "Thing",
        name: "Transformer (large language model) architecture",
      },
    ],
    citation: {
      "@type": "Article",
      headline: ESSAY_TITLE,
      url: PAPER_URL,
      author: { "@type": "Person", name: AUTHOR_NAME },
    },
  };

  return (
    <SceneProvider initialSelectedId={sphere?.id ?? null} initialMode={view}>
      <ForwardPassProvider>
        <main className="relative h-dvh w-full overflow-hidden bg-black">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
            }}
          />
          <SphereProse sphere={sphere} view={view} />
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

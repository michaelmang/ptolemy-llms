import { SPHERES } from "@/lib/cosmology";
import { SITE_URL, rungUrl, type RungView } from "@/lib/site";

// Hand-rolled sitemap route. The `app/sitemap.ts` file convention emits
// raw `&` inside <loc> for query-param URLs — invalid XML that Google's
// parser rejects — so the tower's deep links (/?rung=<id>&view=llm)
// need their entities escaped by hand.

const escapeXml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const ogUrl = (id: string, view: RungView): string =>
  `${SITE_URL}/og?rung=${id}${view === "llm" ? "&view=llm" : ""}`;

function entry(url: string, image: string, priority: number): string {
  return [
    "<url>",
    `<loc>${escapeXml(url)}</loc>`,
    `<image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`,
    "<changefreq>monthly</changefreq>",
    `<priority>${priority}</priority>`,
    "</url>",
  ].join("\n");
}

export function GET(): Response {
  const rungs = SPHERES.flatMap((sphere) =>
    (["cosmology", "llm"] as const).map((view) =>
      entry(rungUrl(sphere.id, view), ogUrl(sphere.id, view), 0.7),
    ),
  );

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    entry(SITE_URL, `${SITE_URL}/og`, 1),
    ...rungs,
    "</urlset>",
  ].join("\n");

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}

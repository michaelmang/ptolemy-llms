// Site-wide constants shared by the page metadata, sitemap, robots,
// and structured data. The canonical URL story lives here: every rung
// of the tower is addressable as /?rung=<id>(&view=llm), and these
// helpers are the single source of truth for building those URLs.

export const SITE_URL = "https://celestial-llm-mirror.vercel.app";
export const SITE_NAME = "The Celestial Mirror";
export const SITE_TITLE = "The Celestial Mirror — The Ptolemaic Cosmos";
export const SITE_DESCRIPTION =
  "An interactive 3D visualization of the Ptolemaic architecture of the cosmos — Earth, the seven planetary spheres, the Stellatum, the Primum Mobile, and the Empyrean beyond — with its parallel in LLM architecture.";

export const AUTHOR_NAME = "Michael Mangialardi";
export const ESSAY_TITLE =
  "The Celestial Mirror: How Medieval Cosmology Reveals the Architecture of (Artificial) Intelligence";

export type RungView = "cosmology" | "llm";

/** Relative deep-link path for a rung, e.g. `/?rung=mars&view=llm`. */
export const rungPath = (id: string, view: RungView = "cosmology"): string =>
  `/?rung=${id}${view === "llm" ? "&view=llm" : ""}`;

/** Absolute deep-link URL for a rung. */
export const rungUrl = (id: string, view: RungView = "cosmology"): string =>
  `${SITE_URL}${rungPath(id, view)}`;

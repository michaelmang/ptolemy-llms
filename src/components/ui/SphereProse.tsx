import {
  KIND_LABEL,
  PAPER_URL,
  SPHERES,
  type SphereInfo,
} from "@/lib/cosmology";
import { SITE_DESCRIPTION, SITE_TITLE, rungPath } from "@/lib/site";
import type { ViewMode } from "@/lib/scene-context";

// The canvas is invisible to search engines and screen readers alike,
// so the tower's prose is also rendered here as real server-side HTML.
// A deep-linked rung gets its full article (the same text the info
// panel shows); the root gets an overview of the whole ascent. The
// section is visually hidden — the 3D scene is the presentation of
// this same content.

function RungArticle({ sphere, view }: { sphere: SphereInfo; view: ViewMode }) {
  const cosmologyHeading = `${sphere.name}${sphere.latin ? ` (${sphere.latin})` : ""} — ${KIND_LABEL[sphere.kind]}`;
  const llmHeading = `${sphere.llmParallel.label} — the LLM reading of ${sphere.name}`;

  const cosmology = (
    <>
      <p>{sphere.summary}</p>
      <p>{sphere.description}</p>
      {sphere.quote && (
        <blockquote>
          <p>{sphere.quote.text}</p>
          <footer>— {sphere.quote.source}</footer>
        </blockquote>
      )}
      {sphere.influence && <p>Its influence upon Earth: {sphere.influence}.</p>}
    </>
  );

  const llm = <p>{sphere.llmParallel.description}</p>;

  return (
    <article>
      {view === "llm" ? (
        <>
          <h1>{llmHeading}</h1>
          {llm}
          <h2>{cosmologyHeading}</h2>
          {cosmology}
        </>
      ) : (
        <>
          <h1>{cosmologyHeading}</h1>
          {cosmology}
          <h2>LLM parallel: {sphere.llmParallel.label}</h2>
          {llm}
        </>
      )}
      <p>
        Part of an interactive 3D tower of the Ptolemaic cosmos and its mirror
        in transformer architecture, built as a companion to the essay{" "}
        <a href={PAPER_URL}>
          The Celestial Mirror: How Medieval Cosmology Reveals the Architecture
          of (Artificial) Intelligence
        </a>
        .
      </p>
    </article>
  );
}

function Overview() {
  return (
    <article>
      <h1>{SITE_TITLE}</h1>
      <p>{SITE_DESCRIPTION}</p>
      <p>
        Built as a companion to Michael Mangialardi&apos;s essay{" "}
        <a href={PAPER_URL}>
          The Celestial Mirror: How Medieval Cosmology Reveals the Architecture
          of (Artificial) Intelligence
        </a>
        , this visualization renders the medieval universe as C.S. Lewis
        describes it in <cite>The Discarded Image</cite>: a vertical tower of
        hollow, transparent globes, one above the other, from the motionless
        Earth up through the seven planetary spheres to the Stellatum, the
        Primum Mobile, and the Empyrean beyond — where spatiality itself ends.
        Toggle the view and the same tower reads as a transformer: token input,
        stacked layers, the fixed embedding constellation, backpropagation, and
        the boundary no geometric operation crosses.
      </p>
      <h2>The rungs of the tower</h2>
      <ul>
        {SPHERES.map((sphere) => (
          <li key={sphere.id}>
            <strong>
              {sphere.name} ({KIND_LABEL[sphere.kind]})
            </strong>
            : {sphere.summary} In the LLM reading: {sphere.llmParallel.label}.
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function SphereProse({
  sphere,
  view,
}: {
  sphere: SphereInfo | undefined;
  view: ViewMode;
}) {
  return (
    <section className="sr-only" aria-label="About this visualization">
      {sphere ? <RungArticle sphere={sphere} view={view} /> : <Overview />}
      <nav aria-label="Every rung of the tower">
        <ul>
          {SPHERES.map((s) => (
            <li key={s.id}>
              <a href={rungPath(s.id)}>
                {s.name} — {KIND_LABEL[s.kind]}
              </a>{" "}
              · <a href={rungPath(s.id, "llm")}>{s.llmParallel.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}

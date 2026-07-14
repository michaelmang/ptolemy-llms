"use client";

import { useEffect, useRef } from "react";
import { getSphere, SPHERES } from "@/lib/cosmology";
import { useScene } from "@/lib/scene-context";
import CosmologyDiagram from "@/components/ui/diagrams/CosmologyDiagram";
import LLMDiagram from "@/components/ui/diagrams/LLMDiagram";

const KIND_LABEL: Record<string, string> = {
  earth: "Center",
  planet: "Planetary Sphere",
  stellatum: "Sphere of Fixed Stars",
  "primum-mobile": "The First Movable",
  empyrean: "Beyond Spatiality",
};

export default function InfoPanel() {
  const { selectedId, setSelectedId, mode } = useScene();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sphere = selectedId ? getSphere(selectedId) : null;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedId]);

  if (!sphere) {
    return (
      <aside className="pointer-events-none absolute right-4 bottom-4 left-4 z-10 md:top-24 md:right-4 md:bottom-auto md:left-auto md:w-96">
        <div className="pointer-events-auto rounded-lg border border-white/10 bg-black/50 p-4 text-sm text-stone-300 backdrop-blur-md">
          <p className="font-serif text-base text-stone-100">Select a sphere</p>
          <p className="mt-1 text-stone-400">
            Click any body, orbit ring, or shell to read its place in the
            Ptolemaic cosmos
            {mode === "llm" ? " and its parallel in LLM architecture." : "."}
          </p>
          <button
            type="button"
            onClick={() => setSelectedId("earth")}
            className="mt-3 w-full rounded-md border border-amber-300/30 bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-200 transition hover:bg-amber-400/20"
          >
            Begin the ascent from Earth ↑
          </button>
        </div>
      </aside>
    );
  }

  const rungIndex = SPHERES.findIndex((s) => s.id === sphere.id);
  const below = rungIndex > 0 ? SPHERES[rungIndex - 1] : null;
  const above = rungIndex < SPHERES.length - 1 ? SPHERES[rungIndex + 1] : null;

  return (
    <aside className="absolute right-4 bottom-4 left-4 z-10 md:top-24 md:right-4 md:bottom-auto md:left-auto md:w-96">
      <div
        ref={scrollRef}
        className="max-h-[70vh] overflow-y-auto rounded-lg border border-white/10 bg-black/60 p-5 text-sm text-stone-300 shadow-2xl backdrop-blur-md"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs tracking-widest text-amber-300/80 uppercase">
              {KIND_LABEL[sphere.kind]}
            </p>
            <h2 className="font-serif text-xl text-stone-50">{sphere.name}</h2>
            {sphere.latin ? (
              <p className="text-xs text-stone-400 italic">{sphere.latin}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            aria-label="Close"
            className="rounded-full border border-white/10 px-2 py-1 text-xs text-stone-400 hover:bg-white/10 hover:text-stone-100"
          >
            ✕
          </button>
        </div>

        <section
          className={`rounded-md border-l-2 p-3 ${
            mode === "cosmology"
              ? "border-amber-400 bg-amber-400/5"
              : "border-white/10 bg-white/[0.02]"
          }`}
        >
          <p className="mb-1 text-xs font-semibold tracking-wide text-amber-200 uppercase">
            Ptolemaic Cosmos
          </p>
          <div className="mb-2 rounded-md bg-black/30 p-2">
            <CosmologyDiagram sphere={sphere} />
          </div>
          <p className="leading-relaxed text-stone-300">{sphere.description}</p>
          {sphere.quote ? (
            <blockquote className="mt-3 border-l-2 border-white/15 pl-3 text-stone-400 italic">
              &ldquo;{sphere.quote.text}&rdquo;
              <footer className="mt-1 text-xs text-stone-500 not-italic">
                — {sphere.quote.source}
              </footer>
            </blockquote>
          ) : null}
        </section>

        <section
          className={`mt-3 rounded-md border-l-2 p-3 ${
            mode === "llm"
              ? "border-sky-400 bg-sky-400/5"
              : "border-white/10 bg-white/[0.02]"
          }`}
        >
          <p className="mb-1 text-xs font-semibold tracking-wide text-sky-300 uppercase">
            LLM Architecture Parallel — {sphere.llmParallel.label}
          </p>
          <div className="mb-2 rounded-md bg-black/30 p-2">
            <LLMDiagram sphere={sphere} />
          </div>
          <p className="leading-relaxed text-stone-300">
            {sphere.llmParallel.description}
          </p>
        </section>

        <nav className="mt-3 flex items-center justify-between gap-2">
          {below ? (
            <button
              type="button"
              onClick={() => setSelectedId(below.id)}
              className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-stone-300 transition hover:bg-white/10"
            >
              ↓ {below.name}
            </button>
          ) : (
            <span />
          )}
          <span className="text-[10px] tracking-wide text-stone-500">
            rung {rungIndex + 1} of {SPHERES.length}
          </span>
          {above ? (
            <button
              type="button"
              onClick={() => setSelectedId(above.id)}
              className="rounded-md border border-amber-300/25 bg-amber-400/10 px-3 py-1.5 text-xs text-amber-200 transition hover:bg-amber-400/20"
            >
              {above.name} ↑
            </button>
          ) : (
            <span className="text-[10px] text-stone-500 italic">
              the ascent ends here
            </span>
          )}
        </nav>
      </div>
    </aside>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { getSphere, KIND_LABEL, SPHERES } from "@/lib/cosmology";
import { TRACES } from "@/lib/forward-pass";
import { useForwardPass } from "@/lib/forward-pass-context";
import { useScene } from "@/lib/scene-context";
import CosmologyDiagram from "@/components/ui/diagrams/CosmologyDiagram";
import LLMDiagram from "@/components/ui/diagrams/LLMDiagram";
import { TOUR_STEP_MS } from "@/components/ui/TourController";

export default function InfoPanel() {
  const {
    selectedId,
    setSelectedId,
    mode,
    tourActive,
    tourPaused,
    setTourPaused,
    startTour,
    stopTour,
  } = useScene();
  const { run, start } = useForwardPass();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sphere = selectedId ? getSphere(selectedId) : null;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedId]);

  if (!sphere) {
    return (
      <aside
        className={`pointer-events-none absolute right-4 bottom-4 left-4 z-10 md:top-24 md:right-4 md:bottom-auto md:left-auto md:w-96 ${
          // On small screens the forward-pass panel takes this slot
          // while a run is live.
          run ? "hidden md:block" : ""
        }`}
      >
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
          <button
            type="button"
            onClick={startTour}
            className="mt-2 w-full rounded-md border border-white/10 px-3 py-2 text-xs text-stone-300 transition hover:bg-white/10"
          >
            Take the guided tour
          </button>
          <button
            type="button"
            onClick={() => start(TRACES[0].id)}
            className="mt-2 w-full rounded-md border border-sky-300/30 bg-sky-400/10 px-3 py-2 text-xs text-sky-200 transition hover:bg-sky-400/20 md:hidden"
          >
            Run a forward pass
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
        {tourActive ? (
          <div className="mb-3 rounded-md border border-amber-300/20 bg-amber-400/5 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] tracking-widest text-amber-200/80 uppercase">
                Guided tour
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setTourPaused(!tourPaused)}
                  className="rounded border border-white/10 px-2 py-0.5 text-[10px] text-stone-300 transition hover:bg-white/10"
                >
                  {tourPaused ? "Resume" : "Pause"}
                </button>
                <button
                  type="button"
                  onClick={stopTour}
                  className="rounded border border-white/10 px-2 py-0.5 text-[10px] text-stone-400 transition hover:bg-white/10"
                >
                  Exit
                </button>
              </div>
            </div>
            <div className="mt-2 h-0.5 overflow-hidden rounded bg-white/10">
              <div
                key={selectedId}
                className="h-full bg-amber-300/80"
                style={{
                  animation: `tour-progress ${TOUR_STEP_MS}ms linear forwards`,
                  animationPlayState: tourPaused ? "paused" : "running",
                }}
              />
            </div>
          </div>
        ) : null}
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
          {sphere.kind === "planet" ? (
            <p className="mt-3 text-[11px] leading-relaxed text-stone-500 italic">
              The faint motes circling the body mark its Intelligence — the
              immaterial mover to which medieval thought attributed each
              sphere&rsquo;s turning (a tradition Lewis describes at length).
            </p>
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
          {sphere.kind === "planet" ? (
            <p className="mt-3 text-[11px] leading-relaxed text-stone-500 italic">
              In this reading the same motes are the layer&rsquo;s attention
              heads — the several small movers within the layer, each steering
              part of its transformation.
            </p>
          ) : null}
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

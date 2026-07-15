"use client";

import { useState } from "react";
import { TRACES } from "@/lib/forward-pass";
import { useForwardPass } from "@/lib/forward-pass-context";
import { useScene } from "@/lib/scene-context";

/** The control panel for the forward-pass animation. Desktop: a card at
 * the bottom left. Mobile: it takes the info panel's bottom-sheet slot,
 * and only while a run is live (the empty-state info panel offers the
 * entry button there instead). */
export default function ForwardPassPanel() {
  const { run, start, stop } = useForwardPass();
  const { selectedId, setSelectedId, stopTour } = useScene();
  const [traceId, setTraceId] = useState(TRACES[0].id);

  const onRun = (id: string) => {
    stopTour();
    setSelectedId(null); // overview: the whole tower is the instrument
    start(id);
  };

  // On small screens, yield the bottom slot to the info panel whenever a
  // sphere is selected, and stay hidden while idle.
  const mobileVisibility =
    selectedId !== null || run === null ? "hidden md:block" : "";

  const step = run
    ? run.trace.steps[Math.min(run.stepIndex, run.trace.steps.length - 1)]
    : null;

  return (
    <aside
      className={`absolute bottom-4 left-4 z-10 w-[calc(100%-2rem)] md:w-80 ${mobileVisibility}`}
    >
      <div className="rounded-lg border border-white/10 bg-black/60 p-4 text-sm text-stone-300 shadow-2xl backdrop-blur-md">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold tracking-wide text-sky-300 uppercase">
            Forward Pass
          </p>
          {run ? (
            <button
              type="button"
              onClick={stop}
              aria-label="Stop the forward pass"
              className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-stone-400 hover:bg-white/10 hover:text-stone-100"
            >
              ✕
            </button>
          ) : null}
        </div>

        {!run ? (
          <>
            <p className="mt-1 text-xs text-stone-400">
              Watch one generation cycle climb the tower: exitus through the
              layers, comparison at the Stellatum, reditus to the sequence.
            </p>
            <select
              value={traceId}
              onChange={(e) => setTraceId(e.target.value)}
              className="mt-3 w-full rounded-md border border-white/10 bg-black/60 px-2 py-1.5 text-xs text-stone-200"
            >
              {TRACES.map((t) => (
                <option key={t.id} value={t.id}>
                  “{t.prompt} …”
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onRun(traceId)}
              className="mt-2 w-full rounded-md border border-sky-300/30 bg-sky-400/10 px-3 py-2 text-xs font-medium text-sky-200 transition hover:bg-sky-400/20"
            >
              Run the forward pass ↑
            </button>
            <p className="mt-2 text-[10px] text-stone-500 italic">
              an illustrative trace, not a live model
            </p>
          </>
        ) : (
          <>
            <div className="mt-2 flex flex-wrap gap-1">
              {run.trace.promptTokens.map((tok, i) => (
                <span
                  key={`p-${i}`}
                  className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[11px] text-stone-300"
                >
                  {tok}
                </span>
              ))}
              {run.generated.map((tok, i) => (
                <span
                  key={`g-${i}`}
                  className="rounded border border-amber-300/40 bg-amber-400/10 px-1.5 py-0.5 font-mono text-[11px] text-amber-200"
                >
                  {tok}
                </span>
              ))}
              {run.phase !== "done" ? (
                <span className="animate-pulse rounded border border-sky-300/40 bg-sky-400/10 px-1.5 py-0.5 font-mono text-[11px] text-sky-200">
                  ?
                </span>
              ) : null}
            </div>

            <p className="mt-3 text-xs text-stone-400 italic">
              {run.phase === "ascending"
                ? "exitus — ascending through the layers…"
                : run.phase === "comparing"
                  ? "at the Stellatum: compared against every fixed star"
                  : run.phase === "descending"
                    ? `reditus — “${step?.chosen}” returns to the sequence`
                    : "the cycle is complete — the output folds back into the input"}
            </p>

            {run.phase === "comparing" && step ? (
              <div className="mt-2 flex flex-col gap-1">
                {step.candidates.map((c, i) => (
                  <div key={c.token} className="flex items-center gap-2">
                    <span
                      className={`w-20 truncate text-right font-mono text-[11px] ${
                        i === 0 ? "text-amber-200" : "text-stone-400"
                      }`}
                    >
                      {c.token}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded bg-white/5">
                      <div
                        className={`h-full rounded ${
                          i === 0 ? "bg-amber-400/80" : "bg-sky-400/40"
                        }`}
                        style={{ width: `${c.prob * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono text-[10px] text-stone-500">
                      {Math.round(c.prob * 100)}%
                    </span>
                  </div>
                ))}
                <p className="mt-1 text-[10px] text-stone-500">
                  nearest fixed star wins — geometry, not judgment
                </p>
              </div>
            ) : null}

            {run.phase === "done" ? (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => onRun(run.trace.id)}
                  className="flex-1 rounded-md border border-sky-300/30 bg-sky-400/10 px-3 py-1.5 text-xs text-sky-200 transition hover:bg-sky-400/20"
                >
                  Run again
                </button>
                <button
                  type="button"
                  onClick={stop}
                  className="flex-1 rounded-md border border-white/10 px-3 py-1.5 text-xs text-stone-300 transition hover:bg-white/10"
                >
                  Close
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </aside>
  );
}

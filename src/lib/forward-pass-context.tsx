"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getTrace,
  PHASE_MS,
  type ForwardPassPhase,
  type ForwardPassTrace,
} from "@/lib/forward-pass";

export interface ForwardPassRun {
  trace: ForwardPassTrace;
  stepIndex: number;
  phase: ForwardPassPhase;
  /** performance.now() at the last phase transition, so the 3D pulse can
   * compute its progress without its own timers. */
  phaseStart: number;
  /** Tokens generated so far, appended after each descent (reditus). */
  generated: string[];
}

interface ForwardPassContextValue {
  run: ForwardPassRun | null;
  start: (traceId: string) => void;
  stop: () => void;
}

const ForwardPassContext = createContext<ForwardPassContextValue | null>(null);

export function ForwardPassProvider({ children }: { children: ReactNode }) {
  const [run, setRun] = useState<ForwardPassRun | null>(null);

  const start = useCallback((traceId: string) => {
    const trace = getTrace(traceId);
    if (!trace) return;
    setRun({
      trace,
      stepIndex: 0,
      phase: "ascending",
      phaseStart: performance.now(),
      generated: [],
    });
  }, []);

  const stop = useCallback(() => setRun(null), []);

  // The state machine: ascend → compare → descend, then either the next
  // step's ascent or done. One timeout per phase; unmount-safe.
  const phase = run?.phase;
  const stepIndex = run?.stepIndex;
  useEffect(() => {
    if (!phase || phase === "done") return;
    const timer = setTimeout(() => {
      setRun((r) => {
        if (!r || r.phase === "done") return r;
        const now = performance.now();
        if (r.phase === "ascending") {
          return { ...r, phase: "comparing", phaseStart: now };
        }
        if (r.phase === "comparing") {
          return { ...r, phase: "descending", phaseStart: now };
        }
        // Descent complete: the chosen token folds back into the sequence.
        const generated = [...r.generated, r.trace.steps[r.stepIndex].chosen];
        const isLastStep = r.stepIndex >= r.trace.steps.length - 1;
        return isLastStep
          ? { ...r, generated, phase: "done", phaseStart: now }
          : {
              ...r,
              generated,
              stepIndex: r.stepIndex + 1,
              phase: "ascending",
              phaseStart: now,
            };
      });
    }, PHASE_MS[phase]);
    return () => clearTimeout(timer);
  }, [phase, stepIndex]);

  const value = useMemo(() => ({ run, start, stop }), [run, start, stop]);

  return (
    <ForwardPassContext.Provider value={value}>
      {children}
    </ForwardPassContext.Provider>
  );
}

export function useForwardPass() {
  const ctx = useContext(ForwardPassContext);
  if (!ctx) {
    throw new Error("useForwardPass must be used within ForwardPassProvider");
  }
  return ctx;
}

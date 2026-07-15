"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type ViewMode = "cosmology" | "llm";

interface SceneContextValue {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
  /** True whenever anything is hovered or selected, so orbital motion can
   * pause and make precise clicking possible. */
  paused: boolean;
  /** Mirrors prefers-reduced-motion: stills the heavens for visitors who
   * ask for it (orbits, autorotation, particles, diagram animation). */
  reducedMotion: boolean;
  /** The guided tour: an auto-advancing ascent, rung by rung. The tour's
   * position IS the current selection, so manual clicks re-aim the tour
   * rather than fighting it. */
  tourActive: boolean;
  tourPaused: boolean;
  startTour: () => void;
  stopTour: () => void;
  setTourPaused: (paused: boolean) => void;
}

const SceneContext = createContext<SceneContextValue | null>(null);

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
const getServerReducedMotion = () => false;

interface SceneProviderProps {
  children: ReactNode;
  /** Initial selection/mode parsed from the URL on the server, so deep
   * links (?rung=mars&view=llm) render correctly on first paint. */
  initialSelectedId?: string | null;
  initialMode?: ViewMode;
}

export function SceneProvider({
  children,
  initialSelectedId = null,
  initialMode = "cosmology",
}: SceneProviderProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    initialSelectedId,
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mode, setMode] = useState<ViewMode>(initialMode);
  const [tourActive, setTourActive] = useState(false);
  const [tourPaused, setTourPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  );

  // Keep the URL shareable: every rung of the ascent is a link. Uses
  // replaceState (not the router) so climbing never spams history or
  // re-renders the server tree.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedId) params.set("rung", selectedId);
    else params.delete("rung");
    if (mode === "llm") params.set("view", "llm");
    else params.delete("view");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      query ? `${window.location.pathname}?${query}` : window.location.pathname,
    );
  }, [selectedId, mode]);

  // Stable callbacks, so effects that depend on them (the tour timer,
  // keyboard handlers) don't reset on unrelated hover re-renders.
  const startTour = useCallback(() => {
    setTourActive(true);
    setTourPaused(false);
    setSelectedId("earth");
  }, []);
  const stopTour = useCallback(() => {
    setTourActive(false);
    setTourPaused(false);
  }, []);

  const value = useMemo(
    () => ({
      selectedId,
      setSelectedId,
      hoveredId,
      setHoveredId,
      mode,
      setMode,
      paused: selectedId !== null || hoveredId !== null,
      reducedMotion,
      tourActive,
      tourPaused,
      startTour,
      stopTour,
      setTourPaused,
    }),
    [
      selectedId,
      hoveredId,
      mode,
      reducedMotion,
      tourActive,
      tourPaused,
      startTour,
      stopTour,
    ],
  );

  return (
    <SceneContext.Provider value={value}>{children}</SceneContext.Provider>
  );
}

export function useScene() {
  const ctx = useContext(SceneContext);
  if (!ctx) {
    throw new Error("useScene must be used within a SceneProvider");
  }
  return ctx;
}

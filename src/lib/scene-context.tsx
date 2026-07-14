"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
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
}

const SceneContext = createContext<SceneContextValue | null>(null);

export function SceneProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mode, setMode] = useState<ViewMode>("cosmology");

  const value = useMemo(
    () => ({
      selectedId,
      setSelectedId,
      hoveredId,
      setHoveredId,
      mode,
      setMode,
      paused: selectedId !== null || hoveredId !== null,
    }),
    [selectedId, hoveredId, mode],
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

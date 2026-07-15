"use client";

import { useEffect } from "react";
import { SPHERES } from "@/lib/cosmology";
import { useScene } from "@/lib/scene-context";

/** Keyboard ascent: ↑/↓ climb and descend the rungs, Escape returns to
 * the overview (and ends the tour). Renders nothing. */
export default function KeyboardNav() {
  const { selectedId, setSelectedId, stopTour } = useScene();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "Escape") {
        stopTour();
        setSelectedId(null);
        return;
      }
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      e.preventDefault();

      const index = selectedId
        ? SPHERES.findIndex((s) => s.id === selectedId)
        : -1;
      if (index === -1) {
        setSelectedId("earth");
        return;
      }
      const next =
        e.key === "ArrowUp"
          ? Math.min(index + 1, SPHERES.length - 1)
          : Math.max(index - 1, 0);
      setSelectedId(SPHERES[next].id);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId, setSelectedId, stopTour]);

  return null;
}

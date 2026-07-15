"use client";

import { useEffect } from "react";
import { SPHERES } from "@/lib/cosmology";
import { useScene } from "@/lib/scene-context";

/** Seconds each rung of the guided tour is held before advancing. */
export const TOUR_STEP_MS = 14000;

/** The timer behind the guided tour. The tour's position is simply the
 * current selection, so a manual click re-aims the tour instead of
 * fighting it; deselecting (Esc, click on empty space) ends it. Renders
 * nothing — the controls live in the info panel's tour bar. */
export default function TourController() {
  const { tourActive, tourPaused, selectedId, setSelectedId, stopTour } =
    useScene();

  // Returning to the overview ends the tour.
  useEffect(() => {
    if (tourActive && selectedId === null) stopTour();
  }, [tourActive, selectedId, stopTour]);

  useEffect(() => {
    if (!tourActive || tourPaused || selectedId === null) return;
    const index = SPHERES.findIndex((s) => s.id === selectedId);
    if (index === -1) return;

    const timer = setTimeout(() => {
      if (index >= SPHERES.length - 1) {
        stopTour(); // the ascent ends here — stay at the boundary
      } else {
        setSelectedId(SPHERES[index + 1].id);
      }
    }, TOUR_STEP_MS);
    return () => clearTimeout(timer);
  }, [tourActive, tourPaused, selectedId, setSelectedId, stopTour]);

  return null;
}

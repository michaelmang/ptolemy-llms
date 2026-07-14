"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { Object3D } from "three";

/**
 * Rotates `ref` around Y at `periodSeconds` per revolution, accumulating
 * angle in real time so that pausing/resuming (e.g. while a user hovers a
 * sphere to click it precisely) never causes a visible jump.
 */
export function useOrbitalSpin(
  ref: RefObject<Object3D | null>,
  periodSeconds: number,
  paused: boolean,
) {
  const angleRef = useRef(0);
  const lastElapsedRef = useRef<number | null>(null);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    if (lastElapsedRef.current === null) {
      lastElapsedRef.current = elapsed;
    }
    const delta = elapsed - lastElapsedRef.current;
    lastElapsedRef.current = elapsed;

    if (!paused && periodSeconds > 0) {
      angleRef.current += (delta / periodSeconds) * Math.PI * 2;
    }

    if (ref.current) {
      ref.current.rotation.y = angleRef.current;
    }
  });
}

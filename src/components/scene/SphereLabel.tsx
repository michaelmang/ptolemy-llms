"use client";

import { Html } from "@react-three/drei";
import { useScene } from "@/lib/scene-context";
import type { SphereInfo } from "@/lib/cosmology";

interface SphereLabelProps {
  sphere: SphereInfo;
  offsetY: number;
}

export default function SphereLabel({ sphere, offsetY }: SphereLabelProps) {
  const { mode, hoveredId, selectedId } = useScene();
  const isActive = hoveredId === sphere.id || selectedId === sphere.id;
  const primary = mode === "llm" ? sphere.llmParallel.label : sphere.name;
  const secondary = mode === "llm" ? sphere.name : sphere.latin;
  // The two great boundaries of the model deserve banner treatment.
  const prominent = sphere.kind === "stellatum" || sphere.kind === "empyrean";

  return (
    <Html
      position={[0, offsetY, 0]}
      center
      distanceFactor={12}
      occlude={false}
      pointerEvents="none"
      style={{ transition: "opacity 120ms ease" }}
    >
      <div
        className={`flex -translate-y-full flex-col items-center whitespace-nowrap select-none ${
          isActive
            ? "opacity-100"
            : selectedId !== null
              ? "opacity-40"
              : "opacity-90"
        }`}
      >
        <span
          className={
            prominent
              ? `font-serif text-[19px] font-semibold tracking-[0.3em] uppercase [text-shadow:0_0_14px_rgba(255,235,180,0.55)] ${
                  isActive ? "text-amber-100" : "text-amber-200/90"
                }`
              : `font-serif text-[13px] tracking-wide ${
                  isActive ? "text-amber-200" : "text-stone-200"
                }`
          }
        >
          {primary}
        </span>
        {secondary ? (
          <span
            className={
              prominent
                ? "text-[11px] tracking-widest text-amber-100/60 italic"
                : "text-[10px] text-stone-400 italic"
            }
          >
            {secondary}
          </span>
        ) : null}
      </div>
    </Html>
  );
}

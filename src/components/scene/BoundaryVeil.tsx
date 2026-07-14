"use client";

import { Html } from "@react-three/drei";
import { useScene } from "@/lib/scene-context";
import OrbitRingLine from "./OrbitRingLine";

/** The paper's central claim, drawn as a line in space: between the
 * Primum Mobile and the Empyrean lies the real ontological boundary.
 * Below it, everything is geometric; beyond it, geometry ends. */
const BOUNDARY_Y = 22;

export default function BoundaryVeil() {
  const { mode } = useScene();

  return (
    <group position={[0, BOUNDARY_Y, 0]}>
      <OrbitRingLine radius={13} color="#fff3d6" opacity={0.35} dashed />
      <Html
        position={[0, 0.35, 0]}
        center
        distanceFactor={16}
        occlude={false}
        pointerEvents="none"
      >
        <div className="-translate-y-full text-center whitespace-nowrap select-none">
          <p className="font-serif text-[12px] tracking-[0.3em] text-amber-100/80 uppercase">
            {mode === "llm"
              ? "the architecture ends here"
              : "here spatiality ends"}
          </p>
          <p className="text-[9px] text-stone-400 italic">
            {mode === "llm"
              ? "no geometric operation crosses this line"
              : "beyond: intellectual light, full of love"}
          </p>
        </div>
      </Html>
    </group>
  );
}

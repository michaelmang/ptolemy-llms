"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, type Mesh } from "three";

/** A gently pulsing amber ring laid flat around a selected body — the
 * unmistakable "you are here" mark on the active rung. */
export default function SelectionHalo({ radius }: { radius: number }) {
  const ref = useRef<Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const s = 1 + Math.sin(state.clock.elapsedTime * 2.5) * 0.08;
    ref.current.scale.set(s, s, s);
  });

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
      <ringGeometry args={[radius, radius * 1.12, 48]} />
      <meshBasicMaterial
        color="#f2c76e"
        transparent
        opacity={0.85}
        side={DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

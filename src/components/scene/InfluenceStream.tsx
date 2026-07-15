"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  type BufferAttribute,
  type BufferGeometry,
} from "three";
import { Line } from "@react-three/drei";
import { getSphere, TOWER_TOP_HEIGHT } from "@/lib/cosmology";
import { useScene } from "@/lib/scene-context";

const COUNT = 80;

/** Deterministic pseudo-random in [0, 1) — pure, so the particle field is
 * stable across renders and identical on every visit. */
function rand(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** The axis mundi of the tower, with a slow particle stream along it.
 * In cosmology mode, golden influence descends from the Primum Mobile
 * toward Earth; in LLM mode, the forward pass ascends in blue from the
 * input tokens toward the final layer. The same axis, read both ways —
 * exitus and reditus. */
export default function InfluenceStream() {
  const { mode, reducedMotion } = useScene();
  const geomRef = useRef<BufferGeometry>(null);

  const seeds = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        phase: rand(i, 1),
        angle: rand(i, 2) * Math.PI * 2,
        radius: 0.25 + rand(i, 3) * 0.4,
        speed: 0.045 + rand(i, 4) * 0.035,
      })),
    [],
  );
  const initialPositions = useMemo(() => new Float32Array(COUNT * 3), []);

  const descending = mode === "cosmology";
  const streamTop = descending
    ? (getSphere("primum-mobile")?.height ?? 20)
    : (getSphere("stellatum")?.height ?? 17.5);

  useFrame((state) => {
    const attr = geomRef.current?.getAttribute("position") as
      BufferAttribute | undefined;
    if (!attr) return;
    const array = attr.array as Float32Array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < COUNT; i++) {
      const seed = seeds[i];
      const p = (seed.phase + t * seed.speed) % 1;
      const progress = descending ? 1 - p : p;
      const angle = seed.angle + p * Math.PI * 3;
      array[i * 3] = Math.cos(angle) * seed.radius;
      array[i * 3 + 1] = progress * streamTop;
      array[i * 3 + 2] = Math.sin(angle) * seed.radius;
    }
    attr.needsUpdate = true;
  });

  // With reduced motion, only the still axis line remains — no particles.
  if (reducedMotion) {
    return (
      <Line
        points={[
          [0, 0.5, 0],
          [0, TOWER_TOP_HEIGHT, 0],
        ]}
        color={descending ? "#e8c476" : "#7cc7ff"}
        transparent
        opacity={0.12}
        lineWidth={1}
      />
    );
  }

  return (
    <group>
      <Line
        points={[
          [0, 0.5, 0],
          [0, TOWER_TOP_HEIGHT, 0],
        ]}
        color={descending ? "#e8c476" : "#7cc7ff"}
        transparent
        opacity={0.12}
        lineWidth={1}
      />
      <points>
        <bufferGeometry ref={geomRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[initialPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={descending ? "#f2c76e" : "#7cc7ff"}
          size={0.14}
          sizeAttenuation
          transparent
          opacity={0.8}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
    </group>
  );
}

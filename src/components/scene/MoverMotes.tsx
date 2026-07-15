"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { useScene } from "@/lib/scene-context";

/** Three faint motes circling each planetary body: in the cosmology
 * reading, the sphere's Intelligence — the immaterial mover to which
 * each sphere's turning was attributed; in the LLM reading, the layer's
 * attention heads, the several small movers within the layer. The same
 * geometry carries both readings, so nothing changes on mode toggle. */

const MOTE_COUNT = 3;

/** Small deterministic hash so each planet's motes start at their own
 * phase — seeded, like everything else in this fixed cosmos. */
function hashPhase(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) / 4294967296) * Math.PI * 2;
}

interface MoverMotesProps {
  sphereId: string;
  bodyRadius: number;
}

export default function MoverMotes({ sphereId, bodyRadius }: MoverMotesProps) {
  const groupRef = useRef<Group>(null);
  const { paused, reducedMotion } = useScene();
  const phase = useMemo(() => hashPhase(sphereId), [sphereId]);

  useFrame((_, delta) => {
    if (groupRef.current && !paused && !reducedMotion) {
      groupRef.current.rotation.y += delta * 0.9;
    }
  });

  const orbit = bodyRadius * 1.9;
  const moteRadius = Math.max(0.03, bodyRadius * 0.13);

  return (
    <group rotation={[0.35, phase, 0]}>
      <group ref={groupRef}>
        {Array.from({ length: MOTE_COUNT }, (_, i) => {
          const angle = (i / MOTE_COUNT) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * orbit, 0, Math.sin(angle) * orbit]}
              raycast={() => null}
            >
              <sphereGeometry args={[moteRadius, 8, 8]} />
              <meshBasicMaterial
                color="#fff3d6"
                transparent
                opacity={0.75}
                depthWrite={false}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

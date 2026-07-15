"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  DoubleSide,
  MathUtils,
  type Group,
  type MeshBasicMaterial,
  type PointLight,
} from "three";
import { getSphere, SPHERES } from "@/lib/cosmology";
import { PHASE_MS } from "@/lib/forward-pass";
import { useForwardPass } from "@/lib/forward-pass-context";

// The forward pass, animated on the tower itself: a luminous pulse climbs
// from Earth (the token input) to the Stellatum (the final layer and its
// fixed constellation), holds there while the comparison panel runs, then
// descends amber — exitus and reditus. Each rung's ring flares as the
// pulse passes it.

const BASE_Y = 0.55;
const TOP_Y = getSphere("stellatum")!.height;
/** The rungs the forward pass traverses: Moon up through the Stellatum.
 * The Primum Mobile (training) plays no part in inference. */
const RUNGS = SPHERES.filter((s) => s.orbitRadius > 0 && s.height <= TOP_Y);

const ASCEND_COLOR = "#7cc7ff";
const DESCEND_COLOR = "#f2c76e";

const smoothstep = (t: number) => t * t * (3 - 2 * t);

export default function ForwardPassPulse() {
  const { run } = useForwardPass();
  const pulseRef = useRef<Group>(null);
  const pulseMatRef = useRef<MeshBasicMaterial>(null);
  const lightRef = useRef<PointLight>(null);
  const ringMatRefs = useRef<(MeshBasicMaterial | null)[]>([]);

  useFrame((state) => {
    const group = pulseRef.current;
    if (!group) return;
    const active = run !== null && run.phase !== "done";
    group.visible = active;
    if (!run || !active) {
      ringMatRefs.current.forEach((mat) => {
        if (mat) mat.opacity = 0;
      });
      return;
    }

    const elapsed = performance.now() - run.phaseStart;
    let y = BASE_Y;
    if (run.phase === "ascending") {
      const t = MathUtils.clamp(elapsed / PHASE_MS.ascending, 0, 1);
      y = MathUtils.lerp(BASE_Y, TOP_Y, smoothstep(t));
    } else if (run.phase === "comparing") {
      // Hold at the Stellatum, breathing, while the comparison runs.
      y = TOP_Y + Math.sin(state.clock.elapsedTime * 3) * 0.12;
    } else {
      const t = MathUtils.clamp(elapsed / PHASE_MS.descending, 0, 1);
      y = MathUtils.lerp(TOP_Y, BASE_Y, smoothstep(t));
    }
    group.position.y = y;

    const color = run.phase === "descending" ? DESCEND_COLOR : ASCEND_COLOR;
    pulseMatRef.current?.color.set(color);
    lightRef.current?.color.set(color);

    RUNGS.forEach((sphere, i) => {
      const mat = ringMatRefs.current[i];
      if (!mat) return;
      const proximity = 1 - Math.abs(y - sphere.height) / 1.5;
      mat.opacity = Math.max(0, proximity) * 0.45;
      mat.color.set(color);
    });
  });

  return (
    <>
      <group ref={pulseRef} visible={false} position={[0, BASE_Y, 0]}>
        <mesh raycast={() => null}>
          <sphereGeometry args={[0.28, 24, 24]} />
          <meshBasicMaterial
            ref={pulseMatRef}
            color={ASCEND_COLOR}
            transparent
            opacity={0.95}
            depthWrite={false}
          />
        </mesh>
        <pointLight
          ref={lightRef}
          intensity={14}
          distance={7}
          decay={2}
          color={ASCEND_COLOR}
        />
      </group>
      {RUNGS.map((sphere, i) => (
        <mesh
          key={sphere.id}
          position={[0, sphere.height, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          renderOrder={-1}
          raycast={() => null}
        >
          <ringGeometry
            args={[sphere.orbitRadius - 0.06, sphere.orbitRadius + 0.06, 96]}
          />
          <meshBasicMaterial
            ref={(mat) => {
              ringMatRefs.current[i] = mat;
            }}
            transparent
            opacity={0}
            side={DoubleSide}
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </mesh>
      ))}
    </>
  );
}

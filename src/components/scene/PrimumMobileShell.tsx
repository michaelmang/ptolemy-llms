"use client";

import { useRef } from "react";
import type { Group } from "three";
import { getSphere } from "@/lib/cosmology";
import { useScene } from "@/lib/scene-context";
import { useOrbitalSpin } from "@/lib/useOrbitalSpin";
import OrbitRingLine from "./OrbitRingLine";
import SelectionHalo from "./SelectionHalo";
import SphereLabel from "./SphereLabel";

export default function PrimumMobileShell() {
  const sphere = getSphere("primum-mobile");
  const {
    selectedId,
    hoveredId,
    setSelectedId,
    setHoveredId,
    paused,
    reducedMotion,
  } = useScene();
  const groupRef = useRef<Group>(null);

  useOrbitalSpin(
    groupRef,
    sphere?.orbitPeriodSeconds ?? 0,
    paused || reducedMotion,
  );

  if (!sphere) return null;
  const isSelected = selectedId === sphere.id;
  const isActive = isSelected || hoveredId === sphere.id;
  const radius = sphere.orbitRadius;

  return (
    <group position={[0, sphere.height, 0]}>
      {/* No luminous body — only a faint, barely-evidenced ring. */}
      <OrbitRingLine
        radius={radius}
        color={isSelected ? "#f2c76e" : isActive ? "#c7ecf7" : "#8fd3e8"}
        opacity={isSelected ? 0.85 : isActive ? 0.6 : 0.3}
        lineWidth={isSelected ? 1.8 : 1}
      />
      <group ref={groupRef}>
        {/* Small clickable marker — "gives no evidence of itself to our
            senses" except this one inferred point, the real selection
            target. */}
        <mesh
          position={[radius, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            if (e.delta > 5) return; // drag release, not a click
            setSelectedId(sphere.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredId(sphere.id);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHoveredId(null);
            document.body.style.cursor = "auto";
          }}
          scale={isActive ? 1.4 : 1}
        >
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshBasicMaterial
            color={isActive ? "#c7ecf7" : "#8fd3e8"}
            transparent
            opacity={0.85}
          />
        </mesh>
        {isSelected ? (
          <group position={[radius, 0, 0]}>
            <SelectionHalo radius={0.34} />
          </group>
        ) : null}
      </group>
      <SphereLabel sphere={sphere} offsetY={0.9} />
    </group>
  );
}

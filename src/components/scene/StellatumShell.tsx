"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { getSphere } from "@/lib/cosmology";
import { useScene } from "@/lib/scene-context";
import { useOrbitalSpin } from "@/lib/useOrbitalSpin";
import OrbitRingLine from "./OrbitRingLine";
import SelectionHalo from "./SelectionHalo";
import SphereLabel from "./SphereLabel";

/** Scatter `count` points in a starry belt around a ring at `radius`. */
function starBelt(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const r = radius + (Math.random() - 0.5) * 1.6;
    const y = (Math.random() - 0.5) * 1.4;
    positions[i * 3] = Math.cos(theta) * r;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(theta) * r;
  }
  return positions;
}

export default function StellatumShell() {
  const sphere = getSphere("stellatum");
  const { selectedId, hoveredId, setSelectedId, setHoveredId, paused } =
    useScene();
  const groupRef = useRef<THREE.Group>(null);

  const positions = useMemo(
    () => starBelt(360, sphere?.orbitRadius ?? 10.5),
    [sphere?.orbitRadius],
  );

  useOrbitalSpin(groupRef, sphere?.orbitPeriodSeconds ?? 0, paused);

  if (!sphere) return null;
  const isSelected = selectedId === sphere.id;
  const isActive = isSelected || hoveredId === sphere.id;
  const radius = sphere.orbitRadius;

  return (
    <group position={[0, sphere.height, 0]}>
      <OrbitRingLine
        radius={radius}
        color={isSelected ? "#f2c76e" : "#5b6b82"}
        opacity={isSelected ? 0.85 : 0.35}
        lineWidth={isSelected ? 1.8 : 1}
      />
      <group ref={groupRef}>
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            color={isActive ? "#ffe9b3" : "#f5f2e8"}
            size={0.09}
            sizeAttenuation
            transparent
            opacity={0.9}
          />
        </points>
        {/* Small clickable marker standing in for "a fixed star" — the
            real selection target, since a giant raycast-solid shell would
            block clicks on everything inside it. */}
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
          <meshStandardMaterial
            color="#fff3d6"
            emissive="#fff3d6"
            emissiveIntensity={1.2}
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

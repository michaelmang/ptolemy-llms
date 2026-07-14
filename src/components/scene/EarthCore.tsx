"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { getSphere } from "@/lib/cosmology";
import { getPlanetTexture } from "@/lib/planet-textures";
import { useScene } from "@/lib/scene-context";
import SelectionHalo from "./SelectionHalo";
import SphereLabel from "./SphereLabel";

export default function EarthCore() {
  const sphere = getSphere("earth");
  const bodyRef = useRef<Mesh>(null);
  const { selectedId, hoveredId, setSelectedId, setHoveredId } = useScene();
  const texture = useMemo(() => getPlanetTexture("earth"), []);

  // Earth is motionless in the medieval model; this is only a slow turn
  // of the body itself so its surface can be seen.
  useFrame((_, delta) => {
    if (bodyRef.current) {
      bodyRef.current.rotation.y += delta * 0.08;
    }
  });

  if (!sphere) return null;
  const isSelected = selectedId === sphere.id;
  const isActive = isSelected || hoveredId === sphere.id;

  return (
    <group>
      <group
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
        scale={isActive ? 1.15 : 1}
      >
        <mesh ref={bodyRef}>
          <sphereGeometry args={[sphere.bodyRadius, 48, 48]} />
          <meshStandardMaterial
            map={texture ?? undefined}
            color={texture ? "#ffffff" : sphere.color}
            emissive={sphere.emissive ?? "#000000"}
            emissiveIntensity={0.25}
            roughness={0.7}
            metalness={0.05}
          />
        </mesh>
        {/* thin atmospheric halo */}
        <mesh>
          <sphereGeometry args={[sphere.bodyRadius * 1.16, 32, 32]} />
          <meshBasicMaterial
            color="#6ea8ff"
            transparent
            opacity={0.1}
            depthWrite={false}
          />
        </mesh>
        {isSelected ? <SelectionHalo radius={sphere.bodyRadius * 1.6} /> : null}
      </group>
      <SphereLabel sphere={sphere} offsetY={sphere.bodyRadius + 0.3} />
    </group>
  );
}

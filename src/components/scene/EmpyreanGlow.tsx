"use client";

import { BackSide } from "three";
import { getSphere } from "@/lib/cosmology";
import { useScene } from "@/lib/scene-context";
import SelectionHalo from "./SelectionHalo";
import SphereLabel from "./SphereLabel";

export default function EmpyreanGlow() {
  const sphere = getSphere("empyrean");
  const { selectedId, hoveredId, setSelectedId, setHoveredId } = useScene();
  if (!sphere) return null;
  const isSelected = selectedId === sphere.id;
  const isActive = isSelected || hoveredId === sphere.id;

  return (
    <group position={[0, sphere.height, 0]}>
      {/* Soft radiant glow capping the tower — light with no further
          geometry beyond it. Purely decorative: raycast disabled so it
          never blocks clicks on the Primum Mobile ring beneath it. */}
      <mesh renderOrder={-1} raycast={() => null}>
        <sphereGeometry args={[7, 32, 32]} />
        <meshBasicMaterial
          color={sphere.color}
          transparent
          opacity={0.06}
          side={BackSide}
          depthWrite={false}
        />
      </mesh>
      {/* Small clickable marker standing in for the boundary itself. */}
      <mesh
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
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color={isActive ? "#fffbe8" : sphere.color}
          emissive="#fff3d6"
          emissiveIntensity={isActive ? 2.4 : 1.6}
        />
      </mesh>
      {isSelected ? <SelectionHalo radius={0.6} /> : null}
      <SphereLabel sphere={sphere} offsetY={0.7} />
    </group>
  );
}

"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { getSphere } from "@/lib/cosmology";
import { useEarthCloudsTexture, usePlanetTexture } from "@/lib/planet-textures";
import { useScene } from "@/lib/scene-context";
import SelectionHalo from "./SelectionHalo";
import SphereLabel from "./SphereLabel";

export default function EarthCore() {
  const sphere = getSphere("earth");
  const bodyRef = useRef<Mesh>(null);
  const cloudsRef = useRef<Mesh>(null);
  const { selectedId, hoveredId, setSelectedId, setHoveredId, reducedMotion } =
    useScene();
  const texture = usePlanetTexture("earth");
  const clouds = useEarthCloudsTexture();

  // Earth is motionless in the medieval model; this is only a slow turn
  // of the body itself so its surface can be seen — the cloud shell
  // drifts a little faster than the ground beneath it.
  useFrame((_, delta) => {
    if (!reducedMotion) {
      if (bodyRef.current) bodyRef.current.rotation.y += delta * 0.08;
      if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.115;
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
          <sphereGeometry args={[sphere.bodyRadius, 64, 64]} />
          <meshStandardMaterial
            map={texture}
            color="#ffffff"
            emissiveMap={texture}
            emissive="#ffffff"
            emissiveIntensity={0.18}
            roughness={0.75}
            metalness={0.02}
          />
        </mesh>
        {/* drifting cloud cover — the map's brightness becomes alpha */}
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[sphere.bodyRadius * 1.03, 48, 48]} />
          <meshStandardMaterial
            color="#ffffff"
            alphaMap={clouds}
            transparent
            opacity={0.3}
            depthWrite={false}
          />
        </mesh>
        {/* thin atmospheric halo */}
        <mesh>
          <sphereGeometry args={[sphere.bodyRadius * 1.12, 32, 32]} />
          <meshBasicMaterial
            color="#6ea8ff"
            transparent
            opacity={0.06}
            depthWrite={false}
          />
        </mesh>
        {isSelected ? <SelectionHalo radius={sphere.bodyRadius * 1.6} /> : null}
      </group>
      <SphereLabel sphere={sphere} offsetY={sphere.bodyRadius + 0.3} />
    </group>
  );
}

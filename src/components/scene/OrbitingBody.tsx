"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, type Group, type Mesh } from "three";
import type { SphereInfo } from "@/lib/cosmology";
import { getPlanetTexture } from "@/lib/planet-textures";
import { useScene } from "@/lib/scene-context";
import { useOrbitalSpin } from "@/lib/useOrbitalSpin";
import OrbitRingLine from "./OrbitRingLine";
import SelectionHalo from "./SelectionHalo";
import SphereLabel from "./SphereLabel";

interface OrbitingBodyProps {
  sphere: SphereInfo;
}

export default function OrbitingBody({ sphere }: OrbitingBodyProps) {
  const spinRef = useRef<Group>(null);
  const bodyRef = useRef<Mesh>(null);
  const { selectedId, hoveredId, setSelectedId, setHoveredId, paused } =
    useScene();
  const isSelected = selectedId === sphere.id;
  const isActive = isSelected || hoveredId === sphere.id;
  // When some other rung is selected, this one recedes.
  const dimmed = selectedId !== null && !isSelected;

  const texture = useMemo(() => getPlanetTexture(sphere.id), [sphere.id]);

  useOrbitalSpin(spinRef, sphere.orbitPeriodSeconds, paused);

  // Slow rotation of the body on its own axis, so surface detail reads.
  useFrame((_, delta) => {
    if (bodyRef.current) {
      bodyRef.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <group position={[0, sphere.height, 0]}>
      <OrbitRingLine
        radius={sphere.orbitRadius}
        color={isSelected ? "#f2c76e" : "#5b6b82"}
        opacity={isSelected ? 0.85 : dimmed ? 0.16 : 0.35}
        lineWidth={isSelected ? 1.8 : 1}
      />
      <OrbitRingLine
        radius={sphere.orbitRadius - 0.14}
        color={isSelected ? "#f2c76e" : "#5b6b82"}
        opacity={isSelected ? 0.4 : dimmed ? 0.06 : 0.14}
      />
      {/* Faint translucent disc — the "hollow and transparent globe" this
          rung stands in for. Raycast disabled so it never blocks clicks. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={-2}
        raycast={() => null}
      >
        <circleGeometry args={[sphere.orbitRadius, 64]} />
        <meshBasicMaterial
          color={isSelected ? "#f2c76e" : sphere.color}
          transparent
          opacity={isSelected ? 0.1 : isActive ? 0.07 : dimmed ? 0.012 : 0.03}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
      <group ref={spinRef}>
        <group position={[sphere.orbitRadius, 0, 0]}>
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
            scale={isActive ? 1.25 : 1}
          >
            <mesh ref={bodyRef}>
              <sphereGeometry args={[sphere.bodyRadius, 48, 48]} />
              <meshStandardMaterial
                map={texture ?? undefined}
                color={texture ? "#ffffff" : sphere.color}
                emissive={sphere.emissive ?? "#000000"}
                emissiveIntensity={sphere.id === "sun" ? 1.1 : 0.22}
                roughness={0.65}
                metalness={0.05}
              />
            </mesh>
            {isSelected ? (
              <SelectionHalo radius={sphere.bodyRadius * 1.6} />
            ) : null}
            {sphere.id === "saturn" ? (
              <>
                <mesh rotation={[-Math.PI / 2 + 0.32, 0, 0]}>
                  <ringGeometry
                    args={[
                      sphere.bodyRadius * 1.45,
                      sphere.bodyRadius * 1.95,
                      64,
                    ]}
                  />
                  <meshBasicMaterial
                    color="#d8c188"
                    transparent
                    opacity={0.5}
                    side={DoubleSide}
                    depthWrite={false}
                  />
                </mesh>
                <mesh rotation={[-Math.PI / 2 + 0.32, 0, 0]}>
                  <ringGeometry
                    args={[
                      sphere.bodyRadius * 2.0,
                      sphere.bodyRadius * 2.35,
                      64,
                    ]}
                  />
                  <meshBasicMaterial
                    color="#b99a5e"
                    transparent
                    opacity={0.3}
                    side={DoubleSide}
                    depthWrite={false}
                  />
                </mesh>
              </>
            ) : null}
          </group>
          <SphereLabel sphere={sphere} offsetY={sphere.bodyRadius + 0.28} />
        </group>
      </group>
    </group>
  );
}

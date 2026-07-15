"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  DoubleSide,
  RingGeometry,
  Vector3,
  type BufferAttribute,
  type Group,
  type Mesh,
} from "three";
import type { SphereInfo } from "@/lib/cosmology";
import { usePlanetTexture, useSaturnRingTexture } from "@/lib/planet-textures";
import { useScene } from "@/lib/scene-context";
import { useOrbitalSpin } from "@/lib/useOrbitalSpin";
import MoverMotes from "./MoverMotes";
import OrbitRingLine from "./OrbitRingLine";
import SelectionHalo from "./SelectionHalo";
import SphereLabel from "./SphereLabel";

interface OrbitingBodyProps {
  sphere: SphereInfo;
}

/** Saturn's rings from the real ring strip texture. The strip is radial
 * along its x axis, so the ring geometry's UVs are remapped from the
 * default planar mapping to (normalized radius, 0.5). */
function SaturnRings({ bodyRadius }: { bodyRadius: number }) {
  const texture = useSaturnRingTexture();
  const geometry = useMemo(() => {
    const inner = bodyRadius * 1.35;
    const outer = bodyRadius * 2.35;
    const geom = new RingGeometry(inner, outer, 128, 1);
    const pos = geom.attributes.position as BufferAttribute;
    const uv = geom.attributes.uv as BufferAttribute;
    const v = new Vector3();
    const mid = (inner + outer) / 2;
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      uv.setXY(i, v.length() < mid ? 0 : 1, 0.5);
    }
    return geom;
  }, [bodyRadius]);

  return (
    <mesh
      rotation={[-Math.PI / 2 + 0.32, 0, 0]}
      geometry={geometry}
      raycast={() => null}
    >
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.9}
        side={DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function OrbitingBody({ sphere }: OrbitingBodyProps) {
  const spinRef = useRef<Group>(null);
  const bodyRef = useRef<Mesh>(null);
  const {
    selectedId,
    hoveredId,
    setSelectedId,
    setHoveredId,
    paused,
    reducedMotion,
  } = useScene();
  const isSelected = selectedId === sphere.id;
  const isActive = isSelected || hoveredId === sphere.id;
  // When some other rung is selected, this one recedes.
  const dimmed = selectedId !== null && !isSelected;

  const texture = usePlanetTexture(sphere.id);

  useOrbitalSpin(spinRef, sphere.orbitPeriodSeconds, paused || reducedMotion);

  // Slow rotation of the body on its own axis, so surface detail reads.
  useFrame((_, delta) => {
    if (bodyRef.current && !reducedMotion) {
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
              <sphereGeometry args={[sphere.bodyRadius, 64, 64]} />
              <meshStandardMaterial
                map={texture}
                color="#ffffff"
                // Every body self-illuminates through its own surface
                // map — dimly for the planets, so the far side shows
                // detail instead of vanishing into the void; fully for
                // the Sun, which the bloom then sets alight.
                emissiveMap={texture}
                emissive="#ffffff"
                emissiveIntensity={sphere.id === "sun" ? 1.6 : 0.18}
                roughness={0.75}
                metalness={0.02}
              />
            </mesh>
            {isSelected ? (
              <SelectionHalo radius={sphere.bodyRadius * 1.6} />
            ) : null}
            <MoverMotes sphereId={sphere.id} bodyRadius={sphere.bodyRadius} />
            {sphere.id === "saturn" ? (
              <SaturnRings bodyRadius={sphere.bodyRadius} />
            ) : null}
          </group>
          <SphereLabel sphere={sphere} offsetY={sphere.bodyRadius + 0.28} />
        </group>
      </group>
    </group>
  );
}

"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import {
  AdditiveBlending,
  BackSide,
  CanvasTexture,
  SRGBColorSpace,
  type Group,
} from "three";
import { getSphere } from "@/lib/cosmology";
import { useScene } from "@/lib/scene-context";
import SelectionHalo from "./SelectionHalo";
import SphereLabel from "./SphereLabel";

// The Empyrean after Doré's engraving of Paradiso XXXI: a blinding
// central sun with radiating spokes, ringed by the circling host — the
// Celestial Rose. The whole rose is billboarded so it always faces the
// viewer, the way the engraving faces Dante and Beatrice; the rings of
// the host wheel slowly about the view axis, adjacent rings in
// counter-rotation. Everything is seeded and deterministic.

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The central sunburst — a radial glow with ~80 seeded rays. */
function createBurstTexture(): CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const c = size / 2;

  const glow = ctx.createRadialGradient(c, c, 0, c, c, c);
  glow.addColorStop(0, "rgba(255, 246, 220, 0.95)");
  glow.addColorStop(0.12, "rgba(255, 226, 150, 0.5)");
  glow.addColorStop(0.4, "rgba(255, 214, 120, 0.12)");
  glow.addColorStop(1, "rgba(255, 214, 120, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  const rand = mulberry32(31);
  for (let i = 0; i < 80; i++) {
    const angle = (i / 80) * Math.PI * 2 + (rand() - 0.5) * 0.06;
    const len = c * (0.35 + rand() * 0.6);
    const x2 = c + Math.cos(angle) * len;
    const y2 = c + Math.sin(angle) * len;
    const ray = ctx.createLinearGradient(c, c, x2, y2);
    ray.addColorStop(0, `rgba(255, 236, 180, ${0.5 + rand() * 0.35})`);
    ray.addColorStop(1, "rgba(255, 236, 180, 0)");
    ctx.strokeStyle = ray;
    ctx.lineWidth = 0.8 + rand() * 1.8;
    ctx.beginPath();
    ctx.moveTo(c, c);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** A soft round blob for the points of the host. */
function createMoteTexture(): CanvasTexture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const c = size / 2;
  const grad = ctx.createRadialGradient(c, c, 0, c, c, c);
  grad.addColorStop(0, "rgba(255, 250, 235, 1)");
  grad.addColorStop(0.4, "rgba(255, 245, 220, 0.5)");
  grad.addColorStop(1, "rgba(255, 245, 220, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

interface HostRingProps {
  radius: number;
  count: number;
  size: number;
  /** Radians per second about the view axis; sign sets direction. */
  speed: number;
  seed: number;
  texture: CanvasTexture;
}

/** One wheeling ring of the angelic host, in the billboard plane. */
function HostRing({
  radius,
  count,
  size,
  speed,
  seed,
  texture,
}: HostRingProps) {
  const ref = useRef<Group>(null);
  const { paused, reducedMotion } = useScene();

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const rand = mulberry32(seed);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (rand() - 0.5) * 0.25;
      const r = radius + (rand() - 0.5) * 0.32;
      arr[i * 3] = Math.cos(angle) * r;
      arr[i * 3 + 1] = Math.sin(angle) * r;
      arr[i * 3 + 2] = (rand() - 0.5) * 0.15;
    }
    return arr;
  }, [radius, count, seed]);

  useFrame((_, delta) => {
    if (ref.current && !paused && !reducedMotion) {
      ref.current.rotation.z += delta * speed;
    }
  });

  return (
    <group ref={ref}>
      <points raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={texture}
          color="#fff7e0"
          size={size}
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

export default function EmpyreanGlow() {
  const sphere = getSphere("empyrean");
  const { selectedId, hoveredId, setSelectedId, setHoveredId, reducedMotion } =
    useScene();
  const burstRef = useRef<Group>(null);
  const burstTexture = useMemo(() => createBurstTexture(), []);
  const moteTexture = useMemo(() => createMoteTexture(), []);

  // The rays themselves turn, almost imperceptibly.
  useFrame((_, delta) => {
    if (burstRef.current && !reducedMotion) {
      burstRef.current.rotation.z += delta * 0.01;
    }
  });

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

      {/* The Celestial Rose, always facing the viewer. */}
      <Billboard follow>
        <group ref={burstRef}>
          <mesh raycast={() => null} renderOrder={-1}>
            <planeGeometry args={[8.5, 8.5]} />
            <meshBasicMaterial
              map={burstTexture}
              transparent
              opacity={isActive ? 0.75 : 0.55}
              depthWrite={false}
              blending={AdditiveBlending}
            />
          </mesh>
        </group>
        {/* The circling ranks of the host, beyond the reach of the
            rays — a dark gap between light and light, as in Doré. */}
        <HostRing
          radius={4.5}
          count={200}
          size={0.2}
          speed={0.03}
          seed={11}
          texture={moteTexture}
        />
        <HostRing
          radius={5.2}
          count={240}
          size={0.17}
          speed={-0.022}
          seed={12}
          texture={moteTexture}
        />
        <HostRing
          radius={5.9}
          count={280}
          size={0.15}
          speed={0.016}
          seed={13}
          texture={moteTexture}
        />
        <HostRing
          radius={6.6}
          count={320}
          size={0.13}
          speed={-0.011}
          seed={14}
          texture={moteTexture}
        />
      </Billboard>

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
      <SphereLabel sphere={sphere} offsetY={7.4} />
    </group>
  );
}

"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { SPHERES } from "@/lib/cosmology";
import { useScene } from "@/lib/scene-context";
import EarthCore from "./EarthCore";
import OrbitingBody from "./OrbitingBody";
import StellatumShell from "./StellatumShell";
import PrimumMobileShell from "./PrimumMobileShell";
import EmpyreanGlow from "./EmpyreanGlow";
import InfluenceStream from "./InfluenceStream";
import BoundaryVeil from "./BoundaryVeil";
import CameraRig from "./CameraRig";

export default function CosmosCanvas() {
  const { setSelectedId } = useScene();
  const planetSpheres = SPHERES.filter((s) => s.kind === "planet");
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null);

  // Window-level capture so the guard below always knows where the
  // gesture began, regardless of what the pointer went down on.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      pointerDownRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);

  return (
    <Canvas
      camera={{ position: [28, 17, 32], fov: 45, near: 0.1, far: 240 }}
      onPointerMissed={(e) => {
        // Only deselect on a genuine left-click — right/middle buttons and
        // trackpad two-finger presses (which fire contextmenu) pan or open
        // menus, and a drag that ends over empty space must not reset the
        // ascent either.
        if (e.button !== 0) return;
        const down = pointerDownRef.current;
        if (down) {
          const dx = e.clientX - down.x;
          const dy = e.clientY - down.y;
          if (dx * dx + dy * dy > 36) return;
        }
        setSelectedId(null);
      }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#050608"]} />
      <fog attach="fog" args={["#050608", 38, 100]} />
      <ambientLight intensity={0.5} />
      {/* Light literally descends from above in this cosmos. */}
      <directionalLight position={[0, 40, 8]} intensity={0.7} />
      <pointLight
        position={[0, 24, 0]}
        intensity={90}
        distance={55}
        decay={2}
        color="#fff3d6"
      />
      <pointLight position={[14, 9, 14]} intensity={0.4} />

      <Suspense fallback={null}>
        <Stars
          radius={110}
          depth={50}
          count={2500}
          factor={2}
          saturation={0}
          fade
          speed={0.2}
        />

        <EarthCore />

        {planetSpheres.map((sphere) => (
          <OrbitingBody key={sphere.id} sphere={sphere} />
        ))}

        <StellatumShell />
        <PrimumMobileShell />
        <BoundaryVeil />
        <EmpyreanGlow />
        <InfluenceStream />

        <EffectComposer>
          <Bloom
            luminanceThreshold={0.35}
            intensity={0.9}
            mipmapBlur
            radius={0.7}
          />
          <Vignette eskil={false} offset={0.2} darkness={0.8} />
        </EffectComposer>
      </Suspense>

      <CameraRig />
    </Canvas>
  );
}

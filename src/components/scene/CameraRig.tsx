"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { MathUtils, Vector3 } from "three";
import { getSphere } from "@/lib/cosmology";
import { useScene } from "@/lib/scene-context";

const OVERVIEW_TARGET_Y = 11;
const OVERVIEW_DISTANCE = 44;
const horizScratch = new Vector3();
const desired = new Vector3();

/** OrbitControls plus a gentle focus animation: whenever the selection
 * changes, the camera glides to stand at that rung of the tower — eye
 * level with the selected sphere, not staring up from the base. Any
 * manual drag, pan, or zoom cancels the glide (but never the selection),
 * so the rig never fights the user. */
export default function CameraRig() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const focusingRef = useRef(false);
  const { selectedId, paused } = useScene();
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    focusingRef.current = true;
  }, [selectedId]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls || !focusingRef.current) return;

    const sphere = selectedId ? getSphere(selectedId) : null;
    const targetY = sphere ? sphere.height : OVERVIEW_TARGET_Y;
    const distance = sphere
      ? Math.max(12, sphere.orbitRadius * 2 + 8)
      : OVERVIEW_DISTANCE;
    // Stand at the rung: a slight elevation above the layer, seeing it
    // nearly edge-on, rather than looking up from the bottom of the tower.
    const elevation = sphere ? Math.max(2.2, distance * 0.22) : distance * 0.14;

    const target = controls.target;
    target.x = MathUtils.damp(target.x, 0, 3, delta);
    target.z = MathUtils.damp(target.z, 0, 3, delta);
    target.y = MathUtils.damp(target.y, targetY, 3, delta);

    // Preserve the user's azimuth; glide distance and elevation only.
    horizScratch.copy(camera.position).sub(target);
    horizScratch.y = 0;
    if (horizScratch.lengthSq() < 1e-6) horizScratch.set(1, 0, 0.4);
    const horizontal = Math.sqrt(
      Math.max(distance * distance - elevation * elevation, 4),
    );
    horizScratch.setLength(horizontal);
    desired.copy(target).add(horizScratch);
    desired.y = target.y + elevation;

    camera.position.set(
      MathUtils.damp(camera.position.x, desired.x, 2.5, delta),
      MathUtils.damp(camera.position.y, desired.y, 2.5, delta),
      MathUtils.damp(camera.position.z, desired.z, 2.5, delta),
    );

    if (
      Math.abs(target.y - targetY) < 0.05 &&
      camera.position.distanceTo(desired) < 0.15
    ) {
      focusingRef.current = false;
    }
    controls.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan
      target={[0, OVERVIEW_TARGET_Y, 0]}
      minDistance={6}
      maxDistance={80}
      autoRotate={!paused}
      autoRotateSpeed={0.1}
      onStart={() => {
        focusingRef.current = false;
      }}
    />
  );
}

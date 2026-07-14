"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";

interface OrbitRingLineProps {
  radius: number;
  color?: string;
  opacity?: number;
  dashed?: boolean;
  lineWidth?: number;
}

export default function OrbitRingLine({
  radius,
  color = "#5b6b82",
  opacity = 0.35,
  dashed = false,
  lineWidth = 1,
}: OrbitRingLineProps) {
  const points = useMemo(() => {
    const segments = 128;
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push([Math.cos(theta) * radius, 0, Math.sin(theta) * radius]);
    }
    return pts;
  }, [radius]);

  return (
    <Line
      points={points}
      color={color}
      transparent
      opacity={opacity}
      lineWidth={lineWidth}
      dashed={dashed}
      dashSize={dashed ? 0.3 : undefined}
      gapSize={dashed ? 0.2 : undefined}
    />
  );
}

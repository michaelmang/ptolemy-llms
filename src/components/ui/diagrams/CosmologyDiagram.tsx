"use client";

import { SPHERES, type SphereInfo } from "@/lib/cosmology";

interface DiagramProps {
  sphere: SphereInfo;
}

/** Picks and renders the small nested diagram matching this sphere's role
 * in the Ptolemaic model: influence descending (planets), motion
 * cascading (Stellatum / Primum Mobile), the exitus/reditus cycle
 * (Earth), or stillness (the Empyrean, beyond motion entirely). */
export default function CosmologyDiagram({ sphere }: DiagramProps) {
  if (sphere.kind === "planet") {
    return <InfluenceFlowDiagram sphere={sphere} />;
  }
  if (sphere.kind === "stellatum" || sphere.kind === "primum-mobile") {
    return <MotionCascadeDiagram sphere={sphere} />;
  }
  if (sphere.kind === "earth") {
    return <ReturnCycleDiagram />;
  }
  return <StillnessDiagram caption="no motion · no space · pure light" />;
}

function InfluenceFlowDiagram({ sphere }: DiagramProps) {
  return (
    <figure>
      <svg viewBox="0 0 220 128" className="h-auto w-full">
        <line
          x1={110}
          y1={30}
          x2={110}
          y2={94}
          stroke={sphere.color}
          strokeOpacity={0.35}
          strokeWidth={1.5}
        />
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            cx={110}
            cy={26}
            r={3}
            fill={sphere.color}
            className="animate-[diagram-flow-down_2.4s_ease-in-out_infinite]"
            style={{ animationDelay: `${i * 0.75}s` }}
          />
        ))}
        <circle cx={110} cy={18} r={9} fill={sphere.color} stroke="#00000055" />
        <text
          x={110}
          y={4}
          textAnchor="middle"
          fontSize={10}
          fill="#e7e5e4"
          fontFamily="var(--font-serif)"
        >
          {sphere.name}
        </text>
        <circle cx={110} cy={108} r={10} fill="#4c6a8f" stroke="#00000055" />
        <text
          x={110}
          y={126}
          textAnchor="middle"
          fontSize={10}
          fill="#93c5fd"
          fontFamily="var(--font-serif)"
        >
          Earth
        </text>
      </svg>
      {sphere.influence ? (
        <figcaption className="mt-1 text-center text-[11px] text-stone-400">
          descends as <span className="text-stone-300">{sphere.influence}</span>
        </figcaption>
      ) : null}
    </figure>
  );
}

function MotionCascadeDiagram({ sphere }: DiagramProps) {
  const index = SPHERES.findIndex((s) => s.id === sphere.id);
  const next = SPHERES[index - 1];

  return (
    <figure>
      <svg viewBox="0 0 220 128" className="h-auto w-full">
        <line
          x1={110}
          y1={26}
          x2={110}
          y2={98}
          stroke={sphere.color}
          strokeOpacity={0.3}
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
        <g
          className="origin-center animate-[diagram-spin-slow_4s_linear_infinite]"
          style={{ transformOrigin: "110px 62px" }}
        >
          <circle
            cx={110}
            cy={62}
            r={9}
            fill="none"
            stroke={sphere.color}
            strokeWidth={1.5}
            strokeDasharray="6 5"
          />
        </g>
        <circle cx={110} cy={18} r={8} fill={sphere.color} />
        <text
          x={110}
          y={4}
          textAnchor="middle"
          fontSize={10}
          fill="#e7e5e4"
          fontFamily="var(--font-serif)"
        >
          {sphere.name}
        </text>
        <circle
          cx={110}
          cy={108}
          r={8}
          fill={next?.color ?? "#8a8a8a"}
          stroke="#00000055"
        />
        <text
          x={110}
          y={126}
          textAnchor="middle"
          fontSize={10}
          fill="#d6d3d1"
          fontFamily="var(--font-serif)"
        >
          {next?.name ?? "the sphere below"}
        </text>
      </svg>
      <figcaption className="mt-1 text-center text-[11px] text-stone-400">
        rotation cascades downward, sphere by sphere, to the Moon
      </figcaption>
    </figure>
  );
}

function ReturnCycleDiagram() {
  return (
    <figure>
      <svg viewBox="0 0 220 128" className="h-auto w-full">
        <path
          d="M 70 96 L 70 30"
          stroke="#fbbf24"
          strokeWidth={1.75}
          fill="none"
          markerEnd="url(#arrow-up)"
          className="animate-[diagram-pulse-soft_3s_ease-in-out_infinite]"
        />
        <path
          d="M 150 30 L 150 96"
          stroke="#38bdf8"
          strokeWidth={1.75}
          fill="none"
          markerEnd="url(#arrow-down)"
          className="animate-[diagram-pulse-soft_3s_ease-in-out_infinite]"
          style={{ animationDelay: "1.5s" }}
        />
        <path
          d="M 70 30 Q 110 14 150 30"
          stroke="#8a8a8a"
          strokeWidth={1.25}
          fill="none"
        />
        <path
          d="M 70 96 Q 110 112 150 96"
          stroke="#8a8a8a"
          strokeWidth={1.25}
          fill="none"
        />
        <text
          x={70}
          y={20}
          textAnchor="middle"
          fontSize={9}
          fill="#fbbf24"
          fontFamily="var(--font-serif)"
        >
          exitus
        </text>
        <text
          x={150}
          y={20}
          textAnchor="middle"
          fontSize={9}
          fill="#7dd3fc"
          fontFamily="var(--font-serif)"
        >
          reditus
        </text>
        <circle cx={110} cy={104} r={9} fill="#4c6a8f" stroke="#00000055" />
        <text
          x={110}
          y={122}
          textAnchor="middle"
          fontSize={10}
          fill="#93c5fd"
          fontFamily="var(--font-serif)"
        >
          Earth
        </text>
        <defs>
          <marker
            id="arrow-up"
            markerWidth={6}
            markerHeight={6}
            refX={3}
            refY={3}
            orient="auto"
          >
            <path d="M0,6 L3,0 L6,6 Z" fill="#fbbf24" />
          </marker>
          <marker
            id="arrow-down"
            markerWidth={6}
            markerHeight={6}
            refX={3}
            refY={3}
            orient="auto"
          >
            <path d="M0,0 L6,0 L3,6 Z" fill="#38bdf8" />
          </marker>
        </defs>
      </svg>
      <figcaption className="mt-1 text-center text-[11px] text-stone-400">
        going forth through the spheres, and returning — the cycle begins anew
      </figcaption>
    </figure>
  );
}

function StillnessDiagram({ caption }: { caption: string }) {
  return (
    <figure>
      <svg viewBox="0 0 220 128" className="h-auto w-full">
        <circle
          cx={110}
          cy={58}
          r={34}
          fill="none"
          stroke="#fff3d6"
          strokeOpacity={0.25}
          strokeWidth={1}
          className="animate-[diagram-pulse-soft_5s_ease-in-out_infinite]"
        />
        <circle
          cx={110}
          cy={58}
          r={16}
          fill="#fff3d6"
          fillOpacity={0.5}
          className="animate-[diagram-pulse-soft_5s_ease-in-out_infinite]"
        />
        <line
          x1={30}
          y1={104}
          x2={190}
          y2={104}
          stroke="#8fd3e8"
          strokeOpacity={0.4}
          strokeDasharray="3 4"
        />
        <text
          x={110}
          y={120}
          textAnchor="middle"
          fontSize={9}
          fill="#8fd3e8"
          fontFamily="var(--font-serif)"
        >
          the Stellatum, below
        </text>
      </svg>
      <figcaption className="mt-1 text-center text-[11px] text-stone-400">
        {caption}
      </figcaption>
    </figure>
  );
}

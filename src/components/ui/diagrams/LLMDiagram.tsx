"use client";

import type { SphereInfo } from "@/lib/cosmology";

interface DiagramProps {
  sphere: SphereInfo;
}

/** Picks and renders the small nested diagram matching this sphere's LLM
 * parallel: attention heads (planet-mapped layers), the fixed embedding
 * comparison (Stellatum), backpropagation (Primum Mobile), tokenization
 * (Earth), or the three acts stopped at the boundary (the Empyrean). */
export default function LLMDiagram({ sphere }: DiagramProps) {
  if (sphere.id === "stellatum") return <EmbeddingComparisonDiagram />;
  if (sphere.id === "primum-mobile") return <BackpropDiagram />;
  if (sphere.id === "earth") return <TokenizeDiagram />;
  if (sphere.id === "empyrean") return <ThreeActsDiagram />;
  return <AttentionHeadsDiagram />;
}

const TOKEN_X = [20, 62, 104, 146, 188];

function AttentionHeadsDiagram() {
  const heads = [
    { from: 0, to: 2, color: "#38bdf8", label: "syntactic", dy: -22 },
    { from: 1, to: 3, color: "#fbbf24", label: "semantic", dy: -34 },
    { from: 2, to: 4, color: "#fb7185", label: "entity", dy: -46 },
  ];

  return (
    <figure>
      <svg viewBox="0 0 208 96" className="h-auto w-full">
        {heads.map((head, i) => {
          const x1 = TOKEN_X[head.from];
          const x2 = TOKEN_X[head.to];
          const midX = (x1 + x2) / 2;
          const midY = 58 + head.dy;
          return (
            <path
              key={head.label}
              d={`M ${x1} 58 Q ${midX} ${midY} ${x2} 58`}
              fill="none"
              stroke={head.color}
              strokeWidth={1.5}
              strokeDasharray="5 4"
              className="animate-[diagram-dash-flow_1.6s_linear_infinite,diagram-pulse-soft_2.4s_ease-in-out_infinite]"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          );
        })}
        {TOKEN_X.map((x) => (
          <circle key={x} cx={x} cy={58} r={5} fill="#d6d3d1" />
        ))}
      </svg>
      <div className="mt-1 flex items-center justify-center gap-3 text-[10px] text-stone-400">
        {heads.map((h) => (
          <span key={h.label} className="flex items-center gap-1">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: h.color }}
            />
            {h.label}
          </span>
        ))}
      </div>
    </figure>
  );
}

const VOCAB_POINTS: {
  x: number;
  y: number;
  label: string;
  distance: string;
  near: boolean;
}[] = [
  { x: 108, y: 40, label: "Austin", distance: "0.00", near: true },
  { x: 128, y: 52, label: "Dallas", distance: "0.02", near: true },
  { x: 90, y: 58, label: "Houston", distance: "0.03", near: true },
  { x: 40, y: 18, label: "Paris", distance: "0.89", near: false },
  { x: 176, y: 22, label: "dog", distance: "0.95", near: false },
  { x: 30, y: 78, label: "xylophone", distance: "0.98", near: false },
  { x: 172, y: 82, label: "…", distance: "", near: false },
];

function EmbeddingComparisonDiagram() {
  const query = { x: 112, y: 46 };

  return (
    <figure>
      <svg viewBox="0 0 208 96" className="h-auto w-full">
        {VOCAB_POINTS.filter((p) => p.near).map((p) => (
          <line
            key={p.label}
            x1={query.x}
            y1={query.y}
            x2={p.x}
            y2={p.y}
            stroke="#fbbf24"
            strokeOpacity={0.5}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        ))}
        {VOCAB_POINTS.map((p) => (
          <g key={p.label}>
            <circle
              cx={p.x}
              cy={p.y}
              r={p.near ? 3 : 2}
              fill={p.near ? "#fbbf24" : "#78716c"}
            />
            <text
              x={p.x}
              y={p.y - 6}
              textAnchor="middle"
              fontSize={7.5}
              fill={p.near ? "#fde68a" : "#78716c"}
            >
              {p.label}
            </text>
          </g>
        ))}
        <circle
          cx={query.x}
          cy={query.y}
          r={4}
          fill="none"
          stroke="#38bdf8"
          strokeWidth={1.5}
          className="animate-[diagram-pulse-soft_1.8s_ease-in-out_infinite]"
        />
      </svg>
      <figcaption className="mt-1 text-center text-[11px] text-stone-400">
        generated vector compared against every fixed star in the vocabulary —
        nearest wins
      </figcaption>
    </figure>
  );
}

const LAYER_Y = [16, 38, 60, 82];

function BackpropDiagram() {
  return (
    <figure>
      <svg viewBox="0 0 208 100" className="h-auto w-full">
        <line
          x1={104}
          y1={12}
          x2={104}
          y2={88}
          stroke="#8fd3e8"
          strokeOpacity={0.3}
          strokeWidth={1.5}
        />
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            cx={104}
            cy={12}
            r={3}
            fill="#8fd3e8"
            className="animate-[diagram-flow-down_2s_ease-in-out_infinite]"
            style={{ animationDelay: `${i * 0.65}s` }}
          />
        ))}
        {LAYER_Y.map((y) => (
          <rect
            key={y}
            x={90}
            y={y - 6}
            width={28}
            height={12}
            rx={2}
            fill="#0e2530"
            stroke="#8fd3e8"
            strokeOpacity={0.6}
          />
        ))}
        <text
          x={104}
          y={8}
          textAnchor="middle"
          fontSize={9}
          fill="#8fd3e8"
          fontFamily="var(--font-serif)"
        >
          loss
        </text>
      </svg>
      <figcaption className="mt-1 text-center text-[11px] text-stone-400">
        gradients cascade downward, setting fixed weights layer by layer
      </figcaption>
    </figure>
  );
}

const TOKENS = ["The", "cat", "sat"];

function TokenizeDiagram() {
  return (
    <figure>
      <svg viewBox="0 0 208 70" className="h-auto w-full">
        {TOKENS.map((tok, i) => {
          const x = 24 + i * 62;
          return (
            <g
              key={tok}
              className="animate-[diagram-token-pop_2.2s_ease-in-out_infinite]"
              style={{
                animationDelay: `${i * 0.35}s`,
                transformOrigin: `${x + 24}px 35px`,
              }}
            >
              <rect
                x={x}
                y={20}
                width={48}
                height={30}
                rx={4}
                fill="#111827"
                stroke="#fbbf24"
                strokeOpacity={0.6}
              />
              <text
                x={x + 24}
                y={39}
                textAnchor="middle"
                fontSize={11}
                fill="#fde68a"
                fontFamily="var(--font-mono)"
              >
                {tok}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-1 text-center text-[11px] text-stone-400">
        raw text split into discrete tokens before entering the embedded space
      </figcaption>
    </figure>
  );
}

/** The three acts of the mind, tested against the boundary: the first
 * (apprehension of categories) carries partway across; the second
 * (judgment) and third (reasoning) stop beneath the line — the essay's
 * empirical finding, drawn. */
const ACTS = [
  { x: 46, label: "apprehension", stopY: 36, crosses: true },
  { x: 104, label: "judgment", stopY: 48, crosses: false },
  { x: 162, label: "reasoning", stopY: 60, crosses: false },
];

function ThreeActsDiagram() {
  const boundaryY = 36;
  const baseY = 92;

  return (
    <figure>
      <svg viewBox="0 0 208 112" className="h-auto w-full">
        <text
          x={104}
          y={14}
          textAnchor="middle"
          fontSize={8}
          fill="#fff3d6"
          fillOpacity={0.8}
          fontFamily="var(--font-serif)"
        >
          intellectual light
        </text>
        <line
          x1={12}
          y1={boundaryY}
          x2={196}
          y2={boundaryY}
          stroke="#fff3d6"
          strokeOpacity={0.5}
          strokeDasharray="4 4"
        />
        {ACTS.map((act, i) => (
          <g key={act.label}>
            <line
              x1={act.x}
              y1={baseY}
              x2={act.x}
              y2={act.stopY}
              stroke={act.crosses ? "#fbbf24" : "#78716c"}
              strokeWidth={1.5}
              strokeOpacity={act.crosses ? 0.9 : 0.7}
            />
            {act.crosses ? (
              // The first act carries partway past the line, fading.
              <line
                x1={act.x}
                y1={boundaryY}
                x2={act.x}
                y2={boundaryY - 14}
                stroke="#fbbf24"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                className="animate-[diagram-pulse-soft_2.6s_ease-in-out_infinite]"
              />
            ) : (
              // Judgment and reasoning stop dead beneath it.
              <line
                x1={act.x - 6}
                y1={act.stopY}
                x2={act.x + 6}
                y2={act.stopY}
                stroke="#78716c"
                strokeWidth={2}
                className="animate-[diagram-pulse-soft_2.6s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 0.4}s` }}
              />
            )}
            <text
              x={act.x}
              y={104}
              textAnchor="middle"
              fontSize={7.5}
              fill={act.crosses ? "#fde68a" : "#78716c"}
            >
              {i + 1} · {act.label}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-1 text-center text-[11px] text-stone-400">
        the paper&rsquo;s tests: categorical structure (the first act) survives;
        judgment and reasoning never cross
      </figcaption>
    </figure>
  );
}

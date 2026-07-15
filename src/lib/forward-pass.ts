// Canned traces for the "forward pass" animation: exitus and reditus made
// visible. Each trace is a preset prompt with a few generation steps; the
// candidate tokens and probabilities are ILLUSTRATIVE (hand-written to be
// plausible), not the output of a live model — the UI says so. This keeps
// the page payload at zero while still showing the essay's cycle: tokens
// ascend the tower, are compared against the fixed constellation at the
// Stellatum, and the winner folds back into the sequence at Earth.

export interface Candidate {
  token: string;
  /** Illustrative probability in [0, 1]; candidates sorted descending. */
  prob: number;
}

export interface TraceStep {
  candidates: Candidate[];
  /** Always the first (highest-probability) candidate's token. */
  chosen: string;
}

export interface ForwardPassTrace {
  id: string;
  prompt: string;
  promptTokens: string[];
  steps: TraceStep[];
}

export const TRACES: ForwardPassTrace[] = [
  {
    id: "capital",
    prompt: "The capital of Texas is",
    promptTokens: ["The", "capital", "of", "Texas", "is"],
    steps: [
      {
        candidates: [
          { token: "Austin", prob: 0.62 },
          { token: "Houston", prob: 0.11 },
          { token: "Dallas", prob: 0.09 },
          { token: "home", prob: 0.04 },
          { token: "a", prob: 0.03 },
        ],
        chosen: "Austin",
      },
      {
        candidates: [
          { token: ",", prob: 0.34 },
          { token: ".", prob: 0.28 },
          { token: "and", prob: 0.08 },
          { token: "which", prob: 0.06 },
          { token: "the", prob: 0.04 },
        ],
        chosen: ",",
      },
    ],
  },
  {
    id: "syllogism",
    prompt: "All men are mortal. Socrates is a",
    promptTokens: ["All", "men", "are", "mortal", ".", "Socrates", "is", "a"],
    steps: [
      {
        candidates: [
          { token: "man", prob: 0.71 },
          { token: "mortal", prob: 0.09 },
          { token: "philosopher", prob: 0.06 },
          { token: "Greek", prob: 0.03 },
          { token: "human", prob: 0.03 },
        ],
        chosen: "man",
      },
      {
        candidates: [
          { token: ",", prob: 0.41 },
          { token: ".", prob: 0.33 },
          { token: "and", prob: 0.07 },
          { token: "so", prob: 0.05 },
          { token: "therefore", prob: 0.04 },
        ],
        chosen: ",",
      },
    ],
  },
  {
    id: "cat",
    prompt: "The cat sat on the",
    promptTokens: ["The", "cat", "sat", "on", "the"],
    steps: [
      {
        candidates: [
          { token: "mat", prob: 0.46 },
          { token: "floor", prob: 0.13 },
          { token: "couch", prob: 0.09 },
          { token: "windowsill", prob: 0.06 },
          { token: "bed", prob: 0.05 },
        ],
        chosen: "mat",
      },
      {
        candidates: [
          { token: ".", prob: 0.41 },
          { token: ",", prob: 0.22 },
          { token: "and", prob: 0.09 },
          { token: "next", prob: 0.04 },
          { token: "all", prob: 0.03 },
        ],
        chosen: ".",
      },
    ],
  },
  {
    id: "once",
    prompt: "Once upon a",
    promptTokens: ["Once", "upon", "a"],
    steps: [
      {
        candidates: [
          { token: "time", prob: 0.93 },
          { token: "midnight", prob: 0.02 },
          { token: "hill", prob: 0.01 },
          { token: "dream", prob: 0.01 },
          { token: "star", prob: 0.01 },
        ],
        chosen: "time",
      },
      {
        candidates: [
          { token: ",", prob: 0.71 },
          { token: "there", prob: 0.12 },
          { token: ".", prob: 0.05 },
          { token: "in", prob: 0.04 },
          { token: "long", prob: 0.02 },
        ],
        chosen: ",",
      },
    ],
  },
];

export const getTrace = (id: string): ForwardPassTrace | undefined =>
  TRACES.find((t) => t.id === id);

/** Milliseconds per phase of one generation step. */
export const PHASE_MS = {
  ascending: 4200,
  comparing: 3800,
  descending: 2400,
} as const;

export type ForwardPassPhase = keyof typeof PHASE_MS | "done";

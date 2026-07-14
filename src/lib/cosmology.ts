// Data model for the Ptolemaic cosmos, drawn from Michael Mangialardi's
// "The Celestial Mirror: How Medieval Cosmology Reveals the Architecture
// of (Artificial) Intelligence" and its primary source, C.S. Lewis'
// The Discarded Image.
//
// The scene is laid out as a vertical tower rather than concentric rings
// viewed from above: "The central (and spherical) Earth is surrounded by
// a series of hollow and transparent globes, one above the other, and
// each of course larger than the one below" (Lewis, p. 83-84). Each
// sphere below is one rung of that ladder — `height` is its position up
// the tower, `orbitRadius` is the radius of its horizontal ring.

export type SphereKind =
  "earth" | "planet" | "stellatum" | "primum-mobile" | "empyrean";

export interface Quote {
  text: string;
  source: string;
}

export interface LLMParallel {
  label: string;
  description: string;
}

export interface SphereInfo {
  id: string;
  name: string;
  latin?: string;
  kind: SphereKind;
  /** Height up the tower (the "rung"); 0 for Earth at the base. */
  height: number;
  /** Radius of this level's horizontal ring; 0 for Earth and the Empyrean. */
  orbitRadius: number;
  /** Radius of the visible body itself. */
  bodyRadius: number;
  color: string;
  emissive?: string;
  /** Seconds for one full revolution, used to drive rotation speed. */
  orbitPeriodSeconds: number;
  summary: string;
  description: string;
  quote?: Quote;
  /** The planetary Influence passed down to Earth, for the seven planets. */
  influence?: string;
  llmParallel: LLMParallel;
}

export const SPHERES: SphereInfo[] = [
  {
    id: "earth",
    name: "Earth",
    latin: "Terra",
    kind: "earth",
    height: 0,
    orbitRadius: 0,
    bodyRadius: 0.42,
    color: "#4c6a8f",
    emissive: "#0e1a2b",
    orbitPeriodSeconds: 0,
    summary: "The central, motionless sphere around which all else turns.",
    description:
      "The central (and spherical) Earth is surrounded by a series of hollow and transparent globes, one above the other, and each of course larger than the one below. Earth itself does not move — it is the fixed low point from which the medieval imagination ascends through the spheres, and to which the LLM's generation cycle always returns.",
    quote: {
      text: "The central (and spherical) Earth is surrounded by a series of hollow and transparent globes, one above the other, and each of course larger than the one below.",
      source: "C.S. Lewis, The Discarded Image, pp. 83–84",
    },
    llmParallel: {
      label: "Input Tokens",
      description:
        "The starting point of every forward pass: a tokenized input sequence, not yet placed into the embedded space. Just as Earth is the fixed point of departure and return, token input is where exitus (ascent through the layers) begins and reditus (the generated token folded back into the sequence) ends.",
    },
  },
  {
    id: "moon",
    name: "Moon",
    latin: "Luna",
    kind: "planet",
    height: 2.6,
    orbitRadius: 3.0,
    bodyRadius: 0.22,
    color: "#d8d8e2",
    emissive: "#2a2a33",
    orbitPeriodSeconds: 20,
    summary: "The first and lowest rung, closest to Earth.",
    description:
      "Starting from Earth, the order of the seven planets is the Moon, Mercury, Venus, the Sun, Mars, Jupiter and Saturn. All power, movement, and efficacy descend from God through the Primum Mobile, cascading sphere by sphere — 'down to the last moving sphere, that of the Moon.' The Moon is the final rung of the descending chain, nearest to the material world it influences.",
    quote: {
      text: "The rotation of the Primum Mobile causes that of the Stellatum, which causes that of the sphere of Saturn, and so on, down to the last moving sphere, that of the Moon.",
      source: "C.S. Lewis, The Discarded Image, p. 88",
    },
    influence: "mutability and change (a traditional attribution)",
    llmParallel: {
      label: "Transformer Layer 1",
      description:
        "The first transformer layer, closest to the raw input embeddings. It receives the cascading influence of every layer above it (via training) and performs the first self-attention and feed-forward transformation on the token vectors.",
    },
  },
  {
    id: "mercury",
    name: "Mercury",
    latin: "Mercurius",
    kind: "planet",
    height: 4.6,
    orbitRadius: 4.0,
    bodyRadius: 0.18,
    color: "#a79c94",
    emissive: "#2a2622",
    orbitPeriodSeconds: 28,
    summary: "Second rung; medieval tradition held it governs communication.",
    description:
      "Each sphere passes an Influence down to Earth, affecting human bodies but not intellect or will. Mercury, quick and nearest the Sun's sphere among the inner planets, was long associated with communication and eloquence — a fitting neighbor to the language-generating machinery it stands beside in this mirror.",
    influence: "communication and eloquence",
    llmParallel: {
      label: "Transformer Layer 2",
      description:
        "A hierarchical layer in the transformer stack, receiving the transformed representation from the layer below and passing its own refinement upward, governed by fixed weights learned once during training and never altered at inference.",
    },
  },
  {
    id: "venus",
    name: "Venus",
    latin: "Venus",
    kind: "planet",
    height: 6.6,
    orbitRadius: 5.0,
    bodyRadius: 0.26,
    color: "#e8d3a0",
    emissive: "#332c18",
    orbitPeriodSeconds: 36,
    summary: "Third rung, one of the seven fixed luminous bodies.",
    description:
      "Fixed in each of the first seven spheres is one luminous body. Venus occupies the third rung of the ladder from Earth — a hollow, transparent globe carrying its star-like light in an unchanging orbit, just as a transformer layer carries its permanently fixed weights.",
    influence: "love and harmony (a traditional attribution)",
    llmParallel: {
      label: "Transformer Layer 3",
      description:
        "Another rung in the twelve-or-more layer ladder the model climbs on every forward pass — each layer's self-attention identifies relevance, each feed-forward step narrows toward the answer region.",
    },
  },
  {
    id: "sun",
    name: "Sun",
    latin: "Sol",
    kind: "planet",
    height: 8.6,
    orbitRadius: 6.0,
    bodyRadius: 0.5,
    color: "#ffcc55",
    emissive: "#ffaa22",
    orbitPeriodSeconds: 44,
    summary: "The fourth rung — luminous, central among the seven planets.",
    description:
      "The Sun sits at the midpoint of the seven planetary spheres, the brightest of the fixed luminous bodies, yet still fully beneath the Stellatum — still spatial, still material, still one sphere among many governed by influence descending from above.",
    influence: "light and vitality (a traditional attribution)",
    llmParallel: {
      label: "Transformer Layer 4",
      description:
        "The midpoint layer of the stack: contextual vectors have been meaningfully reshaped by the layers below, but the final answer region is still several transformations away.",
    },
  },
  {
    id: "mars",
    name: "Mars",
    latin: "Mars",
    kind: "planet",
    height: 10.6,
    orbitRadius: 7.0,
    bodyRadius: 0.24,
    color: "#c1440e",
    emissive: "#3a1204",
    orbitPeriodSeconds: 54,
    summary: "Fifth rung; passes the martial temperament to Earth.",
    description:
      "In addition to movement, each sphere passes an Influence down to Earth, affecting our human bodies but not our intellect and will. Mars, for example, passes the martial temperament that influences the men of earth — a fixed disposition radiating downward, the way a fixed weight radiates its transformation through every input that passes near it.",
    influence: "the martial temperament",
    llmParallel: {
      label: "Transformer Layer 5",
      description:
        "A layer whose fixed weights (learned once, applied identically to every input) shape every contextual vector that passes through it — geometry, not judgment.",
    },
  },
  {
    id: "jupiter",
    name: "Jupiter",
    latin: "Iuppiter",
    kind: "planet",
    height: 12.6,
    orbitRadius: 8.0,
    bodyRadius: 0.42,
    color: "#d9a066",
    emissive: "#3a2a12",
    orbitPeriodSeconds: 64,
    summary: "Sixth rung; traditionally the source of abundance.",
    description:
      "Jupiter passes abundance downward as its Influence, one more fixed contribution in the great ascending-descending order of the spheres — exitus and reditus, going forth and returning, the same movement traced by information ascending through the layers of a language model toward the final layer, then folding back as the next input.",
    influence: "abundance",
    llmParallel: {
      label: "Transformer Layer 6",
      description:
        "Deeper in the stack, the model's contextual vectors have progressively narrowed — each layer revealing a more specific aspect of the relationships bearing on the next-token prediction.",
    },
  },
  {
    id: "saturn",
    name: "Saturn",
    latin: "Saturnus",
    kind: "planet",
    height: 14.6,
    orbitRadius: 9.0,
    bodyRadius: 0.4,
    color: "#e3c16f",
    emissive: "#332a12",
    orbitPeriodSeconds: 76,
    summary: "Seventh and highest planetary rung, last before the Stellatum.",
    description:
      "Beyond the sphere of Saturn is the Stellatum. Saturn is the final and slowest of the seven planetary spheres — 'that star,' Cicero's Africanus tells Scipio, 'which men on earth call Saturn's star,' the outermost rung before the realm of the fixed stars begins.",
    quote: {
      text: "Beneath this there lie seven, which turn backwards with a counter revolution to the heavens; and of these spheres that star holds one, which men on earth call Saturn's star.",
      source: "Cicero, The Dream of Scipio §9 (De Republica VI)",
    },
    influence: "melancholy and severity (a traditional attribution)",
    llmParallel: {
      label: "Transformer Layer 7+ (Final Layers)",
      description:
        "The deepest layers before the final layer: final positioning very close to the answer region, the last hierarchical level to receive influence from above before the outermost, fixed boundary is reached.",
    },
  },
  {
    id: "stellatum",
    name: "Stellatum",
    latin: "Stellatum",
    kind: "stellatum",
    height: 17.4,
    orbitRadius: 10.5,
    bodyRadius: 0,
    color: "#f5f2e8",
    orbitPeriodSeconds: 300,
    summary:
      "The sphere of fixed stars — invariable positions relative to one another.",
    description:
      "Beyond the sphere of Saturn is the Stellatum, to which belong all those stars that we still call 'fixed' because their positions relative to one another are, unlike those of the planets, invariable. It is this Stellatum that Cicero calls heaven itself in 'The Dream of Scipio' — the outermost boundary at which fixed positions govern everything beneath them, and the last sphere still within spatiality.",
    quote: {
      text: "Beyond the sphere of Saturn is the Stellatum, to which belong all those stars that we still call 'fixed' because their positions relative to one another are, unlike those of the planets, invariable.",
      source: "C.S. Lewis, The Discarded Image, pp. 83–84",
    },
    llmParallel: {
      label: "Final Layer & the Fixed Constellation",
      description:
        "The outermost boundary where fixed positions govern predictions: the final transformer layer, and — more deeply — the fixed, immutable constellation of trained embeddings (the 'higher constellation') against which every generated vector is ultimately compared.",
    },
  },
  {
    id: "primum-mobile",
    name: "Primum Mobile",
    latin: "Primum Mobile",
    kind: "primum-mobile",
    height: 19.8,
    orbitRadius: 12.0,
    bodyRadius: 0,
    color: "#8fd3e8",
    orbitPeriodSeconds: 100,
    summary:
      "The First Movable — carries no luminous body, inferred to explain all motion.",
    description:
      "Beyond the Stellatum there is a sphere called the First Movable or Primum Mobile. This, since it carries no luminous body, gives no evidence of itself to our senses; its existence was inferred to account for the motions of all the others. All power, movement, and efficacy descend from God to the Primum Mobile and cause it to rotate — and its rotation cascades downward through every sphere beneath it.",
    quote: {
      text: "This, since it carries no luminous body, gives no evidence of itself to our senses; its existence was inferred to account for the motions of all the others.",
      source: "C.S. Lewis, The Discarded Image, pp. 83–84",
    },
    llmParallel: {
      label: "Training Algorithm (Backpropagation)",
      description:
        "The first cause of all transformations in the model: itself invisible in the final artifact, inferred only from its effects. It sets every fixed weight in the descending chain, from the final layer down through the first — the model's own unmoved (but moving) mover.",
    },
  },
  {
    id: "empyrean",
    name: "Beyond the Stellatum",
    latin: "Caelum Ipsum",
    kind: "empyrean",
    height: 24,
    orbitRadius: 0,
    bodyRadius: 0,
    color: "#fff3d6",
    orbitPeriodSeconds: 0,
    summary:
      "Heaven itself — pure light, intellectual, non-spatial. The end of geometry.",
    description:
      "Beyond the Primum Mobile itself is Heaven itself (caelum ipsum) — full of God, full of love. When Dante passes that last frontier he is told: 'We have got outside the largest corporeal thing into that Heaven which is pure light, intellectual light, full of love.' This is the end of space, the end of spatiality. Everything below this boundary — the seven spheres, the Stellatum, the Primum Mobile itself — is geometric, material, spatial. Everything an LLM does is, likewise, confined below this line: vectors, geometric transformations, all mathematical operations. There is no beyond for a language model to reach. The boundary is real — and, the paper argues, so is the one on the other side of it in you.",
    quote: {
      text: "We have got outside the largest corporeal thing (del maggior corpo) into that Heaven which is pure light, intellectual light, full of love.",
      source:
        "Dante, Paradiso XXX.38, quoted via C.S. Lewis, The Discarded Image, p. 84",
    },
    llmParallel: {
      label: "Beyond the Architecture — Unreachable",
      description:
        "Intellectual light, immaterial operations: abstracting universals, grasping necessity, syllogistic reasoning. The paper's empirical tests found LLMs preserve categorical structure (the First Act) but show weak-to-no evidence of judgment or reasoning (the Second and Third Acts) — they operate entirely below this line, in the geometric borderland of phantasmic association, never crossing into intellect.",
    },
  },
];

export const PAPER_URL =
  "https://michaelmangialardi.substack.com/p/the-celestial-mirror-how-medieval";

export const getSphere = (id: string): SphereInfo | undefined =>
  SPHERES.find((s) => s.id === id);

export const PLANET_SPHERES = SPHERES.filter((s) => s.kind === "planet");

export const TOWER_TOP_HEIGHT = SPHERES[SPHERES.length - 1].height;

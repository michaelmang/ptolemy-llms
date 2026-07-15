# Design Decisions — The Celestial Mirror

This document preserves the load-bearing design decisions behind the app so future work
(by humans or agents) doesn't accidentally undo them. The README describes _what_ the app
does; this describes _why it is built the way it is_.

## The one inviolable rule: one structure, two readings

The entire app is a single 3D structure that supports two complete readings — the
**Ptolemaic Cosmos** and the **LLM Architecture**. The mode toggle (`ViewMode` in
`src/lib/scene-context.tsx`) changes **labels, prose, colors of emphasis, and the
direction of the particle stream — never the geometry**. The essay's argument is that the
two architectures are structurally the same; if a feature needs different geometry per
mode, it breaks the thesis and doesn't belong.

Corollary: the InfoPanel always shows **both** readings for a selected sphere, stacked,
with the active mode's section highlighted (amber border for cosmology, sky for LLM). The
inactive reading is dimmed, not hidden.

## Vertical tower, not concentric rings

The cosmos is deliberately rendered as a **vertical tower** — Earth at the base, each
sphere a horizontal ring stacked "one above the other," per the C.S. Lewis quote
(_The Discarded Image_, pp. 83–84) that opens the intro overlay. This is the app's core
visual thesis and its main differentiator from every textbook diagram of Ptolemy
(concentric circles viewed from above). It also makes the transformer reading legible:
a stack of layers climbed bottom-to-top.

- Each `SphereInfo` has `height` (rung position) and `orbitRadius` (ring size);
  rings get _larger_ as they ascend, matching Lewis ("each of course larger than
  the one below").
- The eleven rungs, in order: Earth → Moon → Mercury → Venus → Sun → Mars → Jupiter →
  Saturn → Stellatum → Primum Mobile → Empyrean ("Beyond the Stellatum").
- LLM mapping: Earth = input tokens; the seven planets = transformer layers 1–7+;
  Stellatum = final layer + the fixed embedding constellation; Primum Mobile =
  backpropagation (invisible in the artifact, inferred from its effects); Empyrean =
  what no geometric operation can reach.

## The boundary is the point

`BoundaryVeil.tsx` draws a dashed ring at `BOUNDARY_Y = 22`, between the Primum Mobile
(height 19.8) and the Empyrean (height 24). Its captions are mode-dependent:
"here spatiality ends / beyond: intellectual light, full of love" vs. "the architecture
ends here / no geometric operation crosses this line." This is the essay's central claim
made visible. Any redesign must keep this line the visual and narrative climax of the
ascent; the InfoPanel's rung navigation even ends with "the ascent ends here."

## Single source of truth for content

All content lives in `src/lib/cosmology.ts` as the `SPHERES: SphereInfo[]` array — names,
Latin names, heights, radii, colors, orbit periods, prose descriptions, quotes, planetary
influences, and the `llmParallel` for each rung. Components consume it; nothing hardcodes
sphere-specific content elsewhere **except** the per-sphere SVG diagrams (keyed by sphere
`id` in `diagrams/CosmologyDiagram.tsx` and `diagrams/LLMDiagram.tsx`).

Content sourcing rules:

- Every quote is from a primary source (Lewis's _The Discarded Image_, Cicero's _Dream of
  Scipio_, Dante's _Paradiso_, Aquinas) with page/section citations, or from the essay
  itself (`PAPER_URL` = the Substack essay).
- Planetary influences not directly from the essay are hedged as
  "(a traditional attribution)" — keep that honesty marker.
- The Stellatum's embedding diagram uses the essay's own Austin/Dallas/Houston
  nearest-neighbor example with its actual distances; don't swap in a generic example.

## Camera: the guided ascent

`CameraRig.tsx` implements the "climb the tower" interaction:

- On selection, the camera **glides to stand at the selected sphere's rung** — eye level
  with the layer, seeing it nearly edge-on — not staring up from the base. Elevation is
  `max(2.2, distance * 0.22)` above the rung.
- The glide **preserves the user's azimuth** (only distance/elevation/target animate),
  so orbiting around the tower never gets yanked.
- Any manual drag/pan/zoom (`onStart` on OrbitControls) **cancels the glide but never
  the selection** — "the rig never fights the user."
- Deselection returns to an overview (`target y = 11`, distance 44). A slow autoRotate
  (0.1) runs only when nothing is hovered or selected.

## Motion pauses for precision

`paused` in scene context is derived: `selectedId !== null || hoveredId !== null`.
Orbital revolution and autorotation pause whenever anything is hovered or selected, so
users can actually click moving bodies. Orbit periods (`orbitPeriodSeconds`) increase
with height — higher spheres revolve more slowly, which reads as majesty.

## Deselection guard

`CosmosCanvas.tsx`'s `onPointerMissed` only deselects on a genuine left-click: it ignores
non-zero buttons (right/middle/trackpad-contextmenu pans) and any gesture that moved more
than 6px (`dx² + dy² > 36`) from pointer-down, tracked via a window-level capture. A drag
that ends over empty space must not reset the ascent. This guard exists because it was a
real UX failure; don't simplify it away.

## Determinism as theme

Everything procedural is **seeded and deterministic** — the particle stream
(`InfluenceStream.tsx`, pure sin-hash rand), the mover motes' phases (hash of sphere
id). Stated rationale in the code: "the same cosmos appears on every visit — fitting,
for a model in which the heavens are fixed." Keep new visual elements deterministic;
no `Math.random()` in the scene.

## Planet surfaces are real 2K maps

`planet-textures.ts` loads real equirectangular surface maps (2048×1024, in
`public/textures/`) from **Solar System Scope, CC BY 4.0** — the license requires the
visible credit in the header card and README; keep it if textures stay. The old seeded
canvas-procedural textures were replaced wholesale for surface detail. Notes:

- Every body self-illuminates through its own map (`emissiveMap = map`, intensity 0.18;
  Sun 1.6 so the bloom sets it alight) — a flat gray `emissive` washes the detail out,
  and pushing intensity much higher blooms the whole disc white.
- Earth gets a separate drifting cloud shell (`2k_earth_clouds.jpg` as **alphaMap**,
  opacity ~0.3 — higher whites out the continents) and a thin atmosphere halo.
- Saturn's rings use the ring strip texture with ring-geometry UVs remapped to
  (normalized radius, 0.5); the strip is radial along its x axis.
- Lighting for texture legibility: ambient 0.55, downward directional 1.15, plus a
  soft hemisphere fill — the top-down-only light left camera-facing sides too dark.

## Directional symbolism

- **Light literally descends from above**: the key light is a warm point light at the top
  of the tower (y = 24, `#fff3d6` — the Empyrean's color) plus a downward directional
  light. The Empyrean is the light source of the whole scene.
- **`InfluenceStream` reverses per mode**: golden particles _descend_ along the axis
  mundi from the Primum Mobile toward Earth in cosmology mode (influence cascading down);
  blue particles _ascend_ from the input tokens toward the Stellatum in LLM mode (the
  forward pass). Same axis, read both ways — exitus and reditus.

## Visual identity

- Palette: near-black background `#050608` with fog; **amber** (`amber-300/400`) is the
  cosmology accent, **sky** (`sky-300/400`) the LLM accent — consistently, from the header
  toggle through the InfoPanel to diagram strokes. Empyrean cream is `#fff3d6`.
- Type: serif for names/quotes/medieval voice, sans for UI, mono for tokens.
- UI overlay style: `bg-black/50–60` + `backdrop-blur-md` + `border-white/10` rounded
  cards floating over the canvas; panels are `pointer-events-none` wrappers with
  `pointer-events-auto` cards so the canvas stays draggable between them.
- Post-processing: Bloom (threshold 0.35, so only genuinely luminous bodies bloom)
  plus Vignette. The bloom is what makes bodies read as "luminous" per Lewis.
- Small animated SVG diagrams (~208×~96 viewBox) in the InfoPanel use CSS keyframes
  defined in `globals.css` (`diagram-dash-flow`, `diagram-pulse-soft`,
  `diagram-flow-down`, `diagram-token-pop`); a `prefers-reduced-motion` media query
  in `globals.css` stills them all.

## Interaction inventory

- Intro overlay: quote-first, three entry paths — "Begin the ascent" (selects Earth),
  "Take the guided tour," or "Explore freely." A deep link (`?rung=...`) skips it.
- Header: title card + essay link + the two-mode toggle + the ♪ music toggle.
- Selection targets: bodies, orbit rings, and shells are all clickable; hover shows
  a `SphereLabel` (mode-dependent text) and `SelectionHalo`.
- Keyboard: ↑/↓ climb and descend the rungs, Escape deselects and ends the tour
  (`KeyboardNav.tsx`; ignores keystrokes aimed at form controls).
- InfoPanel (right side on desktop, bottom sheet on mobile): kind label → name → Latin →
  both readings with diagrams → rung navigation (↓ below / "rung n of 11" / ↑ above,
  the up button amber to encourage ascent).

## Shareable URL state

Every rung of the ascent is a link: `?rung=<sphere-id>&view=llm` (both params omitted
at their defaults). The page (`page.tsx`) reads `searchParams` on the server — making
the route dynamic — so deep links render selected-on-first-paint with per-sphere
`generateMetadata`. Client-side, `SceneProvider` mirrors selection/mode into the URL
with `history.replaceState` (never the router: no history spam, no server re-render).

Per-sphere OG images come from the `/og` route handler (`src/app/og/route.tsx`), which
renders the default card with no params and a sphere card with `?rung=`. The
file-convention `opengraph-image.tsx`/`twitter-image.tsx` were **deliberately removed**:
file-based metadata takes precedence over `generateMetadata`, which would have made
per-sphere images impossible. Don't reintroduce them.

## The guided tour

The tour (`TourController.tsx`) is deliberately thin: **the tour's position is simply
the current selection.** A timer advances the selection every `TOUR_STEP_MS` (14s);
manual clicks re-aim the tour rather than fighting it; deselecting (Escape, click on
empty space) ends it; it stops — rather than wrapping — at the Empyrean, because "the
ascent ends here." Controls live in a slim bar atop the InfoPanel (pause/resume, exit,
a CSS-animated progress bar keyed by `selectedId`). The context callbacks it depends on
are `useCallback`-stable so hover re-renders don't reset the step timer.

## The forward pass

`ForwardPassPulse.tsx` + `ForwardPassPanel.tsx` + `src/lib/forward-pass.ts` animate one
generation cycle on the tower itself: a blue pulse ascends Earth → Stellatum (each ring
flares as it passes), holds while a candidate panel shows the nearest-neighbor
comparison, then descends amber (reditus) and appends the winner to the sequence.

- Traces are **canned and clearly labeled "an illustrative trace, not a live model"** —
  hand-written plausible candidates/probabilities, zero payload. If a live in-browser
  model is ever added, keep the honesty label until then.
- The pulse stops at the **Stellatum**, not the Primum Mobile: training plays no part
  in inference.
- Phase timing lives in one place (`PHASE_MS`); the state machine is a chained timeout
  in `ForwardPassProvider`, and the 3D pulse derives its position from `phaseStart`
  timestamps rather than running its own timers.
- Ascent color is the LLM sky-blue, descent the cosmology amber — the two readings of
  the same axis, matching `InfluenceStream`.
- Mobile: the panel shares the bottom-sheet slot with the InfoPanel (info panel wins
  when a sphere is selected; the empty-state panel offers the mobile entry button).

## Intelligences / attention heads, and the music of the spheres

Each planetary body carries three faint motes (`MoverMotes.tsx`) orbiting it — in the
cosmology reading its Intelligence (the sphere's mover, per Lewis), in the LLM reading
the layer's attention heads. **Same geometry in both modes** (the inviolable rule);
only the InfoPanel captions change. Phases are hash-seeded per sphere id — deterministic
like everything else.

The ♪ toggle (`useSphereMusic.ts`) sounds the music of the spheres via Web Audio: nine
sine tones in just-intonation ratios rising with height, one per **moving** sphere —
Earth (motionless) and the Empyrean (beyond geometry, beyond sound) are silent.
Selecting a sphere draws its voice forward from the drone. The AudioContext is created
in the toggle's click handler (autoplay policy) and closed on toggle-off.

Separately, **every rung has its own voice and haptic** (`rung-audio.ts` +
`RungFeedback.tsx`, mounted in the page): while a rung is selected, a quiet ambience
plays whose timbre matches the sphere's medieval temperament — Earth a grounded hum,
Mercury chattering twinkles, Venus a warm major third, Mars a low sawtooth growl,
Saturn a slow minor third, the Stellatum the richest voice (a detuned choir under
deterministic bell twinkles from a high lydian set — the fixed stars sounding one at a
time), the Primum Mobile a deep pulse, the Empyrean a high radiant cluster. One shared
AudioContext lives across selections so climbing **crossfades** voice to voice; it
starts on the selection gesture (a deep link stays suspended until the first
pointerdown). Arrival at a rung also fires that rung's Vibration API pattern — gated
behind the first user gesture, because browsers reject (and log errors for) `vibrate`
before one; iOS ignores it entirely, by design of the platform. All voices are
independent of — and quiet enough to coexist with — the ♪ drone. Keep everything
subtle; nothing here should ever demand attention.

## The Celestial Rose (the Empyrean, after Doré)

`EmpyreanGlow.tsx` draws the Empyrean after Doré's engraving of _Paradiso_ XXXI: a
blinding central core with ~80 seeded rays (a canvas-generated burst texture on an
additive plane), then a **deliberate dark gap**, then four concentric rings of the
host — soft-blob point sprites wheeling slowly about the view axis, adjacent rings in
counter-rotation. The whole rose is **billboarded** (drei `Billboard`) so it always
faces the viewer, the way the engraving faces Dante; the rings rotate in the billboard
plane. All of it is seeded/deterministic, raycast-disabled (the small marker sphere
remains the click target), and paused by hover/reduced-motion like the rest of the
heavens. The host rings sit at radius 4.5–6.6, **outside the ray tips** — early
versions with rings inside the rays washed out into a shapeless glow. `CameraRig`
special-cases the Empyrean's standing distance (22 rather than the orbit-radius
formula) so the full ~13-unit rose fits the frame; the sphere label rides above it at
offset 7.4.

## The Three Acts at the boundary

The Empyrean's LLM diagram (`ThreeActsDiagram` in `LLMDiagram.tsx`) draws the essay's
empirical finding: the first act of the mind (apprehension of categories) carries
partway across the boundary line; the second (judgment) and third (reasoning) stop
beneath it. Keep this the LLM-side diagram for the Empyrean — it subsumes the older
"unreachable line" version.

## Accessibility & performance

- `reducedMotion` in scene context mirrors `prefers-reduced-motion` via
  `useSyncExternalStore`: orbital revolution, body self-rotation, autorotation, and the
  particle stream all still; the camera glide becomes a snap; CSS diagram animations
  stop via media query.
- Adaptive resolution: drei's `PerformanceMonitor` inside the Canvas drops DPR to 1 on
  sustained frame drops and restores `[1, 2]` on recovery.

## Stack constraints

- Next.js **16** App Router — this version has breaking changes vs. training data;
  per `AGENTS.md`, read `node_modules/next/dist/docs/` before writing Next-specific code.
- React 19, React Three Fiber 9 / drei 10 / three 0.185, `@react-three/postprocessing`,
  Tailwind 4 (PostCSS plugin, no config file), TypeScript strict, ESLint + Prettier
  (with tailwind class sorting).
- Everything interactive is client components. The root page is **dynamically
  rendered** (it reads `searchParams` for deep links and per-sphere metadata); it
  deploys to Vercel with Vercel Analytics. Favicons are `next/og` file-convention
  routes; OG/twitter cards come from the `/og` route handler.
- React context crosses the R3F `Canvas` boundary in this setup (scene components call
  `useScene`/`useForwardPass` directly); rely on it, no context bridge needed.

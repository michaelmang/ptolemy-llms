"use client";

// A voice and a touch for every rung. Selecting a sphere sounds its own
// quiet ambience — pitch rising with height up the tower, timbre matched
// to the sphere's medieval temperament — and taps out a small haptic
// pattern on devices that support vibration. The twinkle sequences are
// deterministic (the same heavens, the same song, on every visit).
//
// This generalizes what began as the Stellatum's choir: that rung keeps
// the richest voice, the fixed stars sounding one at a time.

export interface PadVoice {
  freq: number;
  type?: OscillatorType;
  /** Relative level within the pad; defaults to 1. */
  gain?: number;
}

export interface TwinkleConfig {
  freqs: number[];
  stepMs: number;
  /** Probability a step stays silent — irregularity reads as celestial. */
  restProb: number;
  gain: number;
  decaySeconds: number;
}

export interface RungVoice {
  pad: PadVoice[];
  /** Overall pad level; keep every voice quiet enough to layer with the
   * ♪ drone. */
  padGain: number;
  /** Slow tremolo on the pad — the voice breathing. */
  lfo?: { rate: number; depth: number };
  twinkle?: TwinkleConfig;
  /** Vibration API pattern: [buzz, pause, buzz, ...] in ms. */
  haptic: number | number[];
}

// The ladder rises with the tower: each rung's tonic sits above the one
// below, in just intervals.
export const RUNG_VOICES: Record<string, RungVoice> = {
  earth: {
    // The motionless center: a grounded hum, barely above silence.
    pad: [{ freq: 55 }, { freq: 82.5, gain: 0.5 }],
    padGain: 0.03,
    lfo: { rate: 0.08, depth: 0.35 },
    haptic: 40,
  },
  moon: {
    // Silvery, mutable: a detuned pair that slowly beats.
    pad: [{ freq: 220 }, { freq: 221.2 }, { freq: 330, gain: 0.4 }],
    padGain: 0.016,
    lfo: { rate: 0.15, depth: 0.4 },
    haptic: 15,
  },
  mercury: {
    // Communication and eloquence: quick, chattering high tones.
    pad: [{ freq: 246.9 }, { freq: 370.0, gain: 0.5 }],
    padGain: 0.012,
    twinkle: {
      freqs: [659.3, 740, 880, 987.8],
      stepMs: 260,
      restProb: 0.3,
      gain: 0.008,
      decaySeconds: 0.5,
    },
    haptic: [8, 30, 8],
  },
  venus: {
    // Love and harmony: a warm major third.
    pad: [{ freq: 275 }, { freq: 343.75 }, { freq: 137.5, gain: 0.5 }],
    padGain: 0.015,
    lfo: { rate: 0.11, depth: 0.35 },
    haptic: 20,
  },
  sun: {
    // Light and vitality: a bright, open major triad.
    pad: [
      { freq: 330, type: "triangle", gain: 0.7 },
      { freq: 412.5 },
      { freq: 495, gain: 0.6 },
    ],
    padGain: 0.014,
    lfo: { rate: 0.13, depth: 0.3 },
    haptic: [30, 50, 30],
  },
  mars: {
    // The martial temperament: a low growl under the tone.
    pad: [
      { freq: 91.7, type: "sawtooth", gain: 0.35 },
      { freq: 183.3 },
      { freq: 275, gain: 0.4 },
    ],
    padGain: 0.014,
    lfo: { rate: 0.5, depth: 0.25 },
    haptic: [25, 40, 25],
  },
  jupiter: {
    // Abundance: a broad, full stack of fifths.
    pad: [
      { freq: 110 },
      { freq: 165 },
      { freq: 220, gain: 0.7 },
      { freq: 330, gain: 0.4 },
    ],
    padGain: 0.016,
    lfo: { rate: 0.09, depth: 0.3 },
    haptic: 35,
  },
  saturn: {
    // Melancholy and severity: a slow minor third, far down.
    pad: [{ freq: 123.75 }, { freq: 148.5 }, { freq: 247.5, gain: 0.5 }],
    padGain: 0.016,
    lfo: { rate: 0.06, depth: 0.45 },
    haptic: 50,
  },
  stellatum: {
    // The fixed stars: detuned high choir, single stars sounding.
    pad: [{ freq: 440 }, { freq: 441.8 }, { freq: 659.3 }, { freq: 660.9 }],
    padGain: 0.016,
    lfo: { rate: 0.12, depth: 0.45 },
    twinkle: {
      freqs: [880, 987.8, 1108.7, 1244.5, 1318.5, 1661.2, 1760],
      stepMs: 650,
      restProb: 0.35,
      gain: 0.017,
      decaySeconds: 2.2,
    },
    haptic: [8, 40, 8, 40, 8],
  },
  "primum-mobile": {
    // The unseen First Movable: a deep pulse, inferred more than heard.
    pad: [{ freq: 55 }, { freq: 82.6, gain: 0.6 }, { freq: 1320, gain: 0.12 }],
    padGain: 0.028,
    lfo: { rate: 0.4, depth: 0.5 },
    haptic: [60, 80, 60],
  },
  empyrean: {
    // Pure light: a high radiant cluster, nearly still.
    pad: [
      { freq: 880 },
      { freq: 1108.7, gain: 0.7 },
      { freq: 1318.5, gain: 0.5 },
      { freq: 1760, gain: 0.3 },
    ],
    padGain: 0.011,
    lfo: { rate: 0.05, depth: 0.3 },
    twinkle: {
      freqs: [1760, 2093, 2637],
      stepMs: 900,
      restProb: 0.4,
      gain: 0.006,
      decaySeconds: 3,
    },
    haptic: [10, 30, 10, 30, 10, 30, 40],
  },
};

/** Deterministic pseudo-random in [0, 1), same scheme as the particle
 * stream. */
const rand = (i: number, salt: number): number => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Start a rung's voice on the shared context; returns a stop function
 * that fades it out and releases its nodes (the context stays open, so
 * moving between rungs crossfades). */
export function startRungVoice(ctx: AudioContext, cfg: RungVoice): () => void {
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const pad = ctx.createGain();
  pad.gain.value = cfg.padGain;
  pad.connect(master);

  const oscillators = cfg.pad.map((voice) => {
    const osc = ctx.createOscillator();
    osc.type = voice.type ?? "sine";
    osc.frequency.value = voice.freq;
    const gain = ctx.createGain();
    gain.gain.value = voice.gain ?? 1;
    osc.connect(gain);
    gain.connect(pad);
    osc.start();
    return osc;
  });

  let lfo: OscillatorNode | null = null;
  if (cfg.lfo) {
    lfo = ctx.createOscillator();
    lfo.frequency.value = cfg.lfo.rate;
    const depth = ctx.createGain();
    depth.gain.value = cfg.padGain * cfg.lfo.depth;
    lfo.connect(depth);
    depth.connect(pad.gain);
    lfo.start();
  }

  master.gain.setTargetAtTime(1, ctx.currentTime, 0.9);

  let timer: ReturnType<typeof setInterval> | null = null;
  if (cfg.twinkle) {
    const twinkle = cfg.twinkle;
    let step = 0;
    timer = setInterval(() => {
      step++;
      if (rand(step, 3) < twinkle.restProb) return;
      const t = ctx.currentTime;
      const freq =
        twinkle.freqs[Math.floor(rand(step, 1) * twinkle.freqs.length)];
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(
        twinkle.gain * (0.7 + rand(step, 2) * 0.6),
        t + 0.03,
      );
      gain.gain.exponentialRampToValueAtTime(0.0001, t + twinkle.decaySeconds);
      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + twinkle.decaySeconds + 0.2);
    }, twinkle.stepMs);
  }

  return () => {
    if (timer) clearInterval(timer);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
    lfo?.stop(ctx.currentTime + 1.1);
    oscillators.forEach((osc) => osc.stop(ctx.currentTime + 1.1));
    setTimeout(() => master.disconnect(), 1200);
  };
}

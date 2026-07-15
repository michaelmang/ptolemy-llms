"use client";

import { useEffect, useRef } from "react";
import { SPHERES } from "@/lib/cosmology";
import { useScene } from "@/lib/scene-context";

// The music of the spheres: each moving sphere sounds one tone, pitch
// rising with height, all sounding together as a quiet drone. Earth
// (motionless) and the Empyrean (beyond geometry, and beyond sound) are
// silent. Selecting a sphere draws its voice forward from the choir.
//
// Ratios are just-intonation steps folded across two octaves — nine
// tones for the nine moving spheres, Moon up to the Primum Mobile.
const BASE_FREQ = 110; // A2
const STEP_RATIOS = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2, 9 / 4, 5 / 2, 3];

const DRONE_GAIN = 0.014;
const SELECTED_GAIN = 0.055;

interface Voice {
  gain: GainNode;
}

export function useSphereMusic(enabled: boolean) {
  const { selectedId } = useScene();
  const ctxRef = useRef<AudioContext | null>(null);
  const voicesRef = useRef<Map<string, Voice>>(new Map());

  useEffect(() => {
    if (!enabled) return;

    const voices = voicesRef.current;
    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1400;
    master.connect(filter);
    filter.connect(ctx.destination);

    const moving = SPHERES.filter((s) => s.orbitPeriodSeconds > 0);
    moving.forEach((sphere, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = BASE_FREQ * (STEP_RATIOS[i] ?? 1);
      const gain = ctx.createGain();
      gain.gain.value = DRONE_GAIN;
      osc.connect(gain);
      gain.connect(master);
      osc.start();
      voices.set(sphere.id, { gain });
    });

    // Fade the whole choir in gently.
    master.gain.setTargetAtTime(1, ctx.currentTime, 0.8);

    return () => {
      voices.clear();
      ctxRef.current = null;
      void ctx.close();
    };
  }, [enabled]);

  useEffect(() => {
    const ctx = ctxRef.current;
    if (!enabled || !ctx) return;
    voicesRef.current.forEach((voice, id) => {
      const target = id === selectedId ? SELECTED_GAIN : DRONE_GAIN;
      voice.gain.gain.setTargetAtTime(target, ctx.currentTime, 0.4);
    });
  }, [enabled, selectedId]);
}

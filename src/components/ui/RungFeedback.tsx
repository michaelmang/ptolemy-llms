"use client";

import { useEffect, useRef } from "react";
import { RUNG_VOICES, startRungVoice } from "@/lib/rung-audio";
import { useScene } from "@/lib/scene-context";

/** Sound and touch for the ascent: while a rung is selected its voice
 * plays, and each arrival taps out that rung's haptic pattern (on
 * devices with vibration — silently ignored elsewhere). One shared
 * AudioContext lives across selections so climbing crossfades voice to
 * voice. Renders nothing. */
export default function RungFeedback() {
  const { selectedId } = useScene();
  const ctxRef = useRef<AudioContext | null>(null);
  const hasGestureRef = useRef(false);

  // Browsers reject vibration before the first user gesture (a deep link
  // lands without one); track it rather than logging a console error.
  useEffect(() => {
    const markGesture = () => {
      hasGestureRef.current = true;
    };
    window.addEventListener("pointerdown", markGesture, { once: true });
    window.addEventListener("keydown", markGesture, { once: true });
    return () => {
      window.removeEventListener("pointerdown", markGesture);
      window.removeEventListener("keydown", markGesture);
    };
  }, []);

  // The voice of the selected rung.
  useEffect(() => {
    if (!selectedId) return;
    const cfg = RUNG_VOICES[selectedId];
    if (!cfg) return;

    let ctx = ctxRef.current;
    if (!ctx || ctx.state === "closed") {
      ctx = new AudioContext();
      ctxRef.current = ctx;
    }
    // Selection normally arrives via click or keystroke, so the context
    // starts running; a deep link straight to a rung has no gesture yet —
    // resume on the first one.
    const resume = () => void ctxRef.current?.resume();
    if (ctx.state === "suspended") {
      window.addEventListener("pointerdown", resume, { once: true });
      void ctx.resume();
    }

    const stop = startRungVoice(ctx, cfg);
    return () => {
      window.removeEventListener("pointerdown", resume);
      stop();
    };
  }, [selectedId]);

  // Close the shared context when the whole app unmounts.
  useEffect(() => {
    return () => {
      void ctxRef.current?.close();
    };
  }, []);

  // The touch of arrival.
  useEffect(() => {
    if (!selectedId || !hasGestureRef.current) return;
    const pattern = RUNG_VOICES[selectedId]?.haptic;
    if (pattern !== undefined && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }, [selectedId]);

  return null;
}

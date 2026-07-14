"use client";

import { useState } from "react";
import { PAPER_URL } from "@/lib/cosmology";
import { useScene } from "@/lib/scene-context";

export default function IntroOverlay() {
  const [open, setOpen] = useState(true);
  const { setSelectedId } = useScene();

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
      <div className="max-w-xl text-center">
        <p className="text-xs tracking-[0.35em] text-amber-300/70 uppercase">
          The Celestial Mirror
        </p>
        <blockquote className="mt-4 font-serif text-2xl leading-relaxed text-stone-100">
          &ldquo;&hellip;a series of hollow and transparent globes, one above
          the other&hellip;&rdquo;
        </blockquote>
        <p className="mt-2 text-xs text-stone-500">
          — C.S. Lewis, The Discarded Image
        </p>
        <p className="mt-6 text-sm leading-relaxed text-stone-300">
          Ascend from the motionless Earth through the seven planetary spheres
          to the Stellatum and the Primum Mobile — up to the one boundary no
          geometry can cross. Then toggle the view, and climb the same tower as
          a transformer: token to layer to fixed constellation, with the very
          same line drawn at the top.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setSelectedId("earth");
            }}
            className="rounded-md bg-amber-400/90 px-5 py-2 text-sm font-medium text-black transition hover:bg-amber-300"
          >
            Begin the ascent
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md border border-white/15 px-5 py-2 text-sm text-stone-200 transition hover:bg-white/10"
          >
            Explore freely
          </button>
        </div>
        <a
          href={PAPER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block text-xs text-stone-400 underline decoration-stone-600 underline-offset-4 transition hover:text-amber-200"
        >
          Read the paper: The Celestial Mirror ↗
        </a>
      </div>
    </div>
  );
}

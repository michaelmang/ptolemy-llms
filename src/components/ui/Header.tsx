"use client";

import { useState } from "react";
import { PAPER_URL } from "@/lib/cosmology";
import { useScene } from "@/lib/scene-context";
import { useSphereMusic } from "@/lib/useSphereMusic";

export default function Header() {
  const { mode, setMode } = useScene();
  const [musicOn, setMusicOn] = useState(false);
  useSphereMusic(musicOn);

  return (
    <header className="pointer-events-none absolute top-0 right-0 left-0 z-10 flex flex-col gap-3 p-4 md:flex-row md:items-start md:justify-between">
      <div className="pointer-events-auto max-w-md rounded-lg border border-white/10 bg-black/50 p-4 backdrop-blur-md">
        <h1 className="font-serif text-lg text-stone-50">
          The Celestial Mirror
        </h1>
        <p className="mt-1 text-xs text-stone-400">
          The Ptolemaic architecture of the cosmos — Earth, the seven planetary
          spheres, the Stellatum, the Primum Mobile, and what lies beyond. After
          Michael Mangialardi&rsquo;s essay on medieval cosmology and LLM
          architecture.
        </p>
        <a
          href={PAPER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-medium text-amber-300/90 transition hover:text-amber-200"
        >
          Read the paper ↗
        </a>
        <p className="mt-1.5 text-[10px] text-stone-600">
          Planet maps ©{" "}
          <a
            href="https://www.solarsystemscope.com/textures/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-stone-700 underline-offset-2 hover:text-stone-400"
          >
            Solar System Scope
          </a>{" "}
          (CC BY 4.0)
        </p>
      </div>

      <div className="pointer-events-auto flex items-center gap-1 self-start rounded-lg border border-white/10 bg-black/50 p-1 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setMode("cosmology")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
            mode === "cosmology"
              ? "bg-amber-400/90 text-black"
              : "text-stone-300 hover:bg-white/10"
          }`}
        >
          Ptolemaic Cosmos
        </button>
        <button
          type="button"
          onClick={() => setMode("llm")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
            mode === "llm"
              ? "bg-sky-400/90 text-black"
              : "text-stone-300 hover:bg-white/10"
          }`}
        >
          LLM Architecture
        </button>
        <span className="mx-0.5 h-5 w-px bg-white/10" aria-hidden />
        <button
          type="button"
          onClick={() => setMusicOn((on) => !on)}
          aria-pressed={musicOn}
          aria-label={
            musicOn
              ? "Silence the music of the spheres"
              : "Sound the music of the spheres"
          }
          title="The music of the spheres — each moving sphere sounds one tone"
          className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
            musicOn
              ? "bg-amber-400/90 text-black"
              : "text-stone-300 hover:bg-white/10"
          }`}
        >
          ♪
        </button>
      </div>
    </header>
  );
}

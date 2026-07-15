export default function Footer() {
  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 md:block">
      <p className="rounded-full border border-white/10 bg-black/40 px-4 py-1.5 text-[11px] tracking-wide text-stone-400 backdrop-blur-md">
        drag to orbit · scroll to zoom · ↑/↓ climb the rungs · hovering pauses
        the heavens · click a sphere for its story
      </p>
    </div>
  );
}

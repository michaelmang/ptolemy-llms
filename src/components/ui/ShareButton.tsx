"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getSphere, SPHERES } from "@/lib/cosmology";
import { useScene } from "@/lib/scene-context";
import { SITE_URL, rungUrl } from "@/lib/site";

// The share loop: every rung is already a deep link with its own Open
// Graph card — these controls put that link one tap away. Native share
// sheet where the device has one; copy-link and post-on-X everywhere.

/** Share copy for the current point of the ascent — written to be
 * pasted whole into a post, so it must stand alone without the page. */
function shareText(selectedId: string | null, mode: "cosmology" | "llm") {
  const sphere = selectedId ? getSphere(selectedId) : null;
  if (!sphere) {
    return mode === "llm"
      ? "The medieval universe and a transformer are the same shape. An interactive 3D tower of spheres — flip a toggle and it becomes an LLM, with the same boundary drawn at the top."
      : "The medieval universe as C.S. Lewis describes it — a 3D tower of spheres, Earth to the Empyrean, one above the other. Flip a toggle and it becomes a transformer.";
  }
  const rung = SPHERES.findIndex((s) => s.id === sphere.id) + 1;
  return mode === "llm"
    ? `${sphere.name} ↔ ${sphere.llmParallel.label}. Rung ${rung} of ${SPHERES.length} where the medieval cosmos and transformer architecture turn out to be the same tower.`
    : `${sphere.name} — rung ${rung} of ${SPHERES.length} in the medieval universe, rendered as Lewis describes it: hollow transparent globes, one above the other. Toggle it and the same tower is an LLM.`;
}

function useShareState() {
  const { selectedId, mode } = useScene();
  const url = selectedId
    ? rungUrl(selectedId, mode)
    : mode === "llm"
      ? `${SITE_URL}/?view=llm`
      : SITE_URL;
  return { url, text: shareText(selectedId, mode) };
}

function xIntentUrl(text: string, url: string) {
  const params = new URLSearchParams({ text, url });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

// Whether the device offers a native share sheet never changes within a
// session, but it is unknowable on the server — so it hydrates as false
// and resolves on the client, same pattern as reduced motion.
const subscribeNever = () => () => {};
const getCanNativeShare = () => typeof navigator.share === "function";
const getServerCanNativeShare = () => false;

/** Legacy-path copy for browsers that reject the async clipboard API
 * (non-secure contexts, denied permission). */
function copyViaTextarea(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  textarea.remove();
  return ok;
}

/** Copy-link button that flips to a confirmation, shared by both layouts. */
function CopyLinkButton({
  url,
  className,
}: {
  url: string;
  className: string;
}) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
        } catch {
          if (copyViaTextarea(url)) setCopied(true);
        }
      }}
      className={className}
    >
      {copied ? "Copied ✓" : "Copy link"}
    </button>
  );
}

/** Header variant: one "Share" button. Native share sheet when the
 * device has one; otherwise a small dropdown with the two actions. */
export function ShareMenu() {
  const { url, text } = useShareState();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          if (navigator.share) {
            navigator.share({ title: text, text, url }).catch(() => {});
          } else {
            setOpen((o) => !o);
          }
        }}
        title="Share this point of the ascent"
        className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
          open
            ? "bg-white/15 text-stone-100"
            : "text-stone-300 hover:bg-white/10"
        }`}
      >
        Share
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute top-full right-0 z-20 mt-2 w-40 rounded-lg border border-white/10 bg-black/80 p-1 backdrop-blur-md"
        >
          <CopyLinkButton
            url={url}
            className="block w-full rounded-md px-3 py-1.5 text-left text-xs text-stone-200 transition hover:bg-white/10"
          />
          <a
            href={xIntentUrl(text, url)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="block w-full rounded-md px-3 py-1.5 text-left text-xs text-stone-200 transition hover:bg-white/10"
          >
            Post on 𝕏
          </a>
        </div>
      ) : null}
    </div>
  );
}

/** Info-panel variant: the actions laid out inline, so the exact rung
 * being read is shareable without leaving the panel. */
export function ShareRow() {
  const { selectedId } = useScene();
  const { url, text } = useShareState();
  const canNativeShare = useSyncExternalStore(
    subscribeNever,
    getCanNativeShare,
    getServerCanNativeShare,
  );

  const atSummit =
    selectedId !== null &&
    SPHERES.findIndex((s) => s.id === selectedId) === SPHERES.length - 1;

  const actionClass =
    "rounded-md border border-white/10 px-2.5 py-1 text-[11px] text-stone-300 transition hover:bg-white/10";

  return (
    <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
      <span className="text-[10px] tracking-wide text-stone-500 uppercase">
        {atSummit ? "Share the ascent" : "Share this rung"}
      </span>
      <div className="flex items-center gap-1.5">
        {canNativeShare ? (
          <button
            type="button"
            onClick={() =>
              navigator.share({ title: text, text, url }).catch(() => {})
            }
            className={actionClass}
          >
            Share…
          </button>
        ) : null}
        <CopyLinkButton url={url} className={actionClass} />
        <a
          href={xIntentUrl(text, url)}
          target="_blank"
          rel="noopener noreferrer"
          className={actionClass}
        >
          𝕏
        </a>
      </div>
    </div>
  );
}

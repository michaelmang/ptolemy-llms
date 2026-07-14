// Procedural equirectangular textures for the celestial bodies, drawn on
// a canvas at load time. Everything is seeded and deterministic, so the
// same cosmos appears on every visit — fitting, for a model in which the
// heavens are fixed.

import { CanvasTexture, SRGBColorSpace } from "three";

const WIDTH = 512;
const HEIGHT = 256;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

type Ctx = CanvasRenderingContext2D;
type Rand = () => number;

function drawSplotches(
  ctx: Ctx,
  rand: Rand,
  colors: string[],
  count: number,
  minR: number,
  maxR: number,
  alpha: number,
) {
  for (let i = 0; i < count; i++) {
    const x = rand() * WIDTH;
    const y = rand() * HEIGHT;
    const rx = minR + rand() * (maxR - minR);
    const ry = rx * (0.5 + rand() * 0.7);
    ctx.globalAlpha = alpha * (0.6 + rand() * 0.4);
    ctx.fillStyle = colors[Math.floor(rand() * colors.length)];
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
    // wrap horizontally so the seam is invisible
    ctx.beginPath();
    ctx.ellipse(x - WIDTH, y, rx, ry, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + WIDTH, y, rx, ry, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawBands(ctx: Ctx, rand: Rand, colors: string[]) {
  let y = 0;
  let i = 0;
  while (y < HEIGHT) {
    const h = 10 + rand() * 26;
    ctx.fillStyle = colors[i % colors.length];
    ctx.globalAlpha = 0.75 + rand() * 0.25;
    ctx.fillRect(0, y, WIDTH, h + 2);
    y += h;
    i++;
  }
  ctx.globalAlpha = 1;
  // streaks blur the band edges into each other
  for (let s = 0; s < 90; s++) {
    const sy = rand() * HEIGHT;
    ctx.globalAlpha = 0.05 + rand() * 0.06;
    ctx.fillStyle = rand() > 0.5 ? "#ffffff" : "#000000";
    ctx.fillRect(0, sy, WIDTH, 1 + rand() * 3);
  }
  ctx.globalAlpha = 1;
}

function drawPolarCaps(ctx: Ctx, color: string, size: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, color);
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WIDTH, size);
  const grad2 = ctx.createLinearGradient(0, HEIGHT, 0, HEIGHT - size);
  grad2.addColorStop(0, color);
  grad2.addColorStop(1, "transparent");
  ctx.fillStyle = grad2;
  ctx.fillRect(0, HEIGHT - size, WIDTH, size);
}

function paint(id: string, ctx: Ctx, rand: Rand) {
  switch (id) {
    case "earth":
      ctx.fillStyle = "#33517c";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      drawSplotches(
        ctx,
        rand,
        ["#4a6b3a", "#5d7a44", "#7a6b4a"],
        9,
        30,
        75,
        0.9,
      );
      drawSplotches(ctx, rand, ["#ffffff"], 26, 8, 30, 0.16);
      drawPolarCaps(ctx, "#e8eef5", 22);
      break;
    case "moon":
      ctx.fillStyle = "#c9c9d1";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      drawSplotches(
        ctx,
        rand,
        ["#a9a9b3", "#8f8f99", "#b8b8c2"],
        46,
        5,
        30,
        0.5,
      );
      break;
    case "mercury":
      ctx.fillStyle = "#a79c94";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      drawSplotches(
        ctx,
        rand,
        ["#8a7f75", "#6e655c", "#bcb1a7"],
        40,
        4,
        24,
        0.5,
      );
      break;
    case "venus":
      ctx.fillStyle = "#e8d3a0";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      drawBands(ctx, rand, ["#e8d3a0", "#dfc389", "#f0e0b5", "#d8bc7e"]);
      drawSplotches(ctx, rand, ["#f4e6c0"], 14, 20, 60, 0.25);
      break;
    case "sun":
      ctx.fillStyle = "#ffc94f";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      drawSplotches(
        ctx,
        rand,
        ["#ffdd88", "#ff9c2e", "#ffb347"],
        110,
        3,
        14,
        0.4,
      );
      break;
    case "mars":
      ctx.fillStyle = "#c1440e";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      drawSplotches(
        ctx,
        rand,
        ["#8f3410", "#d95c22", "#7a2d0e"],
        34,
        6,
        34,
        0.45,
      );
      drawPolarCaps(ctx, "#e8e0d8", 16);
      break;
    case "jupiter":
      drawBands(ctx, rand, [
        "#d9a066",
        "#b97c45",
        "#e6c08c",
        "#c28a52",
        "#a86c3c",
        "#e0b077",
      ]);
      // the great red spot
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = "#b04a2a";
      ctx.beginPath();
      ctx.ellipse(WIDTH * 0.68, HEIGHT * 0.62, 34, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    case "saturn":
      drawBands(ctx, rand, ["#e3c16f", "#d4b061", "#eccf88", "#c9a556"]);
      break;
    default:
      return false;
  }
  return true;
}

const cache = new Map<string, CanvasTexture | null>();

/** Returns a cached, procedurally painted texture for the given sphere
 * id, or null when unavailable (unknown id or non-browser context). */
export function getPlanetTexture(id: string): CanvasTexture | null {
  if (typeof document === "undefined") return null;
  if (cache.has(id)) return cache.get(id) ?? null;

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    cache.set(id, null);
    return null;
  }

  const rand = mulberry32(hashId(id));
  if (!paint(id, ctx, rand)) {
    cache.set(id, null);
    return null;
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  cache.set(id, texture);
  return texture;
}

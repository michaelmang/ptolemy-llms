"use client";

// Real 2K equirectangular texture maps for the celestial bodies, from
// Solar System Scope (https://www.solarsystemscope.com/textures/),
// CC BY 4.0 — credit them wherever these appear. Static imagery is just
// as fixed as the old seeded procedural textures: the same cosmos
// appears on every visit, fitting for a model in which the heavens are
// fixed — only now with the surface detail of the real heavens.

import { useTexture } from "@react-three/drei";
import { SRGBColorSpace, type Texture } from "three";

const TEXTURE_URL: Record<string, string> = {
  earth: "/textures/2k_earth_daymap.jpg",
  moon: "/textures/2k_moon.jpg",
  mercury: "/textures/2k_mercury.jpg",
  venus: "/textures/2k_venus_atmosphere.jpg",
  sun: "/textures/2k_sun.jpg",
  mars: "/textures/2k_mars.jpg",
  jupiter: "/textures/2k_jupiter.jpg",
  saturn: "/textures/2k_saturn.jpg",
};

export const EARTH_CLOUDS_URL = "/textures/2k_earth_clouds.jpg";
export const SATURN_RING_URL = "/textures/2k_saturn_ring_alpha.png";

const asColorMap = (texture: Texture | Texture[]) => {
  for (const t of Array.isArray(texture) ? texture : [texture]) {
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 8;
  }
};

/** The 2K surface map for a body; suspends while loading. */
export function usePlanetTexture(id: string): Texture {
  return useTexture(TEXTURE_URL[id] ?? TEXTURE_URL.earth, asColorMap);
}

/** Earth's cloud cover, used as an alpha map (linear, not sRGB). */
export function useEarthCloudsTexture(): Texture {
  return useTexture(EARTH_CLOUDS_URL, (t) => {
    (Array.isArray(t) ? t[0] : t).anisotropy = 8;
  });
}

/** Saturn's rings — a radial strip with alpha. */
export function useSaturnRingTexture(): Texture {
  return useTexture(SATURN_RING_URL, asColorMap);
}

// Warm the cache as soon as the module loads, so the tower doesn't pop
// in body by body.
Object.values(TEXTURE_URL).forEach((url) => useTexture.preload(url));
useTexture.preload(EARTH_CLOUDS_URL);
useTexture.preload(SATURN_RING_URL);

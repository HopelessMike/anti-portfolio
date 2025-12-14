import type { ThemeType } from "@/lib/user-data"

export type TextureVariant = "craters" | "bands" | "ice" | "nebula" | "tech-grid" | "lava"

export interface PlanetAppearance {
  variant: TextureVariant
  hasRing: boolean
  ringTiltDeg: number
  hueShiftDeg: number
}

function hashString(input: string): number {
  let h = 5381
  for (let i = 0; i < input.length; i++) h = (h * 33) ^ input.charCodeAt(i)
  return Math.abs(h >>> 0)
}

export function getPlanetAppearance(seedKey: string): PlanetAppearance {
  const h = hashString(seedKey)
  const variants: TextureVariant[] = ["craters", "bands", "ice", "nebula", "tech-grid", "lava"]
  const variant = variants[h % variants.length]
  const hasRing = (h % 7) === 0 || (h % 11) === 0
  const ringTiltDeg = (h % 40) - 20 // -20..+19
  const hueShiftDeg = (h % 30) - 15 // -15..+14
  return { variant, hasRing, ringTiltDeg, hueShiftDeg }
}

export function buildPlanetBackground(opts: {
  base: string
  accent: string
  variant: TextureVariant
  hueShiftDeg?: number
}) {
  const hue = opts.hueShiftDeg ? `hue-rotate(${opts.hueShiftDeg}deg)` : "none"
  const base = opts.base
  const accent = opts.accent

  // Multiple layered gradients = cheap procedural texture.
  const texture =
    opts.variant === "craters"
      ? `
        radial-gradient(circle at 30% 30%, ${base}ff 0%, ${accent}ff 55%, ${base}aa 100%),
        radial-gradient(circle at 70% 35%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.00) 38%),
        radial-gradient(circle at 40% 75%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.00) 45%),
        radial-gradient(circle at 75% 75%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.00) 40%)
      `
      : opts.variant === "bands"
        ? `
        radial-gradient(circle at 30% 30%, ${base}ff 0%, ${accent}ff 55%, ${base}aa 100%),
        repeating-linear-gradient(
          12deg,
          rgba(255,255,255,0.12) 0px,
          rgba(255,255,255,0.12) 6px,
          rgba(0,0,0,0.0) 6px,
          rgba(0,0,0,0.0) 14px
        )
      `
        : opts.variant === "ice"
          ? `
        radial-gradient(circle at 35% 30%, ${base}ff 0%, ${accent}ff 55%, ${base}aa 100%),
        repeating-radial-gradient(
          circle at 60% 40%,
          rgba(255,255,255,0.18) 0px,
          rgba(255,255,255,0.18) 2px,
          rgba(255,255,255,0.0) 2px,
          rgba(255,255,255,0.0) 7px
        )
      `
          : opts.variant === "tech-grid"
            ? `
        radial-gradient(circle at 30% 30%, ${base}ff 0%, ${accent}ff 55%, ${base}aa 100%),
        linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.10) 1px, transparent 1px)
      `
            : opts.variant === "lava"
              ? `
        radial-gradient(circle at 30% 30%, ${base}ff 0%, ${accent}ff 55%, ${base}aa 100%),
        conic-gradient(
          from 120deg,
          rgba(255,255,255,0.00),
          rgba(255,180,0,0.18),
          rgba(255,255,255,0.00),
          rgba(255,80,0,0.18),
          rgba(255,255,255,0.00)
        )
      `
              : `
        radial-gradient(circle at 30% 30%, ${base}ff 0%, ${accent}ff 55%, ${base}aa 100%),
        radial-gradient(circle at 60% 50%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.00) 55%),
        conic-gradient(from 240deg, rgba(255,255,255,0.00), rgba(255,255,255,0.12), rgba(255,255,255,0.00))
      `

  // Tech grid needs sizing; apply via background-size.
  const backgroundSize =
    opts.variant === "tech-grid" ? "auto, 10px 10px, 10px 10px" : "auto"

  return {
    backgroundImage: texture,
    filter: hue,
    backgroundSize,
    backgroundBlendMode: opts.variant === "tech-grid" ? ("normal, overlay, overlay" as const) : ("normal" as const),
  }
}

export function getAccentForFailure(theme: ThemeType) {
  // Keep "anomaly" purple-ish but slightly tied to theme.
  return theme === "tech"
    ? { base: "#a855f7", accent: "#7c3aed" }
    : theme === "design"
      ? { base: "#ec4899", accent: "#a855f7" }
      : { base: "#f97316", accent: "#a855f7" }
}



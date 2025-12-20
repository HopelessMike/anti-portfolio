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

export type PlanetKind = "skill" | "lesson" | "social"

export function hashSeed(seedKey: string): number {
  return hashString(seedKey)
}

export function getDeterministicPalette(seedKey: string) {
  // Curated, “cinematic” palette pairs. Intentionally cross-theme to avoid monotony.
  // Deterministic mapping: same seedKey => same palette.
  const palettes = [
    { base: "#22d3ee", accent: "#0891b2" }, // cyan
    { base: "#d946ef", accent: "#a21caf" }, // magenta
    { base: "#facc15", accent: "#ca8a04" }, // gold
    { base: "#10b981", accent: "#059669" }, // emerald
    { base: "#fb7185", accent: "#e11d48" }, // rose
    { base: "#60a5fa", accent: "#2563eb" }, // blue
    { base: "#a78bfa", accent: "#7c3aed" }, // violet
    { base: "#f97316", accent: "#ea580c" }, // orange
    { base: "#84cc16", accent: "#4d7c0f" }, // lime
    { base: "#38bdf8", accent: "#0ea5e9" }, // sky
    { base: "#f472b6", accent: "#db2777" }, // pink
    { base: "#c084fc", accent: "#9333ea" }, // purple
    { base: "#34d399", accent: "#047857" }, // teal-green
    { base: "#fde047", accent: "#f59e0b" }, // warm yellow
    { base: "#818cf8", accent: "#4f46e5" }, // indigo
    { base: "#fb923c", accent: "#c2410c" }, // amber-orange
    { base: "#2dd4bf", accent: "#0f766e" }, // teal
    { base: "#f43f5e", accent: "#be123c" }, // red-rose
  ] as const

  const h = hashString(seedKey)
  const pick = palettes[h % palettes.length]
  const swap = (h % 9) === 0
  const base = swap ? pick.accent : pick.base
  const accent = swap ? pick.base : pick.accent
  const glow = `${base}66`
  return { base, accent, glow }
}

function seeded01(seed: number, shiftBits: number) {
  // Deterministic pseudo-random in [0,1]
  const v = (seed >>> shiftBits) % 1000
  return v / 999
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

export function getPlanetAppearanceForKind(kind: PlanetKind, seedKey: string): PlanetAppearance {
  const h = hashString(seedKey)
  const hasRing = (h % 7) === 0 || (h % 11) === 0
  const ringTiltDeg = (h % 40) - 20 // -20..+19

  // Wider hue variance for skills to avoid “same-color planets” when all skills share the same theme/type.
  // Push it further than theme colors (still deterministic) to make the system feel more dynamic.
  const hueShiftDeg = kind === "skill" ? (h % 240) - 120 : (h % 30) - 15

  // Bias skill planets towards “bands” (gas-giant vibe) while keeping variety.
  const roll = h % 100
  const variant: TextureVariant =
    kind === "skill"
      ? roll < 48
        ? "bands"
        : roll < 63
          ? "craters"
          : roll < 76
            ? "nebula"
            : roll < 90
              ? "lava"
              : "ice"
      : (["craters", "bands", "ice", "nebula", "tech-grid", "lava"] as const)[h % 6]

  return { variant, hasRing, ringTiltDeg, hueShiftDeg }
}

export function buildPlanetBackground(opts: {
  base: string
  accent: string
  variant: TextureVariant
  hueShiftDeg?: number
  seedKey?: string
  detail?: "low" | "high"
}) {
  const hue = opts.hueShiftDeg ? `hue-rotate(${opts.hueShiftDeg}deg)` : "none"
  const base = opts.base
  const accent = opts.accent
  const detail = opts.detail ?? "low"

  const seed = opts.seedKey ? hashString(opts.seedKey) : 0
  const lx = detail === "high" ? 18 + seeded01(seed, 0) * 42 : 30
  const ly = detail === "high" ? 18 + seeded01(seed, 10) * 42 : 30
  const sx = detail === "high" ? 20 + seeded01(seed, 20) * 60 : 70
  const sy = detail === "high" ? 16 + seeded01(seed, 6) * 62 : 35
  const bandAngle = detail === "high" ? -18 + seeded01(seed, 14) * 36 : 12
  const bandA = 5 + Math.floor(seeded01(seed, 4) * 7) // 5..11
  const bandB = bandA + 10 + Math.floor(seeded01(seed, 16) * 10) // ~15..31

  const coreLayer = `radial-gradient(circle at ${lx}% ${ly}%, ${base}ff 0%, ${accent}ff 55%, ${base}aa 100%)`
  const highlightLayer =
    detail === "high"
      ? `radial-gradient(circle at ${lx}% ${ly}%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.00) 55%)`
      : `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.00) 38%)`
  const terminatorLayer =
    detail === "high"
      ? `radial-gradient(circle at ${Math.max(8, 100 - lx)}% ${Math.min(92, 100 - ly)}%, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.00) 62%)`
      : `radial-gradient(circle at 40% 75%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.00) 45%)`

  // Multiple layered gradients = cheap procedural texture.
  const texture =
    opts.variant === "craters"
      ? `
        ${coreLayer},
        ${highlightLayer},
        ${terminatorLayer},
        radial-gradient(circle at ${sx}% ${sy}%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.00) 44%),
        radial-gradient(circle at ${Math.min(88, sx + 18)}% ${Math.min(88, sy + 30)}%, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.00) 48%)
      `
      : opts.variant === "bands"
        ? `
        ${coreLayer},
        repeating-linear-gradient(
          ${bandAngle}deg,
          rgba(255,255,255,0.14) 0px,
          rgba(255,255,255,0.14) ${bandA}px,
          rgba(0,0,0,0.0) ${bandA}px,
          rgba(0,0,0,0.0) ${bandB}px
        ),
        repeating-linear-gradient(
          ${bandAngle + 8}deg,
          rgba(0,0,0,0.10) 0px,
          rgba(0,0,0,0.10) ${Math.max(4, Math.floor(bandA * 0.7))}px,
          rgba(0,0,0,0.0) ${Math.max(4, Math.floor(bandA * 0.7))}px,
          rgba(0,0,0,0.0) ${Math.max(10, Math.floor(bandB * 0.85))}px
        ),
        ${highlightLayer},
        ${terminatorLayer},
        radial-gradient(circle at ${sx}% ${sy}%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.00) 55%)
      `
        : opts.variant === "ice"
          ? `
        ${coreLayer},
        repeating-radial-gradient(
          circle at ${sx}% ${sy}%,
          rgba(255,255,255,0.20) 0px,
          rgba(255,255,255,0.20) 2px,
          rgba(255,255,255,0.0) 2px,
          rgba(255,255,255,0.0) ${6 + Math.floor(seeded01(seed, 8) * 5)}px
        ),
        ${highlightLayer},
        ${terminatorLayer}
      `
          : opts.variant === "tech-grid"
            ? `
        ${coreLayer},
        linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.10) 1px, transparent 1px),
        ${highlightLayer},
        ${terminatorLayer}
      `
            : opts.variant === "lava"
              ? `
        ${coreLayer},
        conic-gradient(
          from 120deg,
          rgba(255,255,255,0.00),
          rgba(255,180,0,0.18),
          rgba(255,255,255,0.00),
          rgba(255,80,0,0.18),
          rgba(255,255,255,0.00)
        ),
        ${highlightLayer},
        ${terminatorLayer}
      `
              : `
        ${coreLayer},
        ${highlightLayer},
        ${terminatorLayer},
        radial-gradient(circle at ${sx}% ${sy}%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.00) 58%),
        conic-gradient(from ${200 + Math.floor(seeded01(seed, 12) * 120)}deg, rgba(255,255,255,0.00), rgba(255,255,255,0.14), rgba(255,255,255,0.00))
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



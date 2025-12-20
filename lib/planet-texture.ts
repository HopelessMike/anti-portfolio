import { hashSeed } from "@/lib/planet-appearance"

export type PlanetTextureVariant = "gasBands" | "rockyCraters" | "ice" | "nebula" | "techGrid" | "lava"

const textureCache = new Map<string, string>()

function mulberry32(seed: number) {
  let a = seed >>> 0
  return function next() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v))
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "").trim()
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h
  const n = Number.parseInt(full, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      default:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  return { h, s, l }
}

function hslToRgb(h: number, s: number, l: number) {
  function hue2rgb(p: number, q: number, t: number) {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  let r: number, g: number, b: number
  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
}

function shiftHue(hex: string, hueShiftDeg: number, satBoost = 0.06, lightBoost = 0.02) {
  const { r, g, b } = hexToRgb(hex)
  const hsl = rgbToHsl(r, g, b)
  const h = (hsl.h + hueShiftDeg / 360 + 1) % 1
  const s = clamp01(hsl.s + satBoost)
  const l = clamp01(hsl.l + lightBoost)
  const rgb = hslToRgb(h, s, l)
  return `rgb(${rgb.r} ${rgb.g} ${rgb.b})`
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function mixRgb(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }, t: number) {
  return { r: Math.round(lerp(a.r, b.r, t)), g: Math.round(lerp(a.g, b.g, t)), b: Math.round(lerp(a.b, b.b, t)) }
}

function rgbaStr(c: { r: number; g: number; b: number }, a: number) {
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`
}

function makeCanvas(size: number): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  return canvas
}

function drawGrain(ctx: CanvasRenderingContext2D, size: number, rng: () => number, strength = 0.085) {
  const img = ctx.getImageData(0, 0, size, size)
  const data = img.data
  for (let i = 0; i < data.length; i += 4) {
    const n = (rng() - 0.5) * 255 * strength
    data[i] = clamp01((data[i] + n) / 255) * 255
    data[i + 1] = clamp01((data[i + 1] + n) / 255) * 255
    data[i + 2] = clamp01((data[i + 2] + n) / 255) * 255
  }
  ctx.putImageData(img, 0, 0)
}

function drawGasBands(ctx: CanvasRenderingContext2D, size: number, rng: () => number, base: string, accent: string) {
  const baseRgb = hexToRgb(base)
  const accentRgb = hexToRgb(accent)
  const angle = (-20 + rng() * 40) * (Math.PI / 180)
  const freq = 6 + Math.floor(rng() * 6) // 6..11
  const phase = rng() * Math.PI * 2

  ctx.save()
  ctx.translate(size / 2, size / 2)
  ctx.rotate(angle)
  ctx.translate(-size / 2, -size / 2)

  for (let y = 0; y < size; y++) {
    const t = y / size
    const w = Math.sin(t * Math.PI * 2 * freq + phase) * 0.45 + Math.sin(t * Math.PI * 2 * (freq * 0.5) + phase * 0.7) * 0.18
    const jitter = (rng() - 0.5) * 0.08
    const v = clamp01(0.5 + w + jitter)
    const col = mixRgb(baseRgb, accentRgb, v)
    ctx.fillStyle = rgbaStr(col, 0.85)
    ctx.fillRect(0, y, size, 1)
  }

  // Storm spots
  const storms = 4 + Math.floor(rng() * 4)
  for (let i = 0; i < storms; i++) {
    const x = size * (0.15 + rng() * 0.7)
    const y = size * (0.15 + rng() * 0.7)
    const r = size * (0.06 + rng() * 0.14)
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, "rgba(255,255,255,0.12)")
    g.addColorStop(0.35, "rgba(255,255,255,0.06)")
    g.addColorStop(1, "rgba(255,255,255,0)")
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

function drawRocky(ctx: CanvasRenderingContext2D, size: number, rng: () => number) {
  // Craters
  const craters = 6 + Math.floor(rng() * 8)
  for (let i = 0; i < craters; i++) {
    const x = size * (0.12 + rng() * 0.76)
    const y = size * (0.12 + rng() * 0.76)
    const r = size * (0.045 + rng() * 0.12)
    const g = ctx.createRadialGradient(x - r * 0.15, y - r * 0.15, 0, x, y, r)
    g.addColorStop(0, "rgba(0,0,0,0.22)")
    g.addColorStop(0.55, "rgba(0,0,0,0.10)")
    g.addColorStop(0.72, "rgba(255,255,255,0.08)")
    g.addColorStop(1, "rgba(255,255,255,0)")
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // Micro speckles
  const dots = 220 + Math.floor(rng() * 180)
  for (let i = 0; i < dots; i++) {
    const x = rng() * size
    const y = rng() * size
    const r = 0.4 + rng() * 1.1
    ctx.fillStyle = rng() > 0.5 ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)"
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawIce(ctx: CanvasRenderingContext2D, size: number, rng: () => number) {
  const veins = 14 + Math.floor(rng() * 12)
  ctx.save()
  ctx.globalAlpha = 0.16
  ctx.lineWidth = 1.2
  ctx.strokeStyle = "rgba(255,255,255,0.9)"
  for (let i = 0; i < veins; i++) {
    let x = rng() * size
    let y = rng() * size
    ctx.beginPath()
    ctx.moveTo(x, y)
    const steps = 6 + Math.floor(rng() * 10)
    for (let s = 0; s < steps; s++) {
      x += (rng() - 0.5) * (size * 0.12)
      y += (rng() - 0.5) * (size * 0.12)
      ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  ctx.restore()
}

function drawNebula(ctx: CanvasRenderingContext2D, size: number, rng: () => number) {
  const swirls = 4 + Math.floor(rng() * 5)
  for (let i = 0; i < swirls; i++) {
    const x = size * (0.1 + rng() * 0.8)
    const y = size * (0.1 + rng() * 0.8)
    const r = size * (0.2 + rng() * 0.35)
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, "rgba(255,255,255,0.10)")
    g.addColorStop(0.4, "rgba(255,255,255,0.06)")
    g.addColorStop(1, "rgba(255,255,255,0)")
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawTechGrid(ctx: CanvasRenderingContext2D, size: number, rng: () => number) {
  const step = 8 + Math.floor(rng() * 8)
  ctx.save()
  ctx.globalAlpha = 0.18
  ctx.strokeStyle = "rgba(255,255,255,0.7)"
  ctx.lineWidth = 1
  for (let x = 0; x <= size; x += step) {
    ctx.beginPath()
    ctx.moveTo(x + 0.5, 0)
    ctx.lineTo(x + 0.5, size)
    ctx.stroke()
  }
  for (let y = 0; y <= size; y += step) {
    ctx.beginPath()
    ctx.moveTo(0, y + 0.5)
    ctx.lineTo(size, y + 0.5)
    ctx.stroke()
  }
  ctx.restore()
}

function drawLava(ctx: CanvasRenderingContext2D, size: number, rng: () => number) {
  // Crack-like blobs
  const blobs = 10 + Math.floor(rng() * 10)
  for (let i = 0; i < blobs; i++) {
    const x = size * (0.1 + rng() * 0.8)
    const y = size * (0.1 + rng() * 0.8)
    const r = size * (0.06 + rng() * 0.22)
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, "rgba(255,190,70,0.22)")
    g.addColorStop(0.35, "rgba(255,120,30,0.16)")
    g.addColorStop(1, "rgba(0,0,0,0)")
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

export function getPlanetTextureCacheKey(opts: {
  seedKey: string
  size: number
  base: string
  accent: string
  variant: PlanetTextureVariant
  hueShiftDeg?: number
}) {
  return `${opts.seedKey}|${opts.size}|${opts.base}|${opts.accent}|${opts.variant}|${opts.hueShiftDeg ?? 0}`
}

export function generatePlanetTextureSync(opts: {
  seedKey: string
  size: number
  base: string
  accent: string
  variant: PlanetTextureVariant
  hueShiftDeg?: number
}) {
  const key = getPlanetTextureCacheKey(opts)
  const cached = textureCache.get(key)
  if (cached) return cached

  const canvas = makeCanvas(opts.size)
  if (!canvas) return null
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  const seed = hashSeed(`${opts.seedKey}|tex|${opts.variant}|${opts.size}`)
  const rng = mulberry32(seed)

  // Stylized-but-credible palette shifts.
  const baseShifted = shiftHue(opts.base, opts.hueShiftDeg ?? 0, 0.08, 0.01)
  const accentShifted = shiftHue(opts.accent, (opts.hueShiftDeg ?? 0) * 0.85, 0.10, 0.0)

  // Base “albedo”
  const g = ctx.createRadialGradient(opts.size * 0.28, opts.size * 0.26, 0, opts.size * 0.55, opts.size * 0.6, opts.size * 0.85)
  g.addColorStop(0, baseShifted)
  g.addColorStop(0.55, accentShifted)
  g.addColorStop(1, "rgba(0,0,0,0.22)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, opts.size, opts.size)

  // Variant overlays
  if (opts.variant === "gasBands") drawGasBands(ctx, opts.size, rng, opts.base, opts.accent)
  else if (opts.variant === "rockyCraters") drawRocky(ctx, opts.size, rng)
  else if (opts.variant === "ice") drawIce(ctx, opts.size, rng)
  else if (opts.variant === "nebula") drawNebula(ctx, opts.size, rng)
  else if (opts.variant === "techGrid") drawTechGrid(ctx, opts.size, rng)
  else drawLava(ctx, opts.size, rng)

  // Grain helps a lot at small sizes.
  drawGrain(ctx, opts.size, rng, 0.07)

  const url = canvas.toDataURL("image/png")
  textureCache.set(key, url)
  return url
}



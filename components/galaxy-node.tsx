"use client"

import { motion } from "framer-motion"
import { AlertTriangle, Link as LinkIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { ThemeType } from "@/lib/user-data"
import { planetColors, themeColors } from "@/lib/user-data"
import { buildPlanetBackground, getPlanetAppearanceForKind } from "@/lib/planet-appearance"
import { generatePlanetTextureSync, type PlanetTextureVariant } from "@/lib/planet-texture"

type NodeKind = "skill" | "lesson" | "social"

export function GalaxyNode({
  kind,
  label,
  hoverInfo,
  theme,
  palette,
  showGlyph = true,
  dataKey,
  x,
  y,
  size,
  isSelected,
  isHovered,
  onHoverStart,
  onHoverEnd,
  onClick,
  isSystemHovered,
}: {
  kind: NodeKind
  label: string
  hoverInfo: string
  theme: ThemeType
  palette?: { base: string; accent: string; glow?: string }
  showGlyph?: boolean
  dataKey: string
  x: number
  y: number
  size: number
  isSelected: boolean
  isHovered: boolean
  onHoverStart: () => void
  onHoverEnd: () => void
  onClick: () => void
  isSystemHovered: boolean
}) {
  const appearance = getPlanetAppearanceForKind(kind, dataKey)
  const colors =
    kind === "lesson"
      ? planetColors.lesson
      : kind === "social"
        ? planetColors.social.portfolio // default; we tint by theme below
        : planetColors.skill[theme]

  const base = palette?.base ?? (kind === "social" ? themeColors[theme].primary : colors.base)
  const accent = palette?.accent ?? (kind === "social" ? themeColors[theme].secondary : colors.accent)
  const glow = palette?.glow ?? (kind === "social" ? `${themeColors[theme].primary}66` : colors.glow)

  const [textureUrl, setTextureUrl] = useState<string | null>(null)

  const textureVariant: PlanetTextureVariant =
    appearance.variant === "bands"
      ? "gasBands"
      : appearance.variant === "craters"
        ? "rockyCraters"
        : appearance.variant === "ice"
          ? "ice"
          : appearance.variant === "tech-grid"
            ? "techGrid"
            : appearance.variant === "lava"
              ? "lava"
              : "nebula"

  const texSize = size < 44 ? 128 : size < 72 ? 192 : 256

  const texture = buildPlanetBackground({
    base,
    accent,
    variant:
      kind === "lesson"
        ? appearance.variant === "ice"
          ? "craters"
          : appearance.variant
        : kind === "social"
          ? appearance.variant === "tech-grid"
            ? "tech-grid"
            : appearance.variant
          : appearance.variant,
    hueShiftDeg: appearance.hueShiftDeg,
    seedKey: dataKey,
    detail: kind === "skill" ? "high" : "low",
  })

  const textureFallback = useMemo(() => texture, [texture])

  useEffect(() => {
    if (kind !== "skill") return
    let cancelled = false

    const run = () => {
      const url = generatePlanetTextureSync({
        seedKey: dataKey,
        size: texSize,
        base,
        accent,
        variant: textureVariant,
        hueShiftDeg: appearance.hueShiftDeg,
      })
      if (!cancelled) setTextureUrl(url)
    }

    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number
      cancelIdleCallback?: (id: number) => void
    }

    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(run, { timeout: 250 })
      return () => {
        cancelled = true
        w.cancelIdleCallback?.(id)
      }
    }

    const t = window.setTimeout(run, 0)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [accent, appearance.hueShiftDeg, base, dataKey, kind, texSize, textureVariant])

  const dimOthers = isSystemHovered && !isHovered && !isSelected

  return (
    <motion.div
      className="absolute"
      style={{ transform: `translate(${x}px, ${y}px)` }}
      animate={{
        x: [0, (appearance.hueShiftDeg || 0) * 0.15, 0],
        y: [0, (appearance.ringTiltDeg || 0) * 0.15, 0],
      }}
      transition={{
        duration: 6 + Math.abs((appearance.hueShiftDeg || 0) / 2),
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    >
      {/* Subtle orbit haze (non-interactive): keeps the cosmic vibe without looking like a clickable ring */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: size * 3.3,
          height: size * 3.3,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${base}00 35%, ${base}08 60%, ${base}00 80%)`,
          opacity: dimOthers ? 0.18 : 0.32,
          filter: "blur(1px)",
        }}
      />

      <motion.button
        type="button"
        className="relative rounded-full cursor-pointer"
        style={{
          width: size,
          height: size,
          ...(kind === "skill" && textureUrl
            ? {
                backgroundImage: `radial-gradient(circle at 28% 26%, ${base}ff 0%, ${accent}ff 55%, ${base}aa 100%)`,
              }
            : textureFallback),
          boxShadow:
            isSelected || isHovered
              ? `0 0 50px ${glow}, 0 0 110px ${glow}, inset 0 0 18px rgba(255,255,255,0.25)`
              : `0 0 18px ${glow}, inset 0 0 10px rgba(255,255,255,0.10)`,
          opacity: dimOthers ? 0.62 : 1,
        }}
        onClick={onClick}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        whileHover={{ scale: 1.22 }}
        whileTap={{ scale: 0.96 }}
      >
        {kind === "skill" && textureUrl && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              backgroundImage: `url(${textureUrl})`,
              backgroundSize: "cover",
              transform: "scale(1.22)",
              opacity: 0.98,
            }}
          />
        )}

        {/* Planet highlight */}
        <div
          className="absolute inset-0 rounded-full opacity-35 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35) 0%, transparent 48%)",
          }}
        />

        {/* Kind glyph: optional (avoid “icon buttons” feeling on planets/moons) */}
        {showGlyph && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {kind === "lesson" ? (
              <AlertTriangle className="w-1/2 h-1/2 text-white/70" />
            ) : kind === "social" ? (
              <LinkIcon className="w-1/2 h-1/2 text-white/70" />
            ) : null}
          </div>
        )}

        {/* Ring (rare, inside texture) */}
        {appearance.hasRing && kind === "skill" && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              transform: `rotate(${appearance.ringTiltDeg}deg)`,
              background:
                "radial-gradient(closest-side, transparent 58%, rgba(255,255,255,0.16) 60%, rgba(255,255,255,0.06) 66%, transparent 72%)",
              opacity: 0.65,
              mixBlendMode: "screen",
            }}
          />
        )}
      </motion.button>

      {/* Hover tooltip */}
      <motion.div
        className="absolute pointer-events-none z-50"
        style={{ left: "50%", top: "100%", marginTop: 12 }}
        initial={{ opacity: 0, y: -6, scale: 0.96 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : -6, scale: isHovered ? 1 : 0.96 }}
        transition={{ duration: 0.18 }}
      >
        <div
          className="px-4 py-2.5 rounded-xl backdrop-blur-md border text-center max-w-[280px] whitespace-normal break-words"
          style={{
            background: "rgba(0,0,0,0.86)",
            borderColor: base,
            transform: "translateX(-50%)",
            boxShadow: `0 0 22px ${glow}`,
          }}
        >
          <p className="font-mono text-sm font-bold" style={{ color: base }}>
            {label}
          </p>
          <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{hoverInfo}</p>
          <p className="text-[11px] text-white/40 mt-1">Click per aprire scheda</p>
        </div>
      </motion.div>
    </motion.div>
  )
}



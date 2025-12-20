"use client"

import { motion, useTransform } from "framer-motion"
import { useEffect, useMemo, useRef, useState } from "react"
import type { Skill } from "@/lib/user-data"
import { planetColors } from "@/lib/user-data"
import { buildPlanetBackground, getPlanetAppearanceForKind } from "@/lib/planet-appearance"
import { generatePlanetTextureSync, type PlanetTextureVariant } from "@/lib/planet-texture"
import { HoverTooltip } from "@/components/hover-tooltip"
import { useContinuousRotate } from "@/components/use-continuous-rotate"

interface PlanetNodeProps {
  skill: Skill
  onClick: () => void
  isSelected: boolean
  isHovered: boolean
  onHoverStart: () => void
  onHoverEnd: () => void
  isSystemHovered: boolean // Added to slow rotation on system hover
}

export function PlanetNode({
  skill,
  onClick,
  isSelected,
  isHovered,
  onHoverStart,
  onHoverEnd,
  isSystemHovered,
}: PlanetNodeProps) {
  const colors = planetColors.skill[skill.type]
  const size = 24 + (skill.relevance / 10) * 36
  const planetRef = useRef<HTMLDivElement>(null)
  const [textureUrl, setTextureUrl] = useState<string | null>(null)

  // Orbit speed is controlled via a MotionValue so it can change immediately on hover.
  // Keep slowdown noticeable but not “frozen”.
  const slowFactor = isSystemHovered ? 2 : 1
  const rotationDuration = skill.speed * slowFactor
  const orbitRotate = useContinuousRotate({ durationSec: rotationDuration, direction: 1 })
  // Counter-rotate the planet to cancel the orbit rotation (prevents “spinning on itself”).
  const selfRotate = useTransform(orbitRotate, (v) => -v)
  const isRingEmphasized = isSelected || isHovered
  // Orbit should always be slightly visible, and a bit more visible on hover/selection.
  const ringOpacity = isRingEmphasized ? 0.7 : 0.5
  const ringBorderColor = isRingEmphasized ? `${colors.base}55` : `${colors.base}26`
  // Deterministic “personality”: stable across export/import without touching the JSON schema.
  // Uses only existing fields: id + name + type.
  const seedKey = `skill:${skill.id}:${skill.name}:${skill.type}`
  const appearance = getPlanetAppearanceForKind("skill", seedKey)
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

  const textureFallback = useMemo(
    () =>
      buildPlanetBackground({
        base: colors.base,
        accent: colors.accent,
        variant: appearance.variant,
        hueShiftDeg: appearance.hueShiftDeg,
        seedKey,
        detail: "high",
      }),
    [appearance.hueShiftDeg, appearance.variant, colors.accent, colors.base, seedKey],
  )

  useEffect(() => {
    let cancelled = false

    const run = () => {
      const url = generatePlanetTextureSync({
        seedKey,
        size: texSize,
        base: colors.base,
        accent: colors.accent,
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
  }, [appearance.hueShiftDeg, colors.accent, colors.base, seedKey, texSize, textureVariant])

  // Internal spin speed: seeded-ish but stable per planet (still independent from orbit).
  const textureSpinDuration = 18 + ((skill.id * 13) % 22) // 18..39s

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: skill.orbitRadius * 2,
        height: skill.orbitRadius * 2,
        left: "50%",
        top: "50%",
        marginLeft: -skill.orbitRadius,
        marginTop: -skill.orbitRadius,
        zIndex: 20,
        rotate: orbitRotate,
      }}
    >
      {/* Orbit ring */}
      <div
        className="absolute inset-0 rounded-full border"
        style={{
          pointerEvents: "none",
          borderColor: ringBorderColor,
          opacity: ringOpacity,
        }}
      />

      {/* Planet */}
      <motion.div
        ref={planetRef}
        className="absolute rounded-full cursor-pointer pointer-events-auto overflow-hidden"
        style={{
          width: size,
          height: size,
          left: "50%",
          top: 0,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          rotate: selfRotate,
          ...(textureUrl
            ? {
                // Keep a base gradient under the rotating texture to avoid “double stamping” the same image.
                backgroundImage: `radial-gradient(circle at 28% 26%, ${colors.base}ff 0%, ${colors.accent}ff 55%, ${colors.base}aa 100%)`,
              }
            : textureFallback),
          boxShadow:
            isSelected || isHovered
              ? `0 0 40px ${colors.glow}, 0 0 80px ${colors.glow}, inset 0 0 20px rgba(255,255,255,0.3)`
              : `0 0 15px ${colors.glow}, inset 0 0 10px rgba(255,255,255,0.1)`,
        }}
        onClick={onClick}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        whileHover={{
          scale: 1.3,
        }}
        whileTap={{ scale: 0.95 }}
      >
        {/* If we have a generated texture, animate it “inside” to avoid the “static ball” feeling. */}
        {textureUrl && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              backgroundImage: `url(${textureUrl})`,
              backgroundSize: "cover",
              transform: "scale(1.22)",
              opacity: 0.98,
              mixBlendMode: "normal",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: textureSpinDuration, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
        )}

        {/* Shading: terminator (dark side) */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 25% 28%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.00) 55%), radial-gradient(circle at 78% 82%, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.00) 62%)",
            opacity: 0.95,
            mixBlendMode: "multiply",
          }}
        />

        {/* Rim light */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(closest-side, rgba(255,255,255,0.00) 62%, rgba(255,255,255,0.14) 74%, rgba(255,255,255,0.00) 86%)",
            opacity: 0.55,
            mixBlendMode: "screen",
          }}
        />

        {/* Optional ring (inside the planet body, not the orbit ring) */}
        {appearance.hasRing && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              transform: `rotate(${appearance.ringTiltDeg}deg)`,
              background:
                "radial-gradient(closest-side, transparent 58%, rgba(255,255,255,0.16) 60%, rgba(255,255,255,0.06) 66%, transparent 72%)",
              opacity: 0.7,
              mixBlendMode: "screen",
            }}
          />
        )}

        {/* Atmospheric glow */}
        <motion.div
          className="absolute -inset-1 rounded-full opacity-50"
          style={{
            background: `radial-gradient(circle, transparent 60%, ${colors.glow} 100%)`,
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
          }}
        />
      </motion.div>

      <HoverTooltip anchorRef={planetRef} open={isHovered} placement="bottom" offset={12} zIndex={80}>
        <div
          className="px-4 py-2.5 rounded-xl backdrop-blur-md border text-center max-w-[280px] whitespace-normal break-words"
          style={{
            background: "rgba(0,0,0,0.85)",
            borderColor: colors.base,
            boxShadow: `0 0 20px ${colors.glow}`,
          }}
        >
          <p className="font-mono text-sm font-bold" style={{ color: colors.base }}>
            {skill.name}
          </p>
          <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{skill.hoverInfo}</p>
        </div>
      </HoverTooltip>
    </motion.div>
  )
}

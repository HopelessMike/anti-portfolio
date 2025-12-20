"use client"

import { motion, useTransform } from "framer-motion"
import { useMemo, useRef } from "react"
import type { Skill } from "@/lib/user-data"
import { planetColors } from "@/lib/user-data"
import { buildPlanetBackground, getDeterministicPalette, getPlanetAppearanceForKind } from "@/lib/planet-appearance"
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
  const size = 24 + (skill.relevance / 10) * 36
  const planetRef = useRef<HTMLDivElement>(null)
  const initialOrbitOffsetDeg = useRef<number>(Math.random() * 360)

  // Orbit speed is controlled via a MotionValue so it can change immediately on hover.
  // Keep slowdown noticeable but not “frozen”.
  const slowFactor = isSystemHovered ? 2 : 1
  const rotationDuration = skill.speed * slowFactor
  const orbitRotate = useContinuousRotate({ durationSec: rotationDuration, direction: 1 })
  const orbitRotateWithOffset = useTransform(orbitRotate, (v) => v + initialOrbitOffsetDeg.current)
  // Counter-rotate the planet to cancel the orbit rotation (prevents “spinning on itself”).
  const selfRotate = useTransform(orbitRotate, (v) => -v)
  const isRingEmphasized = isSelected || isHovered
  // Orbit should always be slightly visible, and a bit more visible on hover/selection.
  const ringOpacity = isRingEmphasized ? 0.7 : 0.5
  // Deterministic “personality”: stable across export/import without touching the JSON schema.
  // Uses only existing fields: id + name + type.
  const seedKey = `skill:${skill.id}:${skill.name}:${skill.type}`
  const appearance = getPlanetAppearanceForKind("skill", seedKey)
  const palette = useMemo(() => getDeterministicPalette(seedKey), [seedKey])
  const ringBorderColor = isRingEmphasized ? `${palette.base}55` : `${palette.base}26`
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
        base: palette.base,
        accent: palette.accent,
        variant: appearance.variant,
        hueShiftDeg: appearance.hueShiftDeg,
        seedKey,
        detail: "high",
      }),
    [appearance.hueShiftDeg, appearance.variant, palette.accent, palette.base, seedKey],
  )

  // Generate immediately (cached) to avoid “spawn then change color/texture” pop-in.
  const textureUrl = useMemo(
    () =>
      generatePlanetTextureSync({
        seedKey,
        size: texSize,
        base: palette.base,
        accent: palette.accent,
        variant: textureVariant,
        hueShiftDeg: appearance.hueShiftDeg,
      }),
    [appearance.hueShiftDeg, palette.accent, palette.base, seedKey, texSize, textureVariant],
  )

  // No internal spin: skills must NOT rotate on themselves (only orbit rotation is allowed).

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
        zIndex: 12,
        rotate: orbitRotateWithOffset,
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
          // Always keep the same base (no switching) to avoid color “flash” at spawn.
          ...textureFallback,
          boxShadow:
            isSelected || isHovered
              ? `0 0 40px ${palette.glow}, 0 0 80px ${palette.glow}, inset 0 0 20px rgba(255,255,255,0.3)`
              : `0 0 15px ${palette.glow}, inset 0 0 10px rgba(255,255,255,0.1)`,
        }}
        onClick={onClick}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        whileHover={{
          scale: 1.3,
        }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Texture layer (static; no spin) */}
        {textureUrl && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              backgroundImage: `url(${textureUrl})`,
              backgroundSize: "cover",
              transform: "scale(1.22)",
              opacity: 0.98,
              mixBlendMode: "normal",
            }}
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
            background: `radial-gradient(circle, transparent 60%, ${palette.glow} 100%)`,
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
            borderColor: palette.base,
            boxShadow: `0 0 20px ${palette.glow}`,
          }}
        >
          <p className="font-mono text-sm font-bold" style={{ color: palette.base }}>
            {skill.name}
          </p>
          <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{skill.hoverInfo}</p>
        </div>
      </HoverTooltip>
    </motion.div>
  )
}

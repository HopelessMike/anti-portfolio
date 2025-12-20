"use client"

import { motion, useTransform } from "framer-motion"
import { AlertTriangle } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import type { LessonLearned } from "@/lib/user-data"
import { planetColors } from "@/lib/user-data"
import { buildPlanetBackground, getPlanetAppearance } from "@/lib/planet-appearance"
import { generatePlanetTextureSync, type PlanetTextureVariant } from "@/lib/planet-texture"
import { HoverTooltip } from "@/components/hover-tooltip"
import { useContinuousRotate } from "@/components/use-continuous-rotate"

interface LessonPlanetProps {
  lesson: LessonLearned
  onClick: () => void
  isSelected: boolean
  isHovered: boolean
  onHoverStart: () => void
  onHoverEnd: () => void
  isSystemHovered: boolean
}

export function LessonPlanet({
  lesson,
  onClick,
  isSelected,
  isHovered,
  onHoverStart,
  onHoverEnd,
  isSystemHovered,
}: LessonPlanetProps) {
  const colors = planetColors.lesson
  const seedKey = `lesson:${lesson.id}:${lesson.title}:${lesson.year}`
  const appearance = getPlanetAppearance(seedKey)
  const size = 22 + (lesson.relevance / 10) * 48
  const planetRef = useRef<HTMLDivElement>(null)
  const [textureUrl, setTextureUrl] = useState<string | null>(null)
  const texture = buildPlanetBackground({
    base: colors.base,
    accent: colors.accent,
    variant: appearance.variant === "ice" ? "craters" : appearance.variant,
    hueShiftDeg: appearance.hueShiftDeg,
    seedKey,
    detail: "high",
  })
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
  const textureFallback = useMemo(() => texture, [texture])

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

  // Slow down global orbit when any body is hovered (prevents hover loss while reading tooltip).
  const slowFactor = isSystemHovered ? 2 : 1
  const rotationDuration = lesson.speed * slowFactor
  const orbitRotate = useContinuousRotate({ durationSec: rotationDuration, direction: -1 })
  const selfRotate = useTransform(orbitRotate, (v) => -v)
  const isRingEmphasized = isSelected || isHovered
  const ringOpacity = isRingEmphasized ? 0.7 : 0.5
  const ringBorderColor = isRingEmphasized ? `${colors.base}55` : `${colors.base}26`

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: lesson.orbitRadius * 2,
        height: lesson.orbitRadius * 2,
        left: "50%",
        top: "50%",
        marginLeft: -lesson.orbitRadius,
        marginTop: -lesson.orbitRadius,
        zIndex: 20,
        rotate: orbitRotate,
      }}
    >
      {/* Orbit ring - danger dashed */}
      <div
        className="absolute inset-0 rounded-full border-2 border-dashed"
        style={{ pointerEvents: "none", borderColor: ringBorderColor, opacity: ringOpacity }}
      />

      {/* Planet with danger styling */}
      <motion.div
        ref={planetRef}
        className="absolute rounded-full cursor-pointer flex items-center justify-center pointer-events-auto overflow-hidden"
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
                backgroundImage: `radial-gradient(circle at 28% 26%, ${colors.base}ff 0%, ${colors.accent}ff 55%, ${colors.base}aa 100%)`,
              }
            : textureFallback),
          boxShadow:
            isSelected || isHovered ? `0 0 50px ${colors.glow}, 0 0 100px ${colors.glow}` : `0 0 20px ${colors.glow}`,
          opacity: 1,
        }}
        onClick={onClick}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        whileHover={{ scale: 1.3 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Texture layer (static, behind the icon) */}
        {textureUrl && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              backgroundImage: `url(${textureUrl})`,
              backgroundSize: "cover",
              transform: "scale(1.18)",
              opacity: 0.96,
            }}
          />
        )}

        {/* Shading to avoid flat look */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 25% 28%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.00) 55%), radial-gradient(circle at 78% 82%, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.00) 62%)",
            opacity: 0.95,
            mixBlendMode: "multiply",
          }}
        />

        {/* Icon backplate for readability over textured surface */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div
            className="rounded-full"
            style={{
              width: "58%",
              height: "58%",
              background: "radial-gradient(circle, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.00) 72%)",
              filter: "blur(0.2px)",
            }}
          />
        </div>

        <AlertTriangle className="w-1/2 h-1/2 text-white/95 relative z-30 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]" />

        {/* Pulsing ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-red-500/50 z-10"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
          }}
        />
      </motion.div>

      {/* Hover tooltip */}
      <HoverTooltip anchorRef={planetRef} open={isHovered} placement="bottom" offset={12} zIndex={80}>
        <div
          className="px-4 py-2.5 rounded-xl backdrop-blur-md border border-red-500/50 text-center max-w-[280px] whitespace-normal break-words"
          style={{
            background: "rgba(0,0,0,0.85)",
            boxShadow: `0 0 20px ${colors.glow}`,
          }}
        >
          <p className="font-mono text-sm font-bold text-red-400">{lesson.title}</p>
          <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{lesson.hoverInfo}</p>
          <p className="text-[11px] text-white/40 mt-1">Click per aprire scheda</p>
        </div>
      </HoverTooltip>
    </motion.div>
  )
}

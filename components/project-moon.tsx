"use client"

import { motion } from "framer-motion"
import { useRef } from "react"
import type { Project, ThemeType } from "@/lib/user-data"
import { themeColors } from "@/lib/user-data"
import { buildPlanetBackground, getPlanetAppearance } from "@/lib/planet-appearance"
import { HoverTooltip } from "@/components/hover-tooltip"
import { useContinuousRotate } from "@/components/use-continuous-rotate"

export function ProjectMoon({
  project,
  parentKey,
  index,
  theme,
  parentX,
  parentY,
  isSelected,
  isHovered,
  onHoverStart,
  onHoverEnd,
  onClick,
  isSystemHovered,
}: {
  project: Project
  parentKey: string
  index: number
  theme: ThemeType
  parentX: number
  parentY: number
  isSelected: boolean
  isHovered: boolean
  onHoverStart: () => void
  onHoverEnd: () => void
  onClick: () => void
  isSystemHovered: boolean
}) {
  const colors = themeColors[theme]
  const appearance = getPlanetAppearance(`project:${project.id}:${project.title}:${parentKey}`)

  // Make moons feel like moons: bigger, textured, no “icon button”.
  const size = 18 + Math.min(22, project.tags.length * 2.2)
  const orbitR = 44 + index * 18
  // Slow down when any body is hovered (prevents hover loss while reading tooltip).
  const slowFactor = isSystemHovered ? 2 : 1
  const duration = (12 + index * 3) * slowFactor
  const dimOthers = isSystemHovered && !isHovered && !isSelected
  const moonRef = useRef<HTMLButtonElement>(null)
  const orbitRotate = useContinuousRotate({ durationSec: duration, direction: 1 })

  const texture = buildPlanetBackground({
    base: colors.primary,
    accent: colors.secondary,
    variant: appearance.variant === "tech-grid" ? "tech-grid" : appearance.variant,
    hueShiftDeg: appearance.hueShiftDeg,
  })

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 pointer-events-none"
      style={{ transform: `translate(calc(-50% + ${parentX}px), calc(-50% + ${parentY}px))` }}
    >
      {/* Orbit path is intentionally subtle (so it doesn't look like a useless clickable ring) */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: orbitR * 2,
          height: orbitR * 2,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          border: `1px dashed ${colors.primary}0f`,
          opacity: dimOthers ? 0.25 : 0.45,
        }}
      />

      <motion.div
        className="absolute left-1/2 top-1/2"
        style={{ width: orbitR * 2, height: orbitR * 2, transform: "translate(-50%, -50%)", rotate: orbitRotate }}
      >
        <motion.button
          type="button"
          ref={moonRef}
          className="absolute rounded-full pointer-events-auto"
          style={{
            left: "50%",
            top: 0,
            width: size,
            height: size,
            marginLeft: -size / 2,
            marginTop: -size / 2,
            ...texture,
            boxShadow:
              isSelected || isHovered
                ? `0 0 28px ${colors.primary}70, 0 0 70px ${colors.secondary}30, inset 0 0 14px rgba(255,255,255,0.18)`
                : `0 0 16px ${colors.primary}45, inset 0 0 10px rgba(255,255,255,0.10)`,
            opacity: dimOthers ? 0.6 : 1,
          }}
          onClick={onClick}
          onMouseEnter={onHoverStart}
          onMouseLeave={onHoverEnd}
          whileHover={{ scale: 1.25 }}
          whileTap={{ scale: 0.96 }}
        >
          <div
            className="absolute inset-0 rounded-full opacity-40 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35) 0%, transparent 48%)",
            }}
          />
          {/* Crater-ish micro detail */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 62% 58%, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0) 22%), radial-gradient(circle at 38% 72%, rgba(0,0,0,0.16) 0%, rgba(0,0,0,0) 18%)",
              opacity: 0.55,
              mixBlendMode: "soft-light",
            }}
          />
        </motion.button>

        {/* Hover tooltip (screen-anchored) */}
        <HoverTooltip anchorRef={moonRef} open={isHovered} placement="bottom" offset={12} zIndex={80}>
          <div
            className="px-4 py-2.5 rounded-xl backdrop-blur-md border text-center max-w-[280px] whitespace-normal break-words"
            style={{
              background: "rgba(0,0,0,0.86)",
              borderColor: colors.primary,
              boxShadow: `0 0 22px ${colors.primary}44`,
            }}
          >
            <p className="font-mono text-sm font-bold" style={{ color: colors.primary }}>
              {project.title}
            </p>
            <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{project.outcome || project.description}</p>
            <p className="text-[11px] text-white/40 mt-1">Click per aprire scheda</p>
          </div>
        </HoverTooltip>
      </motion.div>
    </motion.div>
  )
}



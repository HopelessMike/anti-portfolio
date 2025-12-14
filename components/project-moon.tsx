"use client"

import { motion } from "framer-motion"
import type { Project, ThemeType } from "@/lib/user-data"
import { themeColors } from "@/lib/user-data"
import { buildPlanetBackground, getPlanetAppearance } from "@/lib/planet-appearance"

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
  const duration = isSystemHovered ? 22 + index * 4 : 12 + index * 3
  const dimOthers = isSystemHovered && !isHovered && !isSelected

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
        style={{ width: orbitR * 2, height: orbitR * 2, transform: "translate(-50%, -50%)" }}
        animate={{ rotate: 360 }}
        transition={{ duration, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        <motion.button
          type="button"
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

        {/* Hover tooltip */}
        <motion.div
          className="absolute pointer-events-none z-50"
          style={{ left: "50%", top: 0, marginTop: size / 2 + 12 }}
          initial={{ opacity: 0, y: -6, scale: 0.96 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : -6, scale: isHovered ? 1 : 0.96 }}
          transition={{ duration: 0.18 }}
        >
          <div
            className="px-4 py-2.5 rounded-xl backdrop-blur-md border whitespace-nowrap text-center"
            style={{
              background: "rgba(0,0,0,0.86)",
              borderColor: colors.primary,
              transform: "translateX(-50%)",
              boxShadow: `0 0 22px ${colors.primary}44`,
            }}
          >
            <p className="font-mono text-sm font-bold" style={{ color: colors.primary }}>
              {project.title}
            </p>
            <p className="text-xs text-white/60 mt-0.5">{project.outcome || project.description}</p>
            <p className="text-[11px] text-white/40 mt-1">Click per aprire scheda</p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}



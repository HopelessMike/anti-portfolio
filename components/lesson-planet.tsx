"use client"

import { motion } from "framer-motion"
import { AlertTriangle } from "lucide-react"
import { useRef } from "react"
import type { LessonLearned } from "@/lib/user-data"
import { planetColors } from "@/lib/user-data"
import { buildPlanetBackground, getPlanetAppearance } from "@/lib/planet-appearance"
import { HoverTooltip } from "@/components/hover-tooltip"

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
  const appearance = getPlanetAppearance(`lesson:${lesson.id}:${lesson.title}:${lesson.year}`)
  const size = 22 + (lesson.relevance / 10) * 48
  const planetRef = useRef<HTMLDivElement>(null)
  const texture = buildPlanetBackground({
    base: colors.base,
    accent: colors.accent,
    variant: appearance.variant === "ice" ? "craters" : appearance.variant,
    hueShiftDeg: appearance.hueShiftDeg,
  })

  const rotationDuration = isSystemHovered ? lesson.speed * 4 : lesson.speed
  const dimOthers = isSystemHovered && !isHovered && !isSelected
  const ringOpacity = isSelected || isHovered ? 0.6 : 0.14

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
      }}
      animate={{ rotate: -360 }}
      transition={{
        duration: rotationDuration,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      }}
    >
      {/* Orbit ring - danger dashed */}
      <div
        className="absolute inset-0 rounded-full border-2 border-dashed"
        style={{ pointerEvents: "none", borderColor: `${colors.base}33`, opacity: ringOpacity }}
      />

      {/* Planet with danger styling */}
      <motion.div
        ref={planetRef}
        className="absolute rounded-full cursor-pointer flex items-center justify-center pointer-events-auto"
        style={{
          width: size,
          height: size,
          left: "50%",
          top: 0,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          ...texture,
          boxShadow:
            isSelected || isHovered ? `0 0 50px ${colors.glow}, 0 0 100px ${colors.glow}` : `0 0 20px ${colors.glow}`,
          opacity: dimOthers ? 0.7 : 1,
        }}
        onClick={onClick}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        whileHover={{ scale: 1.3 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          rotate: 360,
        }}
        transition={{
          rotate: {
            duration: rotationDuration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          },
        }}
      >
        <AlertTriangle className="w-1/2 h-1/2 text-white/80" />

        {/* Pulsing ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-red-500/50"
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

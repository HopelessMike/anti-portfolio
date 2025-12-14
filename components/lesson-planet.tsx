"use client"

import { motion } from "framer-motion"
import { AlertTriangle } from "lucide-react"
import type { LessonLearned } from "@/lib/user-data"
import { planetColors } from "@/lib/user-data"
import { buildPlanetBackground, getPlanetAppearance } from "@/lib/planet-appearance"

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
  const texture = buildPlanetBackground({
    base: colors.base,
    accent: colors.accent,
    variant: appearance.variant === "ice" ? "craters" : appearance.variant,
    hueShiftDeg: appearance.hueShiftDeg,
  })

  const rotationDuration = isSystemHovered ? lesson.speed * 4 : lesson.speed
  const dimOthers = isSystemHovered && !isHovered && !isSelected

  return (
    <motion.div
      className="absolute"
      style={{
        width: lesson.orbitRadius * 2,
        height: lesson.orbitRadius * 2,
        left: "50%",
        top: "50%",
        marginLeft: -lesson.orbitRadius,
        marginTop: -lesson.orbitRadius,
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
        className="absolute inset-0 rounded-full border-2 border-dashed border-red-500/20"
        style={{ pointerEvents: "none" }}
      />

      {/* Planet with danger styling */}
      <motion.div
        className="absolute rounded-full cursor-pointer flex items-center justify-center"
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
      <motion.div
        className="absolute pointer-events-none z-50"
        style={{
          left: "50%",
          top: 0,
          marginTop: size / 2 + 12,
        }}
        initial={{ opacity: 0, y: -5, scale: 0.9 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          y: isHovered ? 0 : -5,
          scale: isHovered ? 1 : 0.9,
          rotate: 360,
        }}
        transition={{
          opacity: { duration: 0.2 },
          y: { duration: 0.2 },
          scale: { duration: 0.2 },
          rotate: {
            duration: rotationDuration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          },
        }}
      >
        <div
          className="px-4 py-2.5 rounded-xl backdrop-blur-md border border-red-500/50 whitespace-nowrap text-center"
          style={{
            background: "rgba(0,0,0,0.85)",
            transform: "translateX(-50%)",
            boxShadow: `0 0 20px ${colors.glow}`,
          }}
        >
          <p className="font-mono text-sm font-bold text-red-400">{lesson.title}</p>
          <p className="text-xs text-white/60 mt-0.5">{lesson.hoverInfo}</p>
          <p className="text-[11px] text-white/40 mt-1">Click per aprire scheda</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

"use client"

import { motion } from "framer-motion"
import type { Skill } from "@/lib/user-data"
import { planetColors } from "@/lib/user-data"

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

  const rotationDuration = isSystemHovered ? skill.speed * 4 : skill.speed
  const ringOpacity = isSelected || isHovered ? 0.55 : 0.12
  const texX = 30 + ((skill.id * 17) % 40)
  const texY = 28 + ((skill.id * 29) % 40)

  return (
    <motion.div
      className="absolute"
      style={{
        width: skill.orbitRadius * 2,
        height: skill.orbitRadius * 2,
        left: "50%",
        top: "50%",
        marginLeft: -skill.orbitRadius,
        marginTop: -skill.orbitRadius,
        zIndex: 20,
      }}
      animate={{ rotate: 360 }}
      transition={{
        duration: rotationDuration,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      }}
    >
      {/* Orbit ring */}
      <div
        className="absolute inset-0 rounded-full border"
        style={{
          pointerEvents: "none",
          borderColor: `${colors.base}22`,
          opacity: ringOpacity,
        }}
      />

      {/* Planet */}
      <motion.div
        className="absolute rounded-full cursor-pointer"
        style={{
          width: size,
          height: size,
          left: "50%",
          top: 0,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          background: `
            radial-gradient(circle at 30% 30%, ${colors.base}ff 0%, ${colors.accent}ff 50%, ${colors.base}aa 100%)
          `,
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
        animate={{
          rotate: -360,
        }}
        transition={{
          rotate: {
            duration: rotationDuration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          },
        }}
      >
        {/* Texture overlay */}
        <div
          className="absolute inset-0 rounded-full opacity-30"
          style={{
            background: `
              repeating-radial-gradient(
                circle at ${texX}% ${texY}%,
                transparent 0px,
                transparent 2px,
                rgba(255,255,255,0.1) 2px,
                rgba(255,255,255,0.1) 4px
              )
            `,
          }}
        />

        {/* Secondary micro-texture (subtle, gives variation) */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${Math.max(10, texY - 10)}% ${Math.min(90, texX + 15)}%, rgba(255,255,255,0.10) 0%, transparent 45%)`,
            opacity: 0.35,
            mixBlendMode: "overlay",
          }}
        />

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
          rotate: -360,
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
          className="px-4 py-2.5 rounded-xl backdrop-blur-md border whitespace-nowrap text-center"
          style={{
            background: "rgba(0,0,0,0.85)",
            borderColor: colors.base,
            transform: "translateX(-50%)",
            boxShadow: `0 0 20px ${colors.glow}`,
          }}
        >
          <p className="font-mono text-sm font-bold" style={{ color: colors.base }}>
            {skill.name}
          </p>
          <p className="text-xs text-white/60 mt-0.5">{skill.hoverInfo}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

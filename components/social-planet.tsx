"use client"

import { motion } from "framer-motion"
import { Linkedin, Github, Globe } from "lucide-react"
import type { SocialLink } from "@/lib/user-data"
import { planetColors } from "@/lib/user-data"
import { buildPlanetBackground, getPlanetAppearance } from "@/lib/planet-appearance"

interface SocialPlanetProps {
  social: SocialLink
  onClick: () => void
  isSelected: boolean
  isHovered: boolean
  onHoverStart: () => void
  onHoverEnd: () => void
  isSystemHovered: boolean
}

const iconMap = {
  linkedin: Linkedin,
  github: Github,
  portfolio: Globe,
}

export function SocialPlanet({
  social,
  onClick,
  isSelected,
  isHovered,
  onHoverStart,
  onHoverEnd,
  isSystemHovered,
}: SocialPlanetProps) {
  const colors = planetColors.social[social.icon]
  const appearance = getPlanetAppearance(`social:${social.id}:${social.name}:${social.icon}`)
  const size = 22 + (social.relevance / 10) * 44
  const texture = buildPlanetBackground({
    base: colors.base,
    accent: colors.accent,
    variant: appearance.variant === "tech-grid" ? "tech-grid" : appearance.variant,
    hueShiftDeg: appearance.hueShiftDeg,
  })
  const Icon = iconMap[social.icon]

  const rotationDuration = isSystemHovered ? social.speed * 4 : social.speed
  const dimOthers = isSystemHovered && !isHovered && !isSelected

  return (
    <motion.div
      className="absolute"
      style={{
        width: social.orbitRadius * 2,
        height: social.orbitRadius * 2,
        left: "50%",
        top: "50%",
        marginLeft: -social.orbitRadius,
        marginTop: -social.orbitRadius,
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
        className="absolute inset-0 rounded-full border border-dashed border-white/10"
        style={{ pointerEvents: "none" }}
      />

      {/* Planet */}
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
            isSelected || isHovered ? `0 0 40px ${colors.glow}, 0 0 80px ${colors.glow}` : `0 0 15px ${colors.glow}`,
          opacity: dimOthers ? 0.7 : 1,
        }}
        onClick={onClick}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        whileHover={{ scale: 1.3 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: -360 }}
        transition={{
          rotate: {
            duration: rotationDuration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          },
        }}
      >
        <div
          className="absolute inset-0 rounded-full opacity-35"
          style={{
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35) 0%, transparent 45%)",
          }}
        />
        <Icon className="w-1/2 h-1/2 text-white/90 drop-shadow" />
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
            {social.name}
          </p>
          <p className="text-xs text-white/60 mt-0.5">{social.hoverInfo}</p>
          <p className="text-[11px] text-white/40 mt-1">Click per aprire scheda</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

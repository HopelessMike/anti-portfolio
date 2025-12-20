"use client"

import { motion, useTransform } from "framer-motion"
import { Linkedin, Github, Globe } from "lucide-react"
import { useRef } from "react"
import type { SocialLink } from "@/lib/user-data"
import { planetColors } from "@/lib/user-data"
import { HoverTooltip } from "@/components/hover-tooltip"
import { useContinuousRotate } from "@/components/use-continuous-rotate"

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
  const size = 24 + (social.relevance / 10) * 36
  const Icon = iconMap[social.icon]
  const planetRef = useRef<HTMLDivElement>(null)
  const initialOrbitOffsetDeg = useRef<number>(Math.random() * 360)

  // Slow down global orbit when any body is hovered (prevents hover loss while reading tooltip).
  const slowFactor = isSystemHovered ? 2 : 1
  const rotationDuration = social.speed * slowFactor
  const orbitRotate = useContinuousRotate({ durationSec: rotationDuration, direction: 1 })
  const orbitRotateWithOffset = useTransform(orbitRotate, (v) => v + initialOrbitOffsetDeg.current)
  // Counter-rotate using the *offset* orbit angle so the icon stays upright even with random spawn phase.
  const selfRotate = useTransform(orbitRotateWithOffset, (v) => -v)
  const isRingEmphasized = isSelected || isHovered
  const ringOpacity = isRingEmphasized ? 0.7 : 0.6
  const ringBorderColor = isRingEmphasized ? `${colors.base}55` : `${colors.base}26`

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: social.orbitRadius * 2,
        height: social.orbitRadius * 2,
        left: "50%",
        top: "50%",
        marginLeft: -social.orbitRadius,
        marginTop: -social.orbitRadius,
        zIndex: 12,
        rotate: orbitRotateWithOffset,
      }}
    >
      {/* Orbit ring */}
      <div
        className="absolute inset-0 rounded-full border border-dashed"
        style={{ pointerEvents: "none", borderColor: ringBorderColor, opacity: ringOpacity }}
      />

      {/* Planet */}
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
          rotate: selfRotate,
          background: `radial-gradient(circle at 30% 30%, ${colors.base} 0%, ${colors.accent} 100%)`,
          boxShadow:
            isSelected || isHovered ? `0 0 40px ${colors.glow}, 0 0 80px ${colors.glow}` : `0 0 15px ${colors.glow}`,
        }}
        onClick={onClick}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        whileHover={{ scale: 1.3 }}
        whileTap={{ scale: 0.95 }}
      >
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.20) 0%, transparent 55%)",
            opacity: 0.65,
          }}
        />
        <Icon className="w-1/2 h-1/2 text-white/90" />
      </motion.div>

      {/* Hover tooltip */}
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
            {social.name}
          </p>
          <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{social.hoverInfo}</p>
        </div>
      </HoverTooltip>
    </motion.div>
  )
}

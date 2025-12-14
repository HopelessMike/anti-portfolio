"use client"

import { motion } from "framer-motion"
import type { ThemeType } from "@/lib/user-data"
import { themeColors } from "@/lib/user-data"

export function IdentityStar({
  id,
  text,
  index,
  theme,
  x,
  y,
  isSelected,
  isHovered,
  onHoverStart,
  onHoverEnd,
  onClick,
  isSystemHovered,
}: {
  id: string
  text: string
  index: number
  theme: ThemeType
  x: number
  y: number
  isSelected: boolean
  isHovered: boolean
  onHoverStart: () => void
  onHoverEnd: () => void
  onClick: () => void
  isSystemHovered: boolean
}) {
  const colors = themeColors[theme]

  const dimOthers = isSystemHovered && !isHovered && !isSelected
  const glow = `${colors.secondary}66`

  return (
    <motion.div
      className="absolute"
      style={{ transform: `translate(${x}px, ${y}px)` }}
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 3 + index * 0.3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
    >
      <motion.button
        type="button"
        aria-label={`Apri: ${text}`}
        className="relative rounded-full"
        style={{
          width: 18,
          height: 18,
          background: `radial-gradient(circle, rgba(255,255,255,0.95) 0%, ${colors.secondary} 40%, ${colors.primary}00 80%)`,
          boxShadow:
            isSelected || isHovered
              ? `0 0 30px ${glow}, 0 0 70px ${glow}`
              : `0 0 14px ${colors.secondary}44`,
          opacity: dimOthers ? 0.55 : 1,
        }}
        onClick={onClick}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        whileHover={{ scale: 1.35 }}
        whileTap={{ scale: 0.96 }}
      >
        {/* star spikes */}
        <div
          className="absolute left-1/2 top-1/2 pointer-events-none"
          style={{
            width: 30,
            height: 30,
            transform: "translate(-50%, -50%)",
            background: `conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.25) 10deg, transparent 20deg, rgba(255,255,255,0.25) 30deg, transparent 40deg)`,
            filter: "blur(0.2px)",
            opacity: isSelected || isHovered ? 0.9 : 0.55,
            maskImage: "radial-gradient(circle, rgba(0,0,0,1) 0 30%, rgba(0,0,0,0) 70%)",
            WebkitMaskImage: "radial-gradient(circle, rgba(0,0,0,1) 0 30%, rgba(0,0,0,0) 70%)",
          }}
        />
      </motion.button>

      <motion.div
        className="absolute pointer-events-none z-50"
        style={{ left: "50%", top: "100%", marginTop: 10 }}
        initial={{ opacity: 0, y: -6, scale: 0.96 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : -6, scale: isHovered ? 1 : 0.96 }}
        transition={{ duration: 0.18 }}
      >
        <div
          className="px-4 py-2.5 rounded-xl backdrop-blur-md border whitespace-nowrap text-center max-w-[340px]"
          style={{
            background: "rgba(0,0,0,0.86)",
            borderColor: `${colors.secondary}66`,
            transform: "translateX(-50%)",
            boxShadow: `0 0 22px ${glow}`,
          }}
        >
          <p className="font-mono text-[11px] tracking-wider" style={{ color: colors.secondary }}>
            IDENTITY SIGNAL
          </p>
          <p className="text-xs text-white/80 mt-1">{text}</p>
          <p className="text-[11px] text-white/40 mt-1">Click per aprire scheda</p>
        </div>
      </motion.div>
    </motion.div>
  )
}



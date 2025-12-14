"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import type { ThemeType } from "@/lib/user-data"
import { themeColors } from "@/lib/user-data"

interface CentralSunProps {
  core: string
  coreDescription: string
  theme: ThemeType
}

export function CentralSun({ core, coreDescription, theme }: CentralSunProps) {
  const [isHovered, setIsHovered] = useState(false)
  const colors = themeColors[theme]

  return (
    // IMPORTANT: the sun is visually huge; keep halos non-interactive so planets remain clickable.
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
      {/* Core star appearance (as requested): gradient + glow + pulse + expanding ping */}
      <motion.div
        className="relative flex items-center justify-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        style={
          {
            // Set CSS vars used by glow-primary (and by any future hsl(var(--color-*)) usage)
            // Keep them as hex because the rest of the app already uses hex in :root.
            ["--primary" as any]: colors.primary,
            ["--secondary" as any]: colors.secondary,
          } as React.CSSProperties
        }
      >
        {/* Soft bloom (more splendente, not harsh) */}
        <div
          className="absolute w-44 h-44 rounded-full"
          style={{
            backgroundImage: `radial-gradient(circle, ${colors.primary}33 0%, ${colors.secondary}22 35%, transparent 70%)`,
            filter: "blur(18px)",
            opacity: 0.65,
            mixBlendMode: "screen",
            pointerEvents: "none",
          }}
        />
        <div
          className="absolute w-24 h-24 rounded-full glow-primary animate-[pulse_5.5s_ease-in-out_infinite]"
          style={{
            backgroundImage: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            filter: "blur(0.2px)",
            opacity: 0.95,
          }}
        />
        <div
          className="absolute w-36 h-36 rounded-full border-2 animate-[ping_6s_ease-out_infinite]"
          style={{ borderColor: `${colors.primary}1f`, filter: "blur(0.4px)" }}
        />

        {/* Hover hit-area only (do not change text or tooltip behavior) */}
        <motion.div
          className="absolute w-32 h-32 rounded-full cursor-pointer pointer-events-auto"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          style={{ background: "transparent" }}
        />
      </motion.div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
        <p className="text-[10px] font-mono text-white/60 tracking-widest mb-0.5">CORE VALUE</p>
        <p
          className="text-lg font-bold font-space-grotesk drop-shadow-lg"
          style={{
            color: "white",
            textShadow: `0 0 20px ${colors.primary}, 0 0 40px ${colors.secondary}`,
          }}
        >
          {core}
        </p>
      </div>

      <motion.div
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ top: "100%", marginTop: 30 }}
        initial={{ opacity: 0, y: -10 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          y: isHovered ? 0 : -10,
        }}
        transition={{ duration: 0.3 }}
      >
        <div
          className="px-5 py-3 rounded-xl backdrop-blur-xl border text-center min-w-[220px]"
          style={{
            background: "rgba(0,0,0,0.9)",
            borderColor: `${colors.primary}50`,
            boxShadow: `0 0 30px ${colors.primary}30`,
          }}
        >
          <p className="text-sm text-white/80 leading-relaxed italic">"{coreDescription}"</p>
        </div>
      </motion.div>
    </div>
  )
}

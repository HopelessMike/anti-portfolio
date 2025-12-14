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
      {/* Light rays / bloom spikes (subtle, premium) */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          width: 320,
          height: 320,
          filter: "blur(10px)",
          opacity: 0.55,
          background: `conic-gradient(
            from 0deg,
            transparent 0deg,
            ${colors.primary}22 18deg,
            transparent 42deg,
            ${colors.secondary}18 76deg,
            transparent 110deg,
            ${colors.primary}14 150deg,
            transparent 190deg,
            ${colors.secondary}18 230deg,
            transparent 270deg,
            ${colors.primary}14 310deg,
            transparent 360deg
          )`,
          WebkitMaskImage: "radial-gradient(circle, transparent 0 44%, rgba(0,0,0,1) 52%, rgba(0,0,0,0) 74%)",
          maskImage: "radial-gradient(circle, transparent 0 44%, rgba(0,0,0,1) 52%, rgba(0,0,0,0) 74%)",
        }}
        animate={{ rotate: 360, opacity: [0.35, 0.6, 0.35] }}
        transition={{
          rotate: { duration: 30, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
          opacity: { duration: 4.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
        }}
      />

      {[1, 2, 3, 4, 5].map((ring) => (
        <motion.div
          key={ring}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 120 + ring * 35,
            height: 120 + ring * 35,
            background: `radial-gradient(circle, transparent 85%, ${colors.primary}${Math.max(5, 20 - ring * 3).toString(16)} 100%)`,
            border: `1px solid ${colors.primary}${Math.max(10, 30 - ring * 5).toString(16)}`,
          }}
          animate={{
            scale: [1, 1.05 + ring * 0.02, 1],
            opacity: [0.4 - ring * 0.05, 0.7 - ring * 0.1, 0.4 - ring * 0.05],
          }}
          transition={{
            duration: 2 + ring * 0.3,
            repeat: Number.POSITIVE_INFINITY,
            delay: ring * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Outer plasma glow */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 200,
          height: 200,
          background: `radial-gradient(circle, ${colors.primary}30 0%, ${colors.secondary}15 40%, transparent 70%)`,
          filter: "blur(20px)",
        }}
        animate={{
          scale: [0.9, 1.1, 0.9],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Rotating conic gradient corona */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 180,
          height: 180,
          background: `conic-gradient(from 0deg, transparent, ${colors.primary}30, transparent, ${colors.secondary}30, transparent)`,
          filter: "blur(8px)",
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {/* Main sun body: premium, textured (less \"billiard ball\") */}
      <motion.div
        className="relative w-32 h-32 rounded-full cursor-pointer pointer-events-auto"
        style={{
          background: `
            radial-gradient(circle at 35% 35%, 
              rgba(255, 255, 255, 0.95) 0%,
              ${colors.primary} 25%, 
              ${colors.secondary} 55%, 
              ${colors.primary}90 100%
            ),
            radial-gradient(circle at 70% 75%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 52%),
            radial-gradient(circle at 25% 80%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 45%),
            repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0 1px, rgba(0,0,0,0) 1px 3px)
          `,
          boxShadow: `
            0 0 80px ${colors.primary}90,
            0 0 150px ${colors.primary}60,
            0 0 200px ${colors.secondary}40,
            inset 0 0 60px rgba(255, 255, 255, 0.4)
          `,
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        animate={{
          boxShadow: [
            `0 0 80px ${colors.primary}90, 0 0 150px ${colors.primary}60, 0 0 200px ${colors.secondary}40, inset 0 0 60px rgba(255,255,255,0.4)`,
            `0 0 120px ${colors.primary}99, 0 0 200px ${colors.primary}70, 0 0 280px ${colors.secondary}50, inset 0 0 80px rgba(255,255,255,0.5)`,
            `0 0 80px ${colors.primary}90, 0 0 150px ${colors.primary}60, 0 0 200px ${colors.secondary}40, inset 0 0 60px rgba(255,255,255,0.4)`,
          ],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 2.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        {/* Plasma swirl layer */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              conic-gradient(
                from 180deg,
                rgba(255,255,255,0.00),
                ${colors.secondary}1f,
                rgba(255,255,255,0.00),
                ${colors.primary}22,
                rgba(255,255,255,0.00),
                ${colors.secondary}1a,
                rgba(255,255,255,0.00)
              )
            `,
            mixBlendMode: "overlay",
            filter: "blur(1px)",
            opacity: 0.7,
          }}
          animate={{ rotate: -360, opacity: [0.5, 0.8, 0.5] }}
          transition={{
            rotate: { duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
            opacity: { duration: 3.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
          }}
        />

        {/* Sunspots / surface detail */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `
              radial-gradient(circle at 62% 58%, rgba(0,0,0,0.24) 0%, rgba(0,0,0,0) 22%),
              radial-gradient(circle at 48% 72%, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 18%),
              radial-gradient(circle at 30% 55%, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0) 16%),
              radial-gradient(circle at 70% 35%, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0) 24%)
            `,
            mixBlendMode: "soft-light",
            filter: "blur(0.4px) contrast(1.05)",
            opacity: 0.9,
          }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 5.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />

        {/* Grain shimmer (very subtle) */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "repeating-radial-gradient(circle at 20% 30%, rgba(255,255,255,0.06) 0 1px, rgba(0,0,0,0) 1px 2px)",
            mixBlendMode: "overlay",
            opacity: 0.18,
            filter: "blur(0.2px)",
          }}
          animate={{ opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />

        {/* Bright spot highlight */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 40,
            height: 40,
            left: "20%",
            top: "20%",
            background: `radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`,
          }}
          animate={{
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
          }}
        />

        {/* Secondary highlight */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 20,
            height: 20,
            right: "25%",
            bottom: "30%",
            background: `radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 100%)`,
          }}
        />

        {/* Inner rim light */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.10), inset 0 0 30px ${colors.primary}22`,
          }}
          animate={{ opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
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

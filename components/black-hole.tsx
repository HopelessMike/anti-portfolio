"use client"

import { motion } from "framer-motion"
import type { Failure } from "@/lib/user-data"

interface BlackHoleProps {
  failure: Failure
  onClick: () => void
  isSelected: boolean
  isHovered: boolean
  onHoverStart: () => void
  onHoverEnd: () => void
  isSystemHovered: boolean
}

export function BlackHole({
  failure,
  onClick,
  isSelected,
  isHovered,
  onHoverStart,
  onHoverEnd,
  isSystemHovered,
}: BlackHoleProps) {
  // Position in bottom-right area of the solar system
  const position = { x: 380, y: 380 }

  return (
    <motion.div
      className="absolute z-40"
      style={{
        left: `calc(50% + ${position.x}px)`,
        top: `calc(50% + ${position.y}px)`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* Event horizon ring */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 180,
          height: 180,
          background: `
            radial-gradient(circle, 
              transparent 40%, 
              rgba(139, 92, 246, 0.1) 50%, 
              rgba(139, 92, 246, 0.2) 60%, 
              rgba(139, 92, 246, 0.1) 70%,
              transparent 80%
            )
          `,
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: isSystemHovered ? 40 : 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {/* Accretion disk */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 140,
          height: 140,
          background: `
            conic-gradient(
              from 0deg,
              transparent,
              rgba(168, 85, 247, 0.4),
              rgba(217, 70, 239, 0.6),
              rgba(168, 85, 247, 0.4),
              transparent,
              rgba(139, 92, 246, 0.3),
              transparent
            )
          `,
          borderRadius: "50%",
          filter: "blur(3px)",
        }}
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: isSystemHovered ? 16 : 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {/* Second accretion ring */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 110,
          height: 110,
          background: `
            conic-gradient(
              from 180deg,
              transparent,
              rgba(236, 72, 153, 0.5),
              transparent,
              rgba(168, 85, 247, 0.5),
              transparent
            )
          `,
          borderRadius: "50%",
          filter: "blur(2px)",
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: isSystemHovered ? 12 : 6,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {/* Black hole core - clickable */}
      <motion.div
        className="relative w-20 h-20 rounded-full cursor-pointer"
        style={{
          background: `
            radial-gradient(circle at center,
              #000000 0%,
              #0a0a0a 30%,
              #1a1a2e 60%,
              #000000 100%
            )
          `,
          boxShadow:
            isSelected || isHovered
              ? `
              inset 0 0 40px rgba(139, 92, 246, 0.3),
              0 0 60px rgba(168, 85, 247, 0.5),
              0 0 100px rgba(217, 70, 239, 0.3)
            `
              : `
              inset 0 0 30px rgba(139, 92, 246, 0.2),
              0 0 40px rgba(168, 85, 247, 0.3),
              0 0 60px rgba(217, 70, 239, 0.2)
            `,
        }}
        onClick={onClick}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            `inset 0 0 30px rgba(139, 92, 246, 0.2), 0 0 40px rgba(168, 85, 247, 0.3), 0 0 60px rgba(217, 70, 239, 0.2)`,
            `inset 0 0 50px rgba(139, 92, 246, 0.4), 0 0 60px rgba(168, 85, 247, 0.5), 0 0 80px rgba(217, 70, 239, 0.3)`,
            `inset 0 0 30px rgba(139, 92, 246, 0.2), 0 0 40px rgba(168, 85, 247, 0.3), 0 0 60px rgba(217, 70, 239, 0.2)`,
          ],
        }}
        transition={{
          boxShadow: {
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          },
        }}
      >
        {/* Inner void */}
        <div
          className="absolute inset-4 rounded-full"
          style={{
            background: "radial-gradient(circle, #000 0%, #050510 100%)",
          }}
        />

        {/* Gravitational lensing effect */}
        <motion.div
          className="absolute -inset-2 rounded-full opacity-50"
          style={{
            border: "1px solid rgba(168, 85, 247, 0.3)",
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
          }}
        />
      </motion.div>

      {/* Anomaly label - always visible */}
      <div className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap" style={{ bottom: -35 }}>
        <p className="text-xs font-mono text-purple-400/60 tracking-wider">ANOMALY</p>
      </div>

      {/* Hover tooltip */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-50"
        style={{ top: -80 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          y: isHovered ? 0 : 10,
        }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="px-4 py-3 rounded-lg backdrop-blur-md border border-purple-500/40 text-center max-w-[260px] whitespace-normal break-words"
          style={{ background: "rgba(0,0,0,0.9)" }}
        >
          <p className="font-mono text-sm font-bold text-purple-400">{failure.title}</p>
          <p className="text-xs text-white/60 mt-1">Click to explore the story</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

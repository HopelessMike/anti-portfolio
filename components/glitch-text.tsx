"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlitchTextProps {
  text: string
  className?: string
  delay?: number
}

export function GlitchText({ text, className, delay = 0 }: GlitchTextProps) {
  return (
    <motion.div
      className={cn("relative", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <motion.span
        className="relative inline-block"
        animate={{
          textShadow: [
            "0 0 0 transparent",
            "-2px 0 #22d3ee, 2px 0 #d946ef",
            "0 0 0 transparent",
            "2px 0 #22d3ee, -2px 0 #d946ef",
            "0 0 0 transparent",
          ],
        }}
        transition={{
          duration: 0.3,
          repeat: Number.POSITIVE_INFINITY,
          repeatDelay: 3,
          delay: delay + 0.5,
        }}
      >
        {text.split("").map((char, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.05,
              delay: delay + i * 0.03,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.span>
    </motion.div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Star = {
  id: string
  topPct: number
  leftPct: number
  durationMs: number
  lengthPx: number
  thicknessPx: number
  angleDeg: number
  dx: number
  dy: number
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function pickAngleDeg() {
  // Randomize trajectory (comet-like), not always same inclination.
  // Favor diagonals but allow variation.
  const sign = Math.random() < 0.5 ? -1 : 1
  const base = rand(20, 70)
  return sign * base
}

export function ShootingStars({ density = "low" }: { density?: "low" | "medium" }) {
  const [stars, setStars] = useState<Star[]>([])

  // User request: ~one every 5–10 seconds.
  const intervalMs = density === "medium" ? [5000, 9000] : [5000, 10000]

  const base = useMemo(() => ({ created: Date.now() }), [])

  useEffect(() => {
    let alive = true

    const spawn = () => {
      const id = `${base.created}-${Date.now()}-${Math.random().toString(16).slice(2)}`
      const angleDeg = pickAngleDeg()
      const distance = rand(260, 520)
      const rad = (angleDeg * Math.PI) / 180
      const dx = Math.cos(rad) * distance
      const dy = Math.sin(rad) * distance
      const s: Star = {
        id,
        topPct: rand(4, 70),
        leftPct: rand(0, 85),
        durationMs: rand(550, 950),
        lengthPx: rand(160, 320),
        thicknessPx: rand(1, 2.2),
        angleDeg,
        dx,
        dy,
      }
      setStars([s]) // keep it subtle (usually one at a time)
      setTimeout(() => {
        if (!alive) return
        setStars([])
      }, s.durationMs + 300)
    }

    const loop = () => {
      if (!alive) return
      spawn()
      const next = rand(intervalMs[0], intervalMs[1])
      setTimeout(loop, next)
    }

    const first = rand(intervalMs[0], intervalMs[1])
    const t = setTimeout(loop, first)
    return () => {
      alive = false
      clearTimeout(t)
    }
  }, [base.created, intervalMs])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <AnimatePresence>
        {stars.map((s) => (
          <motion.div
            key={s.id}
            className="absolute"
            style={{
              top: `${s.topPct}%`,
              left: `${s.leftPct}%`,
              width: s.lengthPx,
              height: s.thicknessPx,
              rotate: `${s.angleDeg}deg`,
              transformOrigin: "0% 50%",
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.00), rgba(255,255,255,0.92), rgba(255,255,255,0.00))",
              filter:
                "drop-shadow(0 0 10px rgba(255,255,255,0.25)) drop-shadow(0 0 16px rgba(34,211,238,0.18))",
            }}
            initial={{ x: 0, y: 0, opacity: 0, scaleX: 0.15 }}
            animate={{
              x: s.dx,
              y: s.dy,
              opacity: [0, 1, 0],
              scaleX: [0.15, 1, 0.35],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: s.durationMs / 1000,
              ease: "easeOut",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}



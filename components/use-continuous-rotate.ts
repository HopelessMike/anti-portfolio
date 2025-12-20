"use client"

import { animate, useMotionValue } from "framer-motion"
import { useEffect } from "react"

/**
 * Continuous 360° rotation that can change speed on the fly.
 * We animate a MotionValue and restart the animation whenever `durationSec` changes,
 * so speed changes apply immediately (unlike some infinite-repeat transitions that can feel “stuck”).
 */
export function useContinuousRotate({
  durationSec,
  direction = 1,
  paused = false,
}: {
  durationSec: number
  direction?: 1 | -1
  paused?: boolean
}) {
  const rotate = useMotionValue(0)

  useEffect(() => {
    if (paused) return
    // Animate from current angle to +/-360° ahead, repeating forever.
    const controls = animate(rotate, rotate.get() + 360 * direction, {
      duration: Math.max(0.1, durationSec),
      ease: "linear",
      repeat: Number.POSITIVE_INFINITY,
    })
    return () => controls.stop()
  }, [direction, durationSec, paused, rotate])

  return rotate
}



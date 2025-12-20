"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

type Placement = "bottom" | "top"

type TooltipPos = {
  left: number
  top: number
  placement: Placement
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function HoverTooltip({
  anchorRef,
  open,
  placement = "bottom",
  offset = 12,
  zIndex = 80,
  children,
}: {
  anchorRef: React.RefObject<HTMLElement | null>
  open: boolean
  placement?: Placement
  offset?: number
  zIndex?: number
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const [pos, setPos] = useState<TooltipPos | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const update = () => {
    const el = anchorRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (!rect.width && !rect.height) return

    const centerX = rect.left + rect.width / 2
    const preferred: Placement = placement
    let p: Placement = preferred

    // Default position: below the element.
    let top = rect.bottom + offset
    if (preferred === "top") top = rect.top - offset

    // Smart flip to avoid going off-screen vertically.
    const vh = window.innerHeight || 0
    if (preferred === "bottom" && top > vh - 80) {
      p = "top"
      top = rect.top - offset
    } else if (preferred === "top" && top < 20) {
      p = "bottom"
      top = rect.bottom + offset
    }

    // Clamp X inside viewport (content is centered via translateX(-50%))
    const vw = window.innerWidth || 0
    const left = clamp(centerX, 16, Math.max(16, vw - 16))

    setPos({ left, top, placement: p })
  }

  useLayoutEffect(() => {
    if (!open) {
      setPos(null)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      return
    }

    const loop = () => {
      update()
      rafRef.current = requestAnimationFrame(loop)
    }

    loop()

    const onScrollOrResize = () => update()
    window.addEventListener("resize", onScrollOrResize, { passive: true })
    // Capture scroll events from any scroll container.
    window.addEventListener("scroll", onScrollOrResize, { passive: true, capture: true } as any)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      window.removeEventListener("resize", onScrollOrResize)
      window.removeEventListener("scroll", onScrollOrResize, true as any)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, placement, offset])

  if (!mounted || !open || !pos) return null

  return createPortal(
    <div
      className="fixed pointer-events-none"
      style={{
        left: pos.left,
        top: pos.top,
        transform: "translateX(-50%)",
        zIndex,
      }}
    >
      {children}
    </div>,
    document.body,
  )
}



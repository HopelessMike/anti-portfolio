"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, Check } from "lucide-react"
import type { ThemeType } from "@/lib/user-data"
import { themeColors } from "@/lib/user-data"

interface DownloadButtonProps {
  theme: ThemeType
  payload?: unknown
}

export function DownloadButton({ theme, payload }: DownloadButtonProps) {
  const [status, setStatus] = useState<"idle" | "compressing" | "encrypting" | "ready">("idle")
  const colors = themeColors[theme]

  const handleClick = () => {
    if (status !== "idle") return

    setStatus("compressing")
    setTimeout(() => setStatus("encrypting"), 1000)
    setTimeout(() => {
      setStatus("ready")
      // Deliver file exactly when UI says "ready"
      if (payload) {
        try {
          const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = "flight-log.json"
          document.body.appendChild(a)
          a.click()
          a.remove()
          URL.revokeObjectURL(url)
        } catch {
          // ignore
        }
      }
    }, 2000)
    setTimeout(() => setStatus("idle"), 4000)
  }

  const statusText = {
    idle: "DOWNLOAD FLIGHT LOG",
    compressing: "COMPRESSING...",
    encrypting: "ENCRYPTING...",
    ready: "DOWNLOAD READY",
  }

  return (
    <motion.button
      className="fixed bottom-6 right-6 z-30 px-6 py-3 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 font-mono text-sm flex items-center gap-3 overflow-hidden"
      style={{
        boxShadow: status === "ready" ? colors.glow : "none",
      }}
      onClick={handleClick}
      whileHover={{ scale: 1.05, borderColor: colors.primary }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Progress bar */}
      <AnimatePresence>
        {status !== "idle" && status !== "ready" && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r opacity-20"
            style={{
              backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
            }}
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        )}
      </AnimatePresence>

      <span className="relative z-10 flex items-center gap-3">
        {status === "ready" ? (
          <Check className="w-4 h-4" style={{ color: colors.primary }} />
        ) : (
          <Download className="w-4 h-4 text-white/60" />
        )}
        <span
          style={{
            color: status === "ready" ? colors.primary : "rgba(255,255,255,0.8)",
          }}
        >
          {statusText[status]}
        </span>
      </span>
    </motion.button>
  )
}

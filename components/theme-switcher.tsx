"use client"

import { motion } from "framer-motion"
import type { ThemeType } from "@/lib/user-data"
import { themeColors } from "@/lib/user-data"

interface ThemeSwitcherProps {
  currentTheme: ThemeType
  onThemeChange: (theme: ThemeType) => void
}

const themes: { key: ThemeType; label: string }[] = [
  { key: "tech", label: "TECH" },
  { key: "marketing", label: "MKTG" },
  { key: "design", label: "DSGN" },
]

export function ThemeSwitcher({ currentTheme, onThemeChange }: ThemeSwitcherProps) {
  return (
    <div className="fixed top-6 right-6 z-30 flex gap-2 p-1 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10">
      {themes.map(({ key, label }) => {
        const colors = themeColors[key]
        const isActive = currentTheme === key

        return (
          <motion.button
            key={key}
            className="relative px-3 py-1.5 rounded-md font-mono text-xs transition-colors"
            onClick={() => onThemeChange(key)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-md"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}30, ${colors.secondary}30)`,
                  border: `1px solid ${colors.primary}50`,
                }}
                layoutId="activeTheme"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            <span className="relative z-10" style={{ color: isActive ? colors.primary : "rgba(255,255,255,0.5)" }}>
              {label}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}

/**
 * NOTE:
 * Theme selection is deprecated in the integrated product.
 * The theme (TECH/MKTG/DSGN) is determined by the AI and shipped in `AntiPortfolioData.userData.theme`.
 * This component is kept temporarily for reference and can be deleted later.
 */

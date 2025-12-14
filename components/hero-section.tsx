"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { GlitchText } from "./glitch-text"
import { useMemo, useRef } from "react"
import type { UserData } from "@/lib/user-data"
import { themeColors } from "@/lib/user-data"

interface HeroSectionProps {
  userData: UserData
}

export function HeroSection({ userData }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] })

  const colors = themeColors[userData.theme]

  const manifestoLines = useMemo(() => {
    // RULE:
    // 1) first all "Non sono ..." (Italian, with highlighted phrases)
    // 2) then close with the two English lines.
    const negations = (userData.identityNegations || []).filter(Boolean).slice(0, 12)
    return [...negations, "We are not just resumes.", "We are complex systems."]
  }, [userData.identityNegations])

  // Prevent overlap: make sure the hero fully fades out BEFORE the first manifesto screen starts.
  // Container height = (1 + manifestoLines.length) * 100vh.
  // When we've scrolled 1 screen, progress ≈ 1 / (1 + manifestoLines.length).
  const heroFadeEnd = useMemo(() => {
    const totalScreens = 1 + Math.max(1, manifestoLines.length)
    // Fade to zero a bit BEFORE we reach the first manifesto section.
    return Math.min(0.25, 0.85 / totalScreens)
  }, [manifestoLines.length])

  const heroOpacity = useTransform(scrollYProgress, [0, heroFadeEnd], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, heroFadeEnd], [0, -120])

  return (
    <div
      ref={containerRef}
      className="relative"
      // 1 screen for the hero + 1 screen for each manifesto line
      style={{ height: `${(1 + manifestoLines.length) * 100}vh` }}
    >
      <motion.div
        className="sticky top-0 h-screen flex flex-col items-center justify-center px-4"
        style={{ opacity: heroOpacity, y: heroY }}
      >
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(ellipse at center, ${colors.primary}20 0%, transparent 70%)`,
          }}
        />

        <div className="relative z-10 text-center max-w-5xl">
          <motion.p
            className="text-sm font-mono tracking-[0.3em] text-white/50 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {"// SYSTEM BOOT SEQUENCE"}
          </motion.p>

          <motion.div
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight font-space-grotesk bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {userData.name.toUpperCase()}
          </motion.div>

          <div className="mt-4">
            <GlitchText
              text="[MISSION RECORDER]"
              className="text-xl md:text-2xl lg:text-3xl font-mono tracking-wider text-white/70"
              delay={1}
            />
          </div>

          <motion.p
            className="mt-6 text-lg text-white/60 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            {userData.role} • Core Value: {userData.core}
          </motion.p>
        </div>

        <motion.div
          className="absolute bottom-12 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          <span className="text-xs font-mono text-white/40 tracking-wider">SCROLL TO EXPLORE</span>
          <motion.div
            className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2"
            animate={{ borderColor: ["rgba(255,255,255,0.2)", "rgba(255,255,255,0.4)", "rgba(255,255,255,0.2)"] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-white/60"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Manifesto sections */}
      {manifestoLines.map((line, i) => (
        <ManifestoSection
          key={i}
          text={line}
          index={i}
          totalSections={manifestoLines.length}
          accentPrimary={colors.primary}
          accentSecondary={colors.secondary}
        />
      ))}
    </div>
  )
}

function splitHighlights(input: string): Array<{ text: string; highlight: boolean }> {
  // Highlight markup: wrap phrases as [[like this]].
  // Example: "Non sono il mio [[job title]]."
  const parts: Array<{ text: string; highlight: boolean }> = []
  const re = /\[\[([\s\S]*?)\]\]/g
  let lastIdx = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(input))) {
    const start = m.index
    const end = re.lastIndex
    if (start > lastIdx) parts.push({ text: input.slice(lastIdx, start), highlight: false })
    parts.push({ text: m[1], highlight: true })
    lastIdx = end
  }
  if (lastIdx < input.length) parts.push({ text: input.slice(lastIdx), highlight: false })
  return parts.length ? parts : [{ text: input, highlight: false }]
}

function ManifestoSection({
  text,
  index,
  totalSections,
  accentPrimary,
  accentSecondary,
}: {
  text: string
  index: number
  totalSections: number
  accentPrimary: string
  accentSecondary: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.7, 1], [0, 1, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.8])
  const y = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [100, 0, 0, -100])

  const isClosingLine = index >= totalSections - 2
  const highlightParts = splitHighlights(text)

  return (
    <motion.div ref={ref} className="h-screen flex items-center justify-center px-4" style={{ opacity, scale, y }}>
      <p className="text-3xl md:text-5xl lg:text-6xl font-light text-center text-white/90 font-space-grotesk max-w-4xl leading-tight">
        {isClosingLine ? (
          <span className="font-mono" style={{ color: accentPrimary }}>
            {text}
          </span>
        ) : (
          <span>
            {highlightParts.map((p, idx) =>
              p.highlight ? (
                <span
                  // alternate accent color for multiple highlights
                  key={idx}
                  style={{ color: idx % 2 === 0 ? accentPrimary : accentSecondary, fontWeight: 600 }}
                >
                  {p.text}
                </span>
              ) : (
                <span key={idx} className="text-white/90">
                  {p.text}
                </span>
              ),
            )}
          </span>
        )}
      </p>
    </motion.div>
  )
}

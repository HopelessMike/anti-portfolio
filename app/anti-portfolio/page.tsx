"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, useScroll, useTransform } from "framer-motion"
import { StarBackground } from "@/components/star-background"
import { HeroSection } from "@/components/hero-section"
import { SolarSystem } from "@/components/solar-system"
import { DownloadButton } from "@/components/download-button"
import { BackgroundAudio } from "@/components/background-audio"
import { clearFlightLog, loadFlightLog } from "@/lib/client/storage"
import { userData as fallbackUserData } from "@/lib/user-data"
import { normalizeUserData } from "@/lib/client/normalize-user-data"
import type { AntiPortfolioData } from "@/lib/types/anti-portfolio-data"

export default function AntiPortfolioPage() {
  const router = useRouter()
  const solarRef = useRef<HTMLDivElement>(null)

  const [flightLog, setFlightLog] = useState<AntiPortfolioData | null>(null)

  useEffect(() => {
    const loaded = loadFlightLog()
    if (!loaded) {
      router.replace("/onboarding")
      return
    }
    setFlightLog(loaded)
  }, [router])

  // Fade-in relative to the solar system section itself (robust to hero height changes).
  const { scrollYProgress: solarProgress } = useScroll({
    target: solarRef,
    offset: ["start end", "start start"],
  })
  const solarSystemOpacity = useTransform(solarProgress, [0, 0.7], [0, 1])
  const solarSystemScale = useTransform(solarProgress, [0, 0.7], [0.96, 1])

  const userData = useMemo(() => normalizeUserData(flightLog?.userData ?? fallbackUserData), [flightLog])
  const theme = userData.theme

  return (
    <div className="relative bg-[#02040A] text-white">
      <StarBackground />
      <BackgroundAudio trackId={userData.backgroundAudio?.trackId} volume={userData.backgroundAudio?.volume} />

      {/* Home / Restart */}
      <div className="fixed top-6 left-6 z-30">
        <button
          type="button"
          className="px-4 py-2 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 font-mono text-xs text-white/70 hover:bg-white/10"
          onClick={() => {
            clearFlightLog()
            router.push("/onboarding")
          }}
        >
          HOME / NEW MISSION
        </button>
      </div>

      <HeroSection userData={userData} />

      <motion.div
        ref={solarRef}
        className="sticky top-0 h-screen"
        style={{
          opacity: solarSystemOpacity,
          scale: solarSystemScale,
        }}
      >
        <SolarSystem userData={userData} />
      </motion.div>

      <div className="h-screen" />

      <DownloadButton theme={theme} payload={flightLog ?? undefined} />
    </div>
  )
}



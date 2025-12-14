"use client"

import Link from "next/link"
import { StarBackground } from "@/components/star-background"
import { ShootingStars } from "@/components/shooting-stars"
import { themeColors } from "@/lib/user-data"
import { LoadFlightLogButton } from "@/components/load-flight-log-button"

export default function HomePage() {
  const colors = themeColors.design

  return (
    <div className="relative min-h-screen bg-[#02040A] text-white overflow-hidden">
      <StarBackground />
      <ShootingStars density="low" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <p className="font-mono text-xs tracking-[0.3em] text-white/50">{"// ANTI-PORTFOLIO: COSMIC MISSION RECORDER"}</p>
        <h1 className="mt-6 text-5xl md:text-7xl font-space-grotesk font-bold leading-tight">
          Non sei un CV.
          <br />
          Sei un <span style={{ color: colors.primary }}>UNIVERSO</span>.
        </h1>
        <p className="mt-6 text-white/70 font-mono text-sm max-w-2xl">
          Carica CV + link. L&apos;AI costruisce il tuo profilo e genera una pagina interattiva “cosmica” dove valori ed esperienze vengono prima dei titoli.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center rounded-lg px-6 py-3 font-mono text-sm border border-white/10 bg-white/10 hover:bg-white/15"
            style={{ boxShadow: colors.glow }}
          >
            Inizia la missione
          </Link>
          <Link
            href="/anti-portfolio"
            className="inline-flex items-center justify-center rounded-lg px-6 py-3 font-mono text-sm border border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
          >
            Apri ultimo Flight Log
          </Link>
          <LoadFlightLogButton />
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadFlightLog } from "@/lib/client/storage"
import type { AntiPortfolioData } from "@/lib/types/anti-portfolio-data"
import { AntiPortfolioView } from "@/components/anti-portfolio-view"

export default function AntiPortfolioPage() {
  const router = useRouter()
  const [flightLog, setFlightLog] = useState<AntiPortfolioData | null>(null)

  useEffect(() => {
    const loaded = loadFlightLog()
    if (!loaded) {
      router.replace("/onboarding")
      return
    }
    setFlightLog(loaded)
  }, [router])

  if (!flightLog) return null
  return <AntiPortfolioView flightLog={flightLog} mode="stored" />
}



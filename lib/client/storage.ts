import type { AntiPortfolioData } from "@/lib/types/anti-portfolio-data"

const KEY = "antiPortfolio.flightLog.v1"

export function saveFlightLog(data: AntiPortfolioData) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function loadFlightLog(): AntiPortfolioData | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AntiPortfolioData
  } catch {
    return null
  }
}

export function clearFlightLog() {
  localStorage.removeItem(KEY)
}



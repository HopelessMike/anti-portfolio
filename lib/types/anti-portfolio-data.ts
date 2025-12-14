import type { UserData } from "@/lib/user-data"

export interface AntiPortfolioData {
  version: "1.0"
  generatedAt: string
  userData: UserData
  meta: {
    sourceSummary: {
      filesCount: number
      linksCount: number
    }
    confidence: number
    limitations: string[]
  }
}



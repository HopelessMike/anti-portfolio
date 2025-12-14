"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Backwards-compat route: the final product uses /anti-portfolio.
export default function PortfolioRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/anti-portfolio")
  }, [router])
  return null
}



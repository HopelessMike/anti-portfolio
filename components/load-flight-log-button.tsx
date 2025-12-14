"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { saveFlightLog } from "@/lib/client/storage"
import type { AntiPortfolioData } from "@/lib/types/anti-portfolio-data"
import { AntiPortfolioDataSchema } from "@/lib/schemas/anti-portfolio-data"

export function LoadFlightLogButton() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const onPick = () => {
    setError(null)
    inputRef.current?.click()
  }

  const onFile = async (file: File | null) => {
    if (!file) return
    setError(null)
    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as unknown
      const validated = AntiPortfolioDataSchema.parse(parsed) as unknown as AntiPortfolioData
      saveFlightLog(validated)
      router.push("/anti-portfolio")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid flight log")
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={onPick}
        className="inline-flex items-center justify-center rounded-lg px-6 py-3 font-mono text-sm border border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
      >
        Carica Flight Log (.json)
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
      {error && <p className="text-xs font-mono text-red-300/90 max-w-[28rem]">{error}</p>}
    </div>
  )
}



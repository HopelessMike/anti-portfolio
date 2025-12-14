"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { StarBackground } from "@/components/star-background"
import { ShootingStars } from "@/components/shooting-stars"
import { MissionLoader } from "@/components/mission-loader"
import { saveFlightLog } from "@/lib/client/storage"
import type { AntiPortfolioData } from "@/lib/types/anti-portfolio-data"
import { themeColors } from "@/lib/user-data"
import { useOnboarding } from "../layout"

type Status = "idle" | "uploading" | "analyzing" | "done" | "error"

const MAX_BRIEFING_CHARS = 2500
const MAX_UPLOAD_TOTAL_BYTES = 4 * 1024 * 1024 // ~4MB total (safe headroom vs Vercel limits)

export default function OnboardingBriefingPage() {
  const router = useRouter()
  const { files, links, briefing, setBriefing } = useOnboarding()

  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)

  const hasAnySource = files.length > 0 || links.some((l) => l.trim())
  const cleanedLinks = useMemo(() => links.map((l) => l.trim()).filter(Boolean).slice(0, 3), [links])

  const canSubmit = hasAnySource

  const submit = async () => {
    if (!canSubmit) return

    setStatus("uploading")
    setError(null)

    try {
      const totalUploadBytes = files.reduce((sum, f) => sum + (f?.size || 0), 0)
      if (totalUploadBytes > MAX_UPLOAD_TOTAL_BYTES) {
        throw new Error("Upload troppo grande per Vercel: riduci/comprimi i PDF (consigliato ~4MB totali).")
      }

      const fd = new FormData()
      files.forEach((f) => fd.append("files", f))
      fd.append("links", JSON.stringify(cleanedLinks))
      fd.append("briefing", briefing.slice(0, MAX_BRIEFING_CHARS))

      setStatus("analyzing")
      const res = await fetch("/api/build", { method: "POST", body: fd })
      const json = (await res.json()) as any
      if (!res.ok) throw new Error(json?.message || json?.error || "Build failed")

      const data = json as AntiPortfolioData
      saveFlightLog(data)
      setStatus("done")
      router.push("/anti-portfolio")
    } catch (e) {
      setStatus("error")
      setError(e instanceof Error ? e.message : "Unknown error")
    }
  }

  const colors = themeColors.tech
  const isBusy = status === "uploading" || status === "analyzing" || status === "done"

  useEffect(() => {
    if (!hasAnySource) router.replace("/onboarding")
  }, [hasAnySource, router])

  if (!hasAnySource) return null

  return (
    <div className="relative min-h-screen text-white bg-[#02040A]">
      <StarBackground />
      <ShootingStars density="medium" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16">
        <div
          className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8"
          style={{ boxShadow: colors.glow }}
        >
          {/* Keep the form mounted to preserve exact card height; hide it while busy */}
          <div className={isBusy ? "opacity-0 pointer-events-none select-none" : "opacity-100"}>
            <p className="font-mono text-xs tracking-[0.3em] text-white/50">{"// BRIEFING DI MISSIONE"}</p>
            <h1 className="mt-4 text-4xl md:text-5xl font-space-grotesk font-bold">
              Step 2/2: raccontami chi sei <span style={{ color: colors.primary }}>(oltre al tuo ruolo)</span>
            </h1>
            <p className="mt-4 text-white/70 font-mono text-sm">
              Testo libero. L&apos;AI userà questo briefing insieme a CV e link per costruire un anti‑portfolio che mette al centro la persona.
            </p>

            <div className="mt-8 grid gap-4">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-mono text-white/60 tracking-wider">HINT</p>
                <ul className="mt-3 space-y-2 text-sm text-white/70">
                  <li>- Valori personali (cosa non tradisci mai, anche sotto pressione)</li>
                  <li>- Un fallimento che ti ha cambiato (cosa hai imparato davvero)</li>
                  <li>- Cosa ti dà energia / cosa ti drena</li>
                  <li>- Un esempio di scelta difficile: cosa hai sacrificato e perché</li>
                  <li>- Le tue “regole di missione” quando lavori con un team</li>
                </ul>
              </div>

              <label className="text-sm font-mono text-white/70">BRIEFING</label>
              <textarea
                value={briefing}
                onChange={(e) => setBriefing(e.target.value.slice(0, MAX_BRIEFING_CHARS))}
                placeholder="Scrivi qui. Puoi essere imperfetto: l’anti-portfolio nasce proprio da quello."
                rows={10}
                className="w-full resize-y rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white/85 outline-none focus:border-white/30"
              />
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-white/50">
                  {briefing.length}/{MAX_BRIEFING_CHARS}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => router.push("/onboarding")}
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-mono text-white/70 hover:bg-white/10"
                  >
                    Indietro
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={!canSubmit}
                    className="rounded-lg px-5 py-2.5 font-mono text-sm border border-white/10 bg-white/10 hover:bg-white/15 disabled:opacity-40 disabled:hover:bg-white/10"
                    style={{ boxShadow: canSubmit ? colors.glow : "none" }}
                  >
                    Genera Anti-Portfolio
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}
            </div>
          </div>

          {isBusy && (
            <MissionLoader
              embedded
              phase={status === "uploading" ? "uploading" : "analyzing"}
              primary={colors.primary}
              secondary={colors.secondary}
            />
          )}
        </div>
      </div>
    </div>
  )
}


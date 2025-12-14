"use client"

import { useRouter } from "next/navigation"
import { StarBackground } from "@/components/star-background"
import { ShootingStars } from "@/components/shooting-stars"
import { themeColors } from "@/lib/user-data"
import { useOnboarding } from "./layout"

export default function OnboardingPage() {
  const router = useRouter()

  const { files, setFiles, links, setLinks, setBriefing } = useOnboarding()

  // NOTE (Vercel): serverless functions have a strict request body size limit for multipart uploads.
  // Keep a conservative client-side cap to avoid production-only failures.
  const MAX_UPLOAD_TOTAL_BYTES = 4 * 1024 * 1024 // ~4MB total (safe headroom vs Vercel limits)
  const totalUploadBytes = files.reduce((sum, f) => sum + (f?.size || 0), 0)
  const uploadTooLarge = totalUploadBytes > MAX_UPLOAD_TOTAL_BYTES

  const canContinue = (files.length > 0 || links.some((l) => l.trim())) && !uploadTooLarge

  const addLink = () => setLinks([...links, ""])
  const removeLink = (idx: number) => setLinks(links.length > 1 ? links.filter((_, i) => i !== idx) : links)
  const updateLink = (idx: number, value: string) =>
    setLinks(links.map((v, i) => (i === idx ? value : v)))

  // Neutral colors for onboarding (cosmic cyan/violet), real theme is chosen by AI later
  const colors = themeColors.tech

  return (
    <div className="relative min-h-screen text-white bg-[#02040A]">
      <StarBackground />
      <ShootingStars density="medium" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16">
        <div
          className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8"
          style={{ boxShadow: colors.glow }}
        >
          <p className="font-mono text-xs tracking-[0.3em] text-white/50">{"// MISSION INTAKE"}</p>
          <h1 className="mt-4 text-4xl md:text-5xl font-space-grotesk font-bold">
            Dicci di te, poi preparemo il tuo <span style={{ color: colors.primary }}>Mission Recorder</span>
          </h1>
          <p className="mt-4 text-white/70 font-mono text-sm">
            Step 1/2: qui raccogliamo i materiali per la missione. Nel prossimo step ti chiederemo un breve briefing personale.
          </p>

          <div className="mt-10 grid gap-8">
            <section>
              <h2 className="font-mono text-sm text-white/80">CV (PDF)</h2>
              <p className="mt-2 text-white/50 text-sm">
                Puoi caricare uno o più file PDF. Consigliato: max ~4MB totali (limite upload in produzione su Vercel).
              </p>
              <input
                className="mt-4 block w-full text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:hover:bg-white/15"
                type="file"
                accept="application/pdf,.pdf"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
              />
              {files.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {files.map((f) => (
                    <li key={f.name} className="text-xs font-mono text-white/60">
                      {f.name} • {(f.size / 1024 / 1024).toFixed(2)} MB
                    </li>
                  ))}
                  <li className="text-xs font-mono text-white/50">
                    Totale: {(totalUploadBytes / 1024 / 1024).toFixed(2)} MB (limite consigliato:{" "}
                    {(MAX_UPLOAD_TOTAL_BYTES / 1024 / 1024).toFixed(2)} MB)
                  </li>
                </ul>
              )}
              {uploadTooLarge && (
                <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  Upload troppo grande per il deploy su Vercel. Riduci/comprimi i PDF (o caricane uno più leggero).
                </div>
              )}
            </section>

            <section>
              <h2 className="font-mono text-sm text-white/80">Link (LinkedIn / GitHub / Portfolio)</h2>
              <p className="mt-2 text-white/50 text-sm">Incolla i link ai tuoi profili. Limite: max 3 link.</p>

              <div className="mt-4 grid gap-3">
                {links.map((link, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      value={link}
                      onChange={(e) => updateLink(idx, e.target.value)}
                      placeholder="linkedin.com/in/..."
                      className="flex-1 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white/80 outline-none focus:border-white/30"
                    />
                    <button
                      type="button"
                      onClick={() => removeLink(idx)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono text-white/60 hover:bg-white/10"
                      disabled={links.length <= 1}
                    >
                      Rimuovi
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addLink}
                className="mt-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-mono text-white/70 hover:bg-white/10"
                disabled={links.length >= 3}
              >
                + Aggiungi link
              </button>
            </section>

            <section className="flex items-center justify-between gap-4">
              <div className="text-xs font-mono text-white/50">STATUS: READY</div>

              <button
                type="button"
                onClick={() => {
                  setBriefing("")
                  router.push("/onboarding/briefing")
                }}
                disabled={!canContinue}
                className="rounded-lg px-5 py-2.5 font-mono text-sm border border-white/10 bg-white/10 hover:bg-white/15 disabled:opacity-40 disabled:hover:bg-white/10"
                style={{ boxShadow: canContinue ? colors.glow : "none" }}
              >
                Continua
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}



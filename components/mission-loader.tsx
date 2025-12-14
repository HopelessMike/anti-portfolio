"use client"

import { useEffect, useMemo, useState } from "react"
import type { CSSProperties } from "react"
import { motion, AnimatePresence } from "framer-motion"

type LoaderPhase = "uploading" | "analyzing"

interface MissionLoaderProps {
  phase: LoaderPhase
  primary: string
  secondary: string
  embedded?: boolean
}

export function MissionLoader({ phase, primary, secondary, embedded = false }: MissionLoaderProps) {
  const [msgIdx, setMsgIdx] = useState(0)

  const messages = useMemo(
    () => [
      "Allacciate le cinture: stiamo scaldando i motori…",
      "Caricamento coordinate orbitali…",
      "Decrittazione delle costellazioni professionali…",
      "Calcolo traiettoria: valori prima dei titoli.",
      "Allineamento pianeti: competenze, esperienze, lezioni apprese…",
      "Controllo sistemi: niente CV, solo missioni.",
      "Stiamo disegnando la tua mappa stellare personale…",
      "Sincronizzazione con il centro di controllo…",
      "Telemetria stabile: proseguire con l’iniezione in orbita.",
      "Recupero segnali dai link di bordo…",
      "Ricostruzione della tua rotta: decisioni, incidenti, lezioni.",
      "Test dei propulsori emotivi: motivazioni e valori…",
      "Mappatura gravità: cosa ti attira davvero in un progetto?",
      "Scansione radar: pattern di lavoro e punti di forza.",
      "Compilazione del log di missione… quasi pronti al decollo.",
      "Aggancio orbitale completato… rifiniture finali.",
    ],
    [],
  )

  useEffect(() => {
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % messages.length), 3800)
    return () => clearInterval(t)
  }, [messages.length])

  const title = phase === "uploading" ? "Preparazione al lancio" : "Analisi in corso"
  const subtitle =
    phase === "uploading"
      ? "Stiamo caricando i materiali di missione."
      : "Creando il tuo Anti‑Portfolio. 1-2 minuti necessari"
  return (
    <div
      className={embedded ? "mission-loader mission-loader--embedded" : "mission-loader mission-loader--fullscreen"}
      style={
        {
          ["--ml-primary" as any]: primary,
          ["--ml-secondary" as any]: secondary,
        } as CSSProperties
      }
    >
      <div className="mission-loader__overlay" />

      <div className="mission-loader__content">
        <div className="mission-loader__anim" aria-hidden="true">
          <div>
            <div className="box-of-star1">
              <div className="star star-position1" />
              <div className="star star-position2" />
              <div className="star star-position3" />
              <div className="star star-position4" />
              <div className="star star-position5" />
              <div className="star star-position6" />
              <div className="star star-position7" />
            </div>
            <div className="box-of-star2">
              <div className="star star-position1" />
              <div className="star star-position2" />
              <div className="star star-position3" />
              <div className="star star-position4" />
              <div className="star star-position5" />
              <div className="star star-position6" />
              <div className="star star-position7" />
            </div>
            <div className="box-of-star3">
              <div className="star star-position1" />
              <div className="star star-position2" />
              <div className="star star-position3" />
              <div className="star star-position4" />
              <div className="star star-position5" />
              <div className="star star-position6" />
              <div className="star star-position7" />
            </div>
            <div className="box-of-star4">
              <div className="star star-position1" />
              <div className="star star-position2" />
              <div className="star star-position3" />
              <div className="star star-position4" />
              <div className="star star-position5" />
              <div className="star star-position6" />
              <div className="star star-position7" />
            </div>
            <div data-js="astro" className="astronaut">
              <div className="head" />
              <div className="arm arm-left" />
              <div className="arm arm-right" />
              <div className="body">
                <div className="panel" />
              </div>
              <div className="leg leg-left" />
              <div className="leg leg-right" />
              <div className="schoolbag" />
            </div>
          </div>
        </div>

        <div className="mission-loader__text">
          <p className="mission-loader__kicker font-mono text-xs tracking-[0.3em] text-white/50">{"// MISSION STATUS"}</p>
          <h2 className="mission-loader__title font-space-grotesk text-3xl md:text-4xl font-bold">{title}</h2>
          <p className="mission-loader__subtitle font-mono text-sm text-white/70 mt-2">{subtitle}</p>

          <div className="mission-loader__msg mt-6">
            <AnimatePresence mode="wait">
              <motion.p
                key={msgIdx}
                className="mission-loader__msgText font-mono text-sm text-white/80"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                {messages[msgIdx]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

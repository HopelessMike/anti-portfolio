"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { motion } from "framer-motion"
import { getBackgroundAudioTrackFile } from "@/lib/audio-tracks"

interface BackgroundAudioProps {
  trackId?: string | null
  volume?: number | null
}

export function BackgroundAudio({ trackId, volume }: BackgroundAudioProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isReady, setIsReady] = useState(false)

  const src = useMemo(() => getBackgroundAudioTrackFile(trackId) ?? null, [trackId])
  const vol = useMemo(() => {
    const v = typeof volume === "number" ? volume : 0.3
    return Math.max(0, Math.min(1, v))
  }, [volume])

  const applyState = useCallback(() => {
    const el = audioRef.current
    if (!el) return
    el.volume = vol
    el.muted = isMuted
  }, [isMuted, vol])

  const tryPlay = useCallback(async () => {
    const el = audioRef.current
    if (!el) return
    try {
      await el.play()
    } catch {
      // Autoplay will fail until a user gesture; we keep listeners active until it succeeds.
    }
  }, [])

  // Keep element state in sync
  useEffect(() => {
    applyState()
  }, [applyState])

  // Autoplay-on-first-interaction (recommended policy)
  useEffect(() => {
    if (!src) return
    const onFirstGesture = async () => {
      // On first gesture we unmute and attempt playback.
      setIsMuted(false)
      await Promise.resolve()
      await tryPlay()
    }

    const opts: AddEventListenerOptions = { passive: true, once: true }
    window.addEventListener("pointerdown", onFirstGesture, opts)
    window.addEventListener("keydown", onFirstGesture, opts)
    window.addEventListener("wheel", onFirstGesture, opts)
    window.addEventListener("touchstart", onFirstGesture, opts)

    return () => {
      window.removeEventListener("pointerdown", onFirstGesture)
      window.removeEventListener("keydown", onFirstGesture)
      window.removeEventListener("wheel", onFirstGesture)
      window.removeEventListener("touchstart", onFirstGesture)
    }
  }, [src, tryPlay])

  // If src changes, pause and reset readiness
  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    setIsReady(false)
    el.pause()
    el.currentTime = 0
  }, [src])

  if (!src) return null

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        loop
        preload="auto"
        onCanPlay={() => setIsReady(true)}
        onError={() => setIsReady(false)}
      />

      <motion.button
        type="button"
        className="fixed top-6 right-6 z-30 inline-flex items-center gap-2 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 px-3 py-2 font-mono text-xs text-white/70 hover:bg-white/10"
        onClick={async () => {
          const nextMuted = !isMuted
          setIsMuted(nextMuted)
          await Promise.resolve()
          if (!nextMuted) await tryPlay()
        }}
        aria-label={isMuted ? "Unmute background audio" : "Mute background audio"}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX className="h-4 w-4 text-white/70" /> : <Volume2 className="h-4 w-4 text-white/70" />}
        <span className="select-none">{isMuted ? "AUDIO: OFF" : isReady ? "AUDIO: ON" : "AUDIO: ..."}</span>
      </motion.button>
    </>
  )
}


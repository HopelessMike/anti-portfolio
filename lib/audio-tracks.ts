export const BACKGROUND_AUDIO_TRACKS = [
  {
    id: "orbital_drift_ambient",
    file: "/audio/orbital_drift_ambient.mp3",
    title: "Orbital Drift (Ambient)",
    description:
      "Ambient spaziale, pad morbidi e texture \"cosmic dust\". Pochissime percussioni, mood contemplativo e umano. Loop seamless 2–3 minuti.",
  },
  {
    id: "signal_glass_glitch",
    file: "/audio/signal_glass_glitch.mp3",
    title: "Signal Glass (Glitch Minimal)",
    description:
      "Elettronica minimale premium con micro‑glitch e suoni da telemetria/data. Clean, moderna, adatta a profili engineering/data. Loop seamless 2–3 minuti.",
  },
  {
    id: "neon_orbit_synthwave",
    file: "/audio/neon_orbit_synthwave.mp3",
    title: "Neon Orbit (Modern Synthwave)",
    description:
      "Synthwave leggero (non caricaturale), bassline morbida, arpeggi e atmosfera notturna. Energica ma elegante, adatta a design/creative tech. Loop seamless 2–3 minuti.",
  },
  {
    id: "golden_launch_chillhop",
    file: "/audio/golden_launch_chillhop.mp3",
    title: "Golden Launch (Chillhop)",
    description:
      "Chillhop caldo, drums soft, Rhodes/piano, vibe positiva e affidabile. Ottima per marketing/growth/brand e profili comunicativi. Loop seamless 2–3 minuti.",
  },
  {
    id: "quiet_gravity_piano",
    file: "/audio/quiet_gravity_piano.mp3",
    title: "Quiet Gravity (Cinematic Piano)",
    description:
      "Piano cinematico + pad, emotivo ma non drammatico. Ritmo lento, spazio e respiro. Adatto a leadership/strategy/people. Loop seamless 2–3 minuti.",
  },
  {
    id: "gravity_waves_downtempo",
    file: "/audio/gravity_waves_downtempo.mp3",
    title: "Gravity Waves (Downtempo)",
    description:
      "Downtempo moderno con groove sottile e soundscape spaziale neutro. Perfetta come fallback universale. Loop seamless 2–3 minuti.",
  },
] as const

export type BackgroundAudioTrackId = (typeof BACKGROUND_AUDIO_TRACKS)[number]["id"]

export const BACKGROUND_AUDIO_TRACK_IDS = BACKGROUND_AUDIO_TRACKS.map((t) => t.id) as readonly BackgroundAudioTrackId[]

export function getBackgroundAudioTrackFile(id: string | undefined | null): string | null {
  const found = BACKGROUND_AUDIO_TRACKS.find((t) => t.id === id)
  return found?.file ?? null
}


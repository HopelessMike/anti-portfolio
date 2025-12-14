import type { UserData } from "@/lib/user-data"

function nonEmpty(s: unknown, fallback: string) {
  const v = typeof s === "string" ? s.trim() : ""
  return v.length ? v : fallback
}

function nonEmptyList(xs: unknown, fallback: string[]) {
  if (!Array.isArray(xs)) return fallback
  const out = xs.filter((x) => typeof x === "string").map((x) => (x as string).trim()).filter(Boolean)
  return out.length ? out : fallback
}

function clamp01(n: unknown, fallback: number) {
  const v = typeof n === "number" && Number.isFinite(n) ? n : fallback
  return Math.max(0, Math.min(1, v))
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function assignOrbit(valuesCount: number, minR: number, maxR: number) {
  if (valuesCount <= 0) return []
  if (valuesCount === 1) return [Math.round((minR + maxR) / 2)]
  const step = (maxR - minR) / (valuesCount - 1)
  return Array.from({ length: valuesCount }, (_, i) => Math.round(minR + i * step))
}

function assignSpeeds(valuesCount: number, minS: number, maxS: number) {
  if (valuesCount <= 0) return []
  if (valuesCount === 1) return [Math.round((minS + maxS) / 2)]
  const step = (maxS - minS) / (valuesCount - 1)
  return Array.from({ length: valuesCount }, (_, i) => Math.round(minS + i * step))
}

export function normalizeUserData(input: UserData): UserData {
  const ud = input

  const skillsBase = (ud.skills || []).map((s, idx) => {
    const name = nonEmpty(s.name, `Skill ${idx + 1}`)
    const description = nonEmpty(s.description, `Come uso ${name} nelle mie missioni.`)
    const hoverInfo = nonEmpty(s.hoverInfo, description.length > 64 ? `${description.slice(0, 61)}…` : description)
    return { ...s, name, description, hoverInfo }
  })

  const socialLinksBase = (ud.socialLinks || []).map((s, idx) => {
    const name = nonEmpty(s.name, `Link ${idx + 1}`)
    const previewDescription = nonEmpty(s.previewDescription, `Apri ${name} per i dettagli.`)
    const hoverInfo = nonEmpty(s.hoverInfo, previewDescription.length > 64 ? `${previewDescription.slice(0, 61)}…` : previewDescription)
    return { ...s, name, previewDescription, hoverInfo }
  })

  const lessonsLearnedBase = (ud.lessonsLearned || []).map((l, idx) => {
    const title = nonEmpty(l.title, `Lesson ${idx + 1}`)
    const incidentReport = nonEmpty(l.incidentReport, "Evento critico registrato durante la missione.")
    const lessonExtracted = nonEmpty(l.lessonExtracted, "Lezione estratta: adattarsi, osservare, migliorare.")
    const hoverInfo = nonEmpty(l.hoverInfo, lessonExtracted.length > 64 ? `${lessonExtracted.slice(0, 61)}…` : lessonExtracted)
    const quote = nonEmpty(l.quote, "“Ogni errore è un dato.”")
    return { ...l, title, incidentReport, lessonExtracted, hoverInfo, quote }
  })

  // --- Solar system layout normalization ---
  // The AI may generate orbitRadius values that overlap or exceed the viewport.
  // We make orbits deterministic and always visible inside the 1100px container.
  const skills = (() => {
    const sorted = [...skillsBase].sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0))
    const radii = assignOrbit(sorted.length, 140, 520)
    const speeds = assignSpeeds(sorted.length, 18, 60)
    const patched = sorted.map((s, i) => ({
      ...s,
      orbitRadius: radii[i] ?? clamp(Number(s.orbitRadius) || 220, 140, 520),
      speed: clamp(Number(s.speed) || speeds[i] || 30, 10, 120),
    }))
    // Restore original order by id (stable enough for UI / projects.skillId linking)
    return patched.sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
  })()

  const socialLinks = (() => {
    const sorted = [...socialLinksBase]
    const radii = assignOrbit(sorted.length, 560, 640)
    const speeds = assignSpeeds(sorted.length, 30, 70)
    return sorted.map((s, i) => ({
      ...s,
      orbitRadius: radii[i] ?? clamp(Number(s.orbitRadius) || 600, 520, 680),
      speed: clamp(Number(s.speed) || speeds[i] || 55, 10, 140),
    }))
  })()

  const lessonsLearned = (() => {
    const sorted = [...lessonsLearnedBase]
    const radii = assignOrbit(sorted.length, 420, 560)
    const speeds = assignSpeeds(sorted.length, 26, 54)
    return sorted.map((l, i) => ({
      ...l,
      orbitRadius: radii[i] ?? clamp(Number(l.orbitRadius) || 500, 360, 620),
      speed: clamp(Number(l.speed) || speeds[i] || 40, 10, 160),
    }))
  })()

  const failure = {
    ...ud.failure,
    title: nonEmpty(ud.failure?.title, "Anomalia di Missione"),
    lesson: nonEmpty(ud.failure?.lesson, "Lezione: correggere rotta e ripartire."),
    story: nonEmpty(ud.failure?.story, "Un evento critico ha costretto a ricalibrare la traiettoria."),
  }

  const backgroundAudio = {
    trackId: nonEmpty((ud as any).backgroundAudio?.trackId, "gravity_waves_downtempo"),
    volume: clamp01((ud as any).backgroundAudio?.volume, 0.3),
  }

  return {
    ...ud,
    name: nonEmpty(ud.name, "Anonymous Explorer"),
    role: nonEmpty(ud.role, "Mission Specialist"),
    manifesto: nonEmpty(ud.manifesto, "Trasformo esperienze in traiettorie migliori."),
    identityNegations: nonEmptyList((ud as any).identityNegations, [
      "Non sono il mio [[job title]].",
      "Non sono i miei [[deliverable]].",
      "Non sono gli [[strumenti]] che uso.",
      "Non sono le mie [[certificazioni]].",
      "Non sono il mio [[CV]].",
    ]),
    backgroundAudio,
    core: nonEmpty(ud.core, "Curiosity"),
    coreDescription: nonEmpty(ud.coreDescription, "Il mio faro quando tutto diventa complesso."),
    skills,
    socialLinks,
    lessonsLearned,
    projects: ud.projects || [],
    failure,
  }
}



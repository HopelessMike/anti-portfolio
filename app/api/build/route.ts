import { NextResponse } from "next/server"
import { AntiPortfolioDataSchema } from "@/lib/schemas/anti-portfolio-data"
import type { ProfileAnalysis } from "@/lib/types/profile-analysis"
import { serverConfig } from "@/lib/server/config"
import { withRetry } from "@/lib/server/retry"
import { extractTextFromPdfBuffer, extractTextFromUrl, normalizeUrl } from "@/lib/server/content-extractor"
import { getOpenAIClient } from "@/lib/server/openai"
import { PROFILE_ANALYSIS_PROMPT, ANTI_PORTFOLIO_GENERATION_PROMPT } from "@/lib/server/prompts"

export const runtime = "nodejs"
export const maxDuration = 300

function tokenParam(model: string, n: number): { max_completion_tokens?: number; max_tokens?: number } {
  const m = (model || "").toLowerCase()
  // chatgpt-5* models use `max_completion_tokens` (and reject `max_tokens`).
  if (m.includes("chatgpt-5") || m.includes("gpt-5")) return { max_completion_tokens: n }
  return { max_tokens: n }
}

function stripCodeFences(raw: string): string {
  // Common failure mode when JSON mode isn't active: the model wraps output in ```json ... ```.
  const m = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  return (m?.[1] ?? raw).trim()
}

function extractFirstJsonObjectString(raw: string): string | null {
  // Extract the first balanced {...} JSON object, ignoring braces inside strings.
  const s = stripCodeFences(raw)
  const start = s.indexOf("{")
  if (start < 0) return null

  let depth = 0
  let inString = false
  let escaped = false

  for (let i = start; i < s.length; i++) {
    const ch = s[i]

    if (escaped) {
      escaped = false
      continue
    }

    if (ch === "\\") {
      if (inString) escaped = true
      continue
    }

    if (ch === '"') {
      inString = !inString
      continue
    }

    if (inString) continue

    if (ch === "{") depth++
    if (ch === "}") depth--

    if (depth === 0) {
      return s.slice(start, i + 1)
    }
  }

  return null
}

function tryJsonRepair(raw: string): string {
  // Best-effort repair for the most common JSON issues when the model isn't in JSON mode.
  // NOTE: This is intentionally conservative; we still validate strictly via Zod later.
  let s = stripCodeFences(raw)
  // Remove trailing commas: {"a":1,} or [1,2,]
  s = s.replace(/,\s*([}\]])/g, "$1")
  // Normalize smart quotes that sometimes appear in model output.
  s = s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
  return s.trim()
}

function safeJsonParse<T>(raw: string): T {
  const candidates: string[] = []
  const trimmed = raw.trim()
  if (trimmed) candidates.push(trimmed)

  const extracted = extractFirstJsonObjectString(raw)
  if (extracted && extracted !== trimmed) candidates.push(extracted)

  const repaired = tryJsonRepair(raw)
  if (repaired && repaired !== trimmed && repaired !== extracted) candidates.push(repaired)

  const extractedFromRepaired = extractFirstJsonObjectString(repaired)
  if (extractedFromRepaired && extractedFromRepaired !== trimmed && extractedFromRepaired !== extracted) candidates.push(extractedFromRepaired)

  let lastErr: unknown
  for (const c of candidates) {
    try {
      return JSON.parse(c) as T
    } catch (e) {
      lastErr = e
    }
  }

  // Keep the error message stable and actionable for the UI.
  // (The underlying error often is a SyntaxError due to non-JSON output or truncation.)
  const details = lastErr instanceof Error ? lastErr.message : "unknown parse error"
  throw new Error(
    `Invalid JSON from model (${details}). ` +
      `Ensure OPENAI_MODEL supports JSON output and that the SDK params are correct (max_tokens, response_format).`,
  )
}

function normalizeUrlLike(input: unknown): string {
  const s = typeof input === "string" ? input.trim() : ""
  if (!s) return "https://example.com"
  if (/^https?:\/\//i.test(s)) return s
  // Handle common "linkedin.com/..." or "www..." cases
  return `https://${s.replace(/^\/+/, "")}`
}

function clampNumber(x: unknown, min: number, max: number, fallback: number) {
  const n = typeof x === "number" && Number.isFinite(x) ? x : Number(x)
  const v = Number.isFinite(n) ? n : fallback
  return Math.max(min, Math.min(max, v))
}

function clampInt(x: unknown, min: number, max: number, fallback: number) {
  const v = Math.round(clampNumber(x, min, max, fallback))
  return Math.max(min, Math.min(max, v))
}

function sanitizeAntiPortfolioCandidate(
  raw: any,
  ctx: { filesCount: number; linksCount: number; nameHint?: string | null },
) {
  const nowIso = new Date().toISOString()
  const data: any = raw && typeof raw === "object" ? raw : {}
  data.version = "1.0"
  data.generatedAt = typeof data.generatedAt === "string" && data.generatedAt.trim() ? data.generatedAt : nowIso

  data.userData = data.userData && typeof data.userData === "object" ? data.userData : {}
  const ud = data.userData

  ud.name = typeof ud.name === "string" ? ud.name : ""
  ud.role = typeof ud.role === "string" ? ud.role : ""
  ud.theme = typeof ud.theme === "string" ? ud.theme : "tech"
  ud.manifesto = typeof ud.manifesto === "string" ? ud.manifesto : ""
  ud.identityNegations = Array.isArray(ud.identityNegations) ? ud.identityNegations.filter((x: any) => typeof x === "string") : []
  ud.core = typeof ud.core === "string" ? ud.core : ""
  ud.coreDescription = typeof ud.coreDescription === "string" ? ud.coreDescription : ""

  ud.backgroundAudio = ud.backgroundAudio && typeof ud.backgroundAudio === "object" ? ud.backgroundAudio : {}
  ud.backgroundAudio.trackId = typeof ud.backgroundAudio.trackId === "string" ? ud.backgroundAudio.trackId : "gravity_waves_downtempo"
  ud.backgroundAudio.volume = clampNumber(ud.backgroundAudio.volume, 0, 1, 0.3)

  // Arrays normalization + numeric clamps to satisfy the Zod schema and prevent retry loops.
  ud.skills = Array.isArray(ud.skills) ? ud.skills.slice(0, 7) : []
  ud.skills = ud.skills.map((s: any, idx: number) => ({
    id: clampInt(s?.id ?? idx, 0, 9999, idx + 1),
    name: typeof s?.name === "string" ? s.name : `Skill ${idx + 1}`,
    type: ud.theme,
    planetType: "skill",
    level: clampNumber(s?.level, 0, 100, 70),
    orbitRadius: clampNumber(s?.orbitRadius, 50, 800, 220),
    speed: clampNumber(s?.speed, 5, 200, 35),
    description: typeof s?.description === "string" ? s.description : "",
    relevance: clampInt(s?.relevance, 1, 10, 7),
    hoverInfo: typeof s?.hoverInfo === "string" ? s.hoverInfo : "",
  }))

  ud.projects = Array.isArray(ud.projects) ? ud.projects.slice(0, 4) : []
  ud.projects = ud.projects.map((p: any, idx: number) => ({
    id: clampInt(p?.id ?? idx, 0, 9999, idx + 1),
    title: typeof p?.title === "string" ? p.title : `Missione ${idx + 1}`,
    skillId: clampInt(p?.skillId, 0, 9999, ud.skills?.[0]?.id ?? 1),
    description: typeof p?.description === "string" ? p.description : "",
    outcome: typeof p?.outcome === "string" ? p.outcome : "",
    tags: Array.isArray(p?.tags) ? p.tags.filter((t: any) => typeof t === "string") : [],
  }))

  ud.lessonsLearned = Array.isArray(ud.lessonsLearned) ? ud.lessonsLearned.slice(0, 2) : []
  ud.lessonsLearned = ud.lessonsLearned.map((l: any, idx: number) => ({
    id: typeof l?.id === "string" ? l.id : `lesson-${idx + 1}`,
    title: typeof l?.title === "string" ? l.title : `Lezione ${idx + 1}`,
    year: clampInt(l?.year, 1900, 2100, new Date().getUTCFullYear()),
    incidentReport: typeof l?.incidentReport === "string" ? l.incidentReport : "",
    lessonExtracted: typeof l?.lessonExtracted === "string" ? l.lessonExtracted : "",
    quote: typeof l?.quote === "string" ? l.quote : "“info non disponibile”",
    orbitRadius: clampNumber(l?.orbitRadius, 50, 1000, 520),
    speed: clampNumber(l?.speed, 5, 200, 40),
    relevance: clampInt(l?.relevance, 1, 10, 8),
    hoverInfo: typeof l?.hoverInfo === "string" ? l.hoverInfo : "",
  }))

  ud.socialLinks = Array.isArray(ud.socialLinks) ? ud.socialLinks.slice(0, 3) : []
  ud.socialLinks = ud.socialLinks.map((sl: any, idx: number) => {
    const id = typeof sl?.id === "string" ? sl.id : ["linkedin", "github", "portfolio"][idx] || "portfolio"
    const icon = (id === "linkedin" || id === "github" || id === "portfolio") ? id : "portfolio"
    return {
      id,
      name: typeof sl?.name === "string" ? sl.name : id,
      planetType: "social",
      url: normalizeUrlLike(sl?.url),
      icon,
      orbitRadius: clampNumber(sl?.orbitRadius, 50, 800, 620),
      speed: clampNumber(sl?.speed, 5, 200, 55),
      relevance: clampInt(sl?.relevance, 1, 10, 7),
      hoverInfo: typeof sl?.hoverInfo === "string" ? sl.hoverInfo : "",
      previewDescription: typeof sl?.previewDescription === "string" ? sl.previewDescription : "",
    }
  })

  ud.failure = ud.failure && typeof ud.failure === "object" ? ud.failure : {}
  ud.failure.title = typeof ud.failure.title === "string" ? ud.failure.title : "Anomalia di Missione"
  ud.failure.lesson = typeof ud.failure.lesson === "string" ? ud.failure.lesson : ""
  ud.failure.story = typeof ud.failure.story === "string" ? ud.failure.story : ""

  data.meta = data.meta && typeof data.meta === "object" ? data.meta : {}
  data.meta.sourceSummary = data.meta.sourceSummary && typeof data.meta.sourceSummary === "object" ? data.meta.sourceSummary : {}
  data.meta.sourceSummary.filesCount = ctx.filesCount
  data.meta.sourceSummary.linksCount = ctx.linksCount
  data.meta.confidence = clampNumber(data.meta.confidence, 0, 1, 0.5)
  data.meta.limitations = Array.isArray(data.meta.limitations) ? data.meta.limitations.filter((x: any) => typeof x === "string") : []

  // Keep existing enforcement logic (placeholders, job-title-as-name), but apply it *before* schema validation.
  return enforceRealName(enforceCounts(data), ctx.nameHint || undefined)
}

async function analyzeProfile(openai: ReturnType<typeof getOpenAIClient>, content: string, filesCount: number, linksCount: number) {
  const resp = await openai.chat.completions.create({
    model: serverConfig.openaiModel,
    messages: [
      { role: "system", content: "Return valid JSON only. No markdown. No extra text. Do NOT invent facts; if uncertain, omit." },
      { role: "user", content: `${PROFILE_ANALYSIS_PROMPT}\n\n${content}` },
    ],
    ...tokenParam(serverConfig.openaiModel, 4000),
    response_format: { type: "json_object" },
  })

  const raw = resp.choices[0]?.message?.content || ""
  const parsed = safeJsonParse<ProfileAnalysis>(raw)

  // Ensure new fields exist (backward compatible if older cached JSON is used).
  parsed.person = parsed.person && typeof parsed.person === "object" ? parsed.person : ({ name: "" } as any)
  parsed.person.name = typeof (parsed as any).person?.name === "string" ? (parsed as any).person.name.trim() : ""

  // Normalize confidence sources quickly (best-effort)
  parsed.confidence = parsed.confidence || { overall: 0.5, sources: { files: 0, web: 0 } }
  parsed.confidence.sources = parsed.confidence.sources || { files: 0, web: 0 }
  parsed.confidence.sources.files = Math.min(10, Math.max(0, filesCount))
  parsed.confidence.sources.web = Math.min(10, Math.max(0, linksCount))

  return parsed
}

async function generateAntiPortfolio(
  openai: ReturnType<typeof getOpenAIClient>,
  input: { analysis: ProfileAnalysis; links: string[]; filesCount: number; linksCount: number; nameHint?: string },
) {
  const resp = await openai.chat.completions.create({
    model: serverConfig.openaiModel,
    messages: [
      { role: "system", content: "Return valid JSON only. No markdown. No extra text. Do NOT invent stories or facts." },
      {
        role: "user",
        content:
          `${ANTI_PORTFOLIO_GENERATION_PROMPT}\n\n` +
          `Name hint (do NOT invent names; if unknown, use the hint or "Anonymous Explorer"): ${input.nameHint || ""}\n\n` +
          `INPUT (ProfileAnalysis JSON):\n${JSON.stringify(input.analysis)}\n\n` +
          `INPUT (links):\n${JSON.stringify(input.links)}\n\n` +
          `Hard constraints:\n` +
          `- skills: exactly 7 items\n` +
          `- projects: exactly 4 items\n` +
          `- lessonsLearned: exactly 2 items\n` +
          `- role: MUST NOT be a real-world job title; it must be a sci-fi mission role (Italian)\n` +
          `- identityNegations: exactly 5 items (Italian only, each starts with "Non sono" or "Io non sono"; include [[highlight]] markers)\n` +
          `- theme: choose exactly one of tech|marketing|design based on the profile\n` +
          `- name: use the real person name if present in the content; NEVER use placeholder names like "Mario Rossi", "Marco Rossi", "John Doe", "Alex Cosmo"\n` +
          `- Anti-portfolio rule: skills MUST be human capabilities/principles (NO tool/tech/certification names); projects must read like missions and focus on learning & human impact.\n` +
          `Set meta.sourceSummary.filesCount=${input.filesCount} and meta.sourceSummary.linksCount=${input.linksCount}.\n` +
          `Set generatedAt to current ISO date.\n`,
      },
    ],
    ...tokenParam(serverConfig.openaiModel, 5000),
    response_format: { type: "json_object" },
  })

  const raw = resp.choices[0]?.message?.content || ""
  const parsed = safeJsonParse<any>(raw)

  // Sanitize before strict schema validation to avoid long retry loops on minor formatting/range issues.
  const coerced = sanitizeAntiPortfolioCandidate(parsed, {
    filesCount: input.filesCount,
    linksCount: input.linksCount,
    nameHint: input.nameHint,
  })

  return AntiPortfolioDataSchema.parse(coerced)
}

function enforceCounts(data: any) {
  const ud = data?.userData
  if (!ud) return data

  if (Array.isArray(ud.skills)) ud.skills = ud.skills.slice(0, 7)
  if (Array.isArray(ud.projects)) ud.projects = ud.projects.slice(0, 4)
  if (Array.isArray(ud.lessonsLearned)) ud.lessonsLearned = ud.lessonsLearned.slice(0, 2)
  if (Array.isArray(ud.socialLinks)) ud.socialLinks = ud.socialLinks.slice(0, 3)

  const allowed = new Set(["tech", "marketing", "design"])
  if (!allowed.has(ud.theme)) ud.theme = "tech"

  return data
}

function isPlaceholderName(name: string): boolean {
  const n = name.trim().toLowerCase()
  if (!n) return true
  const bad = new Set([
    "alex cosmo",
    "marco rossi",
    "mario rossi",
    "john doe",
    "jane doe",
    "full name",
    "nome cognome",
  ])
  if (bad.has(n)) return true
  if (n.includes("cosmo")) return true
  return false
}

function looksLikeJobTitleAsName(name: string): boolean {
  const n = name.trim().toLowerCase()
  if (!n) return true
  const tokens = n.split(/\s+/).filter(Boolean)
  const jobTokens = new Set([
    "consultant",
    "engineer",
    "developer",
    "designer",
    "manager",
    "analyst",
    "specialist",
    "director",
    "officer",
    "architect",
    "customer",
    "transformation",
    "marketing",
    "sales",
    "growth",
    "product",
    "data",
  ])
  // If any token is a strong job keyword, it's suspicious for a personal name.
  return tokens.some((t) => jobTokens.has(t))
}

function enforceRealName(data: any, nameHint?: string | null) {
  const ud = data?.userData
  if (!ud) return data
  const currentName = String(ud.name || "")
  const currentInvalid = !currentName || isPlaceholderName(currentName) || looksLikeJobTitleAsName(currentName)
  if (currentInvalid) {
    const hint = typeof nameHint === "string" ? nameHint : ""
    const hintInvalid = !hint || isPlaceholderName(hint) || looksLikeJobTitleAsName(hint)
    ud.name = hintInvalid ? "Anonymous Explorer" : hint
  }
  return data
}

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const files = form.getAll("files").filter((x): x is File => x instanceof File)
    const linksRaw = form.get("links")
    const briefingRaw = form.get("briefing")

    const links: string[] = (() => {
      if (!linksRaw) return []
      if (typeof linksRaw !== "string") return []
      try {
        const parsed = JSON.parse(linksRaw)
        if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === "string").map(normalizeUrl)
        return []
      } catch {
        return []
      }
    })()

    const briefing = typeof briefingRaw === "string" ? briefingRaw.trim() : ""

    if (files.length === 0 && links.length === 0) {
      return NextResponse.json({ error: "At least one file or one link is required" }, { status: 400 })
    }

    // Extract content
    const fileTexts: string[] = []
    for (const f of files) {
      if (f.size > serverConfig.uploadMaxSizeBytes) continue
      const ab = await f.arrayBuffer()
      const buf = Buffer.from(ab)
      const isPdf = (f.type || "").includes("pdf") || (f.name || "").toLowerCase().endsWith(".pdf")
      if (!isPdf) continue
      const text = await withRetry(() => extractTextFromPdfBuffer(buf), { maxRetries: serverConfig.maxRetries, operation: `pdf:${f.name}` })
      if (text) fileTexts.push(`=== File: ${f.name} ===\n${text}`)
    }

    const webTexts: string[] = []
    for (const u of links.slice(0, 3)) {
      const text = await withRetry(() => extractTextFromUrl(u), { maxRetries: 1, operation: `web:${u}` })
      if (text) webTexts.push(`=== Web: ${u} ===\n${text}`)
    }

    const briefingBlock = briefing ? `=== User Narrative (Briefing di missione) ===\n${briefing}` : ""
    const combined = [briefingBlock, ...fileTexts, ...webTexts].filter(Boolean).join("\n\n").trim()
    if (!combined) {
      return NextResponse.json({ error: "No content could be extracted from the provided files and links" }, { status: 400 })
    }

    // AI
    const openai = getOpenAIClient()
    const analysis = await withRetry(() => analyzeProfile(openai, combined, files.length, links.length), {
      maxRetries: serverConfig.maxRetries,
      operation: "ai:analyze",
    })

    const nameHint = (analysis as any)?.person?.name ? String((analysis as any).person.name).trim() : undefined

    const antiPortfolio = await withRetry(
      () =>
        generateAntiPortfolio(openai, {
          analysis,
          links,
          filesCount: files.length,
          linksCount: links.length,
          nameHint: nameHint || undefined,
        }),
      { maxRetries: serverConfig.maxRetries, operation: "ai:generate" },
    )

    return NextResponse.json(antiPortfolio, { status: 200 })
  } catch (err) {
    return NextResponse.json(
      { error: "Build failed", message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    )
  }
}



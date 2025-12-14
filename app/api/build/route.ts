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

function safeJsonParse<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T
  } catch {
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error("Invalid JSON from model")
    return JSON.parse(match[0]) as T
  }
}

async function analyzeProfile(openai: ReturnType<typeof getOpenAIClient>, content: string, filesCount: number, linksCount: number) {
  const resp = await openai.chat.completions.create({
    model: serverConfig.openaiModel,
    messages: [
      { role: "system", content: "Return valid JSON only. No markdown. No extra text. Do NOT invent facts; if uncertain, omit and note in limitations." },
      { role: "user", content: `${PROFILE_ANALYSIS_PROMPT}\n\n${content}` },
    ],
    max_completion_tokens: 4000,
    response_format: { type: "json_object" },
  })

  const raw = resp.choices[0]?.message?.content || ""
  const parsed = safeJsonParse<ProfileAnalysis>(raw)

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
      { role: "system", content: "Return valid JSON only. No markdown. No extra text. Do NOT invent stories or facts; if unsupported by INPUT, say info not available and add limitations." },
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
          `- Non-fabrication rule: DO NOT invent incidents, years, companies, metrics, quotes, or story details; if missing, state "info non disponibile" and add to meta.limitations.\n` +
          `Set meta.sourceSummary.filesCount=${input.filesCount} and meta.sourceSummary.linksCount=${input.linksCount}.\n` +
          `Set generatedAt to current ISO date.\n`,
      },
    ],
    max_completion_tokens: 5000,
    response_format: { type: "json_object" },
  })

  const raw = resp.choices[0]?.message?.content || ""
  const parsed = safeJsonParse<unknown>(raw)

  // Validate and return
  const validated = AntiPortfolioDataSchema.parse(parsed)
  return validated
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

function guessNameFromLinkedIn(links: string[]): string | null {
  for (const l of links) {
    const m = l.match(/linkedin\.com\/in\/([^\/\?\#]+)/i)
    if (!m) continue
    const slug = decodeURIComponent(m[1])
      .replace(/[^a-zA-Z0-9\-\_]/g, "")
      .replace(/[_]/g, "-")
      .trim()
    const parts = slug.split("-").filter(Boolean)
    // Skip very short/obviously non-name slugs
    if (parts.length < 2) continue
    const name = parts
      .slice(0, 4)
      .map((p) => (p.length ? p[0].toUpperCase() + p.slice(1).toLowerCase() : p))
      .join(" ")
    if (name.length >= 5) return name
  }
  return null
}

function guessNameFromCvText(text: string): string | null {
  const cleaned = text.replace(/\r/g, "\n")
  // Try explicit label patterns
  const labeled = cleaned.match(/(?:^|\n)\s*(?:nome\s*[:\-]\s*)([^\n]{3,80})/i)
  if (labeled?.[1]) {
    const candidate = labeled[1].trim()
    if (candidate.split(/\s+/).length >= 2) return candidate
  }

  const titleize = (s: string) =>
    s
      .replace(/[#]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
      .join(" ")

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
    "product",
    "data",
    "marketing",
    "customer",
    "transformation",
    "trasformation",
  ])

  const sectionTokens = new Set([
    "profilo",
    "personale",
    "istruzione",
    "lingue",
    "contatti",
    "competenze",
    "esperienze",
    "lavorative",
    "curriculum",
    "vitae",
    "resume",
    "cv",
  ])

  // If pdf text comes as a single long line, try to pick an ALL CAPS "NAME SURNAME" very early.
  const head = cleaned
    .slice(0, 800)
    .replace(/[#]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  const capsRegex = /([A-ZÀ-ÖØ-Ý]{2,}(?:\s+[A-ZÀ-ÖØ-Ý]{2,}){1,2})/g
  for (const match of head.matchAll(capsRegex)) {
    const candidate = match[1].trim()
    const words = candidate.split(/\s+/).filter(Boolean)
    if (words.length < 2 || words.length > 3) continue
    const lower = words.map((w) => w.toLowerCase())
    if (lower.some((w) => jobTokens.has(w))) continue
    if (lower.some((w) => sectionTokens.has(w))) continue
    return titleize(candidate)
  }

  // Heuristic: pick the first "Name Surname" looking line in the header (including ALL CAPS)
  const headerLines = cleaned
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 12)
    .filter((l) => !/curriculum|resume|cv|email|telefono|phone|linkedin|github/i.test(l))

  for (const line of headerLines) {
    const words = line.split(/\s+/).filter(Boolean)
    if (words.length < 2 || words.length > 4) continue

    // Case 1: Title Case (e.g. "Michele Miranda")
    const looksLikeTitleCaseName = words.every((w) => /^[A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ'’\-]+$/.test(w))
    if (looksLikeTitleCaseName) return line

    // Case 2: ALL CAPS (common in CV headers) - prefer 2-word lines for names
    const looksAllCaps = words.every((w) => /^[A-ZÀ-ÖØ-Ý'’\-]+$/.test(w))
    if (looksAllCaps) {
      const lowerWords = words.map((w) => w.toLowerCase())
      // Reject obvious job titles when ALL CAPS (e.g. CUSTOMER TRANSFORMATION CONSULTANT)
      const hasJobToken = lowerWords.some((w) => jobTokens.has(w))
      if (words.length === 2 && !hasJobToken) return titleize(line)
      if (words.length === 3 && !hasJobToken) return titleize(line)
    }
  }

  return null
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
  if (!currentName || isPlaceholderName(currentName) || looksLikeJobTitleAsName(currentName)) {
    if (nameHint && !isPlaceholderName(nameHint) && !looksLikeJobTitleAsName(nameHint)) ud.name = nameHint
    else ud.name = "Anonymous Explorer"
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

    const cvForName = fileTexts.join("\n\n") || combined
    const nameHint = guessNameFromCvText(cvForName) || guessNameFromLinkedIn(links)

    // AI
    const openai = getOpenAIClient()
    const analysis = await withRetry(() => analyzeProfile(openai, combined, files.length, links.length), {
      maxRetries: serverConfig.maxRetries,
      operation: "ai:analyze",
    })

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

    const coerced = enforceRealName(enforceCounts(antiPortfolio), nameHint)
    const validated = AntiPortfolioDataSchema.parse(coerced)
    return NextResponse.json(validated, { status: 200 })
  } catch (err) {
    return NextResponse.json(
      { error: "Build failed", message: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    )
  }
}



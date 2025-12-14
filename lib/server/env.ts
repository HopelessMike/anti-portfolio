import fs from "fs"
import path from "path"
import crypto from "crypto"

function parseEnvFile(contents: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const idx = trimmed.indexOf("=")
    if (idx <= 0) continue
    const k = trimmed.slice(0, idx).trim()
    let v = trimmed.slice(idx + 1).trim()
    // Strip quotes
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    out[k] = v
  }
  return out
}

export function resolveOpenAIKey(): { key: string | null; source: "process.env" | "file:.env.local" | "file:env.local" | "missing" } {
  const cwd = process.cwd()
  const candidates: Array<{ file: string; source: "file:.env.local" | "file:env.local" }> = [
    { file: path.join(cwd, ".env.local"), source: "file:.env.local" },
    { file: path.join(cwd, "env.local"), source: "file:env.local" },
  ]

  // In local development, prefer the project file (.env.local/env.local) over any
  // previously-exported shell/OS environment variable to avoid "stale" keys.
  const isProd = process.env.NODE_ENV === "production"
  if (!isProd) {
    for (const c of candidates) {
      try {
        if (!fs.existsSync(c.file)) continue
        const parsed = parseEnvFile(fs.readFileSync(c.file, "utf8"))
        const k = (parsed.OPENAI_API_KEY || "").trim()
        if (k) return { key: k, source: c.source }
      } catch {
        // ignore
      }
    }
  }

  const fromEnv = (process.env.OPENAI_API_KEY || "").trim()
  if (fromEnv) return { key: fromEnv, source: "process.env" }

  // In production we still allow the file as a fallback (useful for some non-Vercel deploys)
  for (const c of candidates) {
    try {
      if (!fs.existsSync(c.file)) continue
      const parsed = parseEnvFile(fs.readFileSync(c.file, "utf8"))
      const k = (parsed.OPENAI_API_KEY || "").trim()
      if (k) return { key: k, source: c.source }
    } catch {
      // ignore
    }
  }

  return { key: null, source: "missing" }
}

export function fingerprintSecret(secret: string): string {
  // Non-reversible fingerprint (safe to log/display)
  const digest = crypto.createHash("sha256").update(secret).digest("hex")
  return `${digest.slice(0, 8)}…${digest.slice(-6)}`
}



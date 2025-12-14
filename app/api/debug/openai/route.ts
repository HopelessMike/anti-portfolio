import { NextResponse } from "next/server"
import { resolveOpenAIKey, fingerprintSecret } from "@/lib/server/env"
import { serverConfig } from "@/lib/server/config"

export const runtime = "nodejs"

export async function GET() {
  const resolved = resolveOpenAIKey()
  if (!resolved.key) {
    return NextResponse.json(
      {
        hasKey: false,
        source: resolved.source,
        model: serverConfig.openaiModel,
        note: "Set OPENAI_API_KEY in .env.local/env.local (dev prefers the file over process.env). Restart dev server after edits.",
      },
      { status: 200 },
    )
  }

  return NextResponse.json(
    {
      hasKey: true,
      source: resolved.source,
      fingerprint: fingerprintSecret(resolved.key),
      length: resolved.key.length,
      model: serverConfig.openaiModel,
      note: "This is a non-reversible fingerprint. In dev, .env.local/env.local wins over any shell/OS OPENAI_API_KEY. Restart `npm run dev` after edits.",
    },
    { status: 200 },
  )
}



import OpenAI from "openai"
import { resolveOpenAIKey } from "@/lib/server/env"

export function getOpenAIClient() {
  const { key } = resolveOpenAIKey()
  if (!key) throw new Error("Missing OPENAI_API_KEY (set it in .env.local or env.local and restart `npm run dev`)")
  return new OpenAI({ apiKey: key })
}



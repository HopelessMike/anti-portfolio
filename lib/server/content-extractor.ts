import axios from "axios"
import * as cheerio from "cheerio"
import { serverConfig } from "@/lib/server/config"

export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  // pdf-parse is CJS; dynamic import avoids edge bundling issues.
  const pdfParse = (await import("pdf-parse")).default as unknown as (b: Buffer) => Promise<{ text?: string }>

  const result = await Promise.race([
    pdfParse(buffer),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("PDF extraction timeout")), serverConfig.pdfExtractionTimeoutMs)),
  ])

  return (result.text || "").trim()
}

export async function extractTextFromUrl(url: string): Promise<string> {
  const normalized = normalizeUrl(url)
  const res = await axios.get(normalized, {
    timeout: serverConfig.webScrapingTimeoutMs,
    headers: { "User-Agent": "Mozilla/5.0 (compatible; AntiPortfolioBot/1.0)" },
    responseType: "text",
    validateStatus: () => true,
  })

  if (!res.data || typeof res.data !== "string") return ""

  const $ = cheerio.load(res.data)
  $("script, style, nav, footer, header, aside, .advertisement, .ads").remove()
  const main =
    $("main").first().length
      ? $("main").first()
      : $("article").first().length
        ? $("article").first()
        : $(".content").first().length
          ? $(".content").first()
          : $("#content").first().length
            ? $("#content").first()
            : $("body")

  return main.text().replace(/\s+/g, " ").trim()
}

export function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return trimmed
  if (trimmed.includes("://")) return trimmed
  return `https://${trimmed}`
}



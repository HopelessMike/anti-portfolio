export const serverConfig = {
  openaiModel: process.env.OPENAI_MODEL || "gpt-5-mini",
  uploadMaxSizeBytes: Number(process.env.UPLOAD_MAX_SIZE || 10 * 1024 * 1024),
  webScrapingTimeoutMs: Number(process.env.WEB_SCRAPING_TIMEOUT || 30_000),
  pdfExtractionTimeoutMs: Number(process.env.PDF_EXTRACTION_TIMEOUT || 10_000),
  maxRetries: Number(process.env.MAX_RETRIES || 2),
}



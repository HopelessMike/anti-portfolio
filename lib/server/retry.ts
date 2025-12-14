export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { maxRetries: number; baseDelayMs?: number; operation?: string } = { maxRetries: 0 },
): Promise<T> {
  const baseDelayMs = opts.baseDelayMs ?? 500
  let lastErr: unknown

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      if (attempt >= opts.maxRetries) break
      const delay = baseDelayMs * Math.pow(2, attempt)
      await new Promise((r) => setTimeout(r, delay))
    }
  }

  throw lastErr instanceof Error
    ? lastErr
    : new Error(`Operation failed${opts.operation ? ` (${opts.operation})` : ""}`)
}



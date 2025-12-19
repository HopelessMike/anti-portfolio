import type { AntiPortfolioData } from "@/lib/types/anti-portfolio-data"

import techRaw from "./tech.json"
import marketingRaw from "./marketing.json"
import designRaw from "./design.json"

export type ProfileSlug = "tech" | "marketing" | "design"

export const PROFILE_SLUGS: ProfileSlug[] = ["tech", "marketing", "design"]

export const PROFILES_RAW: Record<ProfileSlug, unknown> = {
  tech: techRaw,
  marketing: marketingRaw,
  design: designRaw,
}

export function getProfileRaw(slug: string): unknown | null {
  if (!slug) return null
  const s = slug.toLowerCase() as ProfileSlug
  return (PROFILES_RAW as any)[s] ?? null
}

export function getProfile(slug: ProfileSlug): AntiPortfolioData {
  // NOTE: validation happens in the route via AntiPortfolioDataSchema.
  return PROFILES_RAW[slug] as AntiPortfolioData
}


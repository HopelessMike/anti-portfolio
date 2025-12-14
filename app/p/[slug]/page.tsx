import { notFound } from "next/navigation"

import { AntiPortfolioDataSchema } from "@/lib/schemas/anti-portfolio-data"
import { PROFILE_SLUGS, getProfileRaw } from "@/lib/profiles"
import { AntiPortfolioView } from "@/components/anti-portfolio-view"

export function generateStaticParams() {
  return PROFILE_SLUGS.map((slug) => ({ slug }))
}

export default async function PublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const raw = getProfileRaw(slug)
  if (!raw) notFound()

  const validated = AntiPortfolioDataSchema.parse(raw)

  return <AntiPortfolioView flightLog={validated} mode="static" />
}

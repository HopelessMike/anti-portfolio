"use client"

import { createContext, useContext, useMemo, useState } from "react"
import type { ReactNode } from "react"

type OnboardingState = {
  files: File[]
  setFiles: (files: File[]) => void
  links: string[]
  setLinks: (links: string[]) => void
  briefing: string
  setBriefing: (briefing: string) => void
  reset: () => void
}

const OnboardingContext = createContext<OnboardingState | null>(null)

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error("useOnboarding must be used within app/onboarding/layout.tsx")
  return ctx
}

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<File[]>([])
  const [links, setLinks] = useState<string[]>([""])
  const [briefing, setBriefing] = useState<string>("")

  const value = useMemo<OnboardingState>(
    () => ({
      files,
      setFiles,
      links,
      setLinks,
      briefing,
      setBriefing,
      reset: () => {
        setFiles([])
        setLinks([""])
        setBriefing("")
      },
    }),
    [files, links, briefing],
  )

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}


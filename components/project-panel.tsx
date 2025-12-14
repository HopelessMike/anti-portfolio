"use client"

import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { createPortal } from "react-dom"
import { X, ExternalLink, Calendar, Tag, AlertTriangle, Link as LinkIcon, Sparkles, Orbit, Rocket } from "lucide-react"
import { motion } from "framer-motion"
import type { Failure, LessonLearned, Project, Skill, SocialLink, ThemeType, UserData } from "@/lib/user-data"
import { planetColors, themeColors } from "@/lib/user-data"
import { getAccentForFailure } from "@/lib/planet-appearance"

type PanelItem =
  | { type: "skill"; data: Skill; relatedProjects: Project[] }
  | { type: "project"; data: Project; skill: Skill | null }
  | { type: "social"; data: SocialLink }
  | { type: "lesson"; data: LessonLearned }
  | { type: "core"; data: UserData }
  | { type: "identity"; data: { id: string; text: string } }
  | { type: "failure"; data: Failure }

interface ProjectPanelProps {
  isOpen: boolean
  onClose: () => void
  theme: ThemeType
  item: PanelItem | null
}

export function ProjectPanel({ isOpen, onClose, item, theme }: ProjectPanelProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  const colors = useMemo(() => {
    if (!item) return { primary: "#22d3ee", secondary: "#8b5cf6" }
    if (item.type === "skill") {
      const c = planetColors.skill[item.data.type]
      return { primary: c.base, secondary: c.accent }
    }
    if (item.type === "project") {
      const c = themeColors[theme]
      return { primary: c.primary, secondary: c.secondary }
    }
    if (item.type === "social") {
      const c = planetColors.social[item.data.icon]
      return { primary: c.base, secondary: c.accent }
    }
    if (item.type === "lesson") return { primary: planetColors.lesson.base, secondary: planetColors.lesson.accent }
    if (item.type === "core" || item.type === "identity") {
      const c = themeColors[theme]
      return { primary: c.primary, secondary: c.secondary }
    }
    const c = getAccentForFailure(theme)
    return { primary: c.base, secondary: c.accent }
  }, [item, theme])

  const label = useMemo(() => {
    if (!item) return "MISSION FILE"
    if (item.type === "skill") return "SKILL MATRIX"
    if (item.type === "project") return "MISSION CAPSULE"
    if (item.type === "social") return "EXTERNAL LINK"
    if (item.type === "lesson") return "CRITICAL EVENT LOG"
    if (item.type === "core") return "CORE SIGNAL"
    if (item.type === "identity") return "IDENTITY CONSTELLATION"
    return "ANOMALY REPORT"
  }, [item])

  const title = useMemo(() => {
    if (!item) return ""
    if (item.type === "skill") return item.data.name
    if (item.type === "project") return item.data.title
    if (item.type === "social") return item.data.name
    if (item.type === "lesson") return item.data.title
    if (item.type === "core") return item.data.core
    if (item.type === "identity") return "Non sono..."
    return item.data.title
  }, [item])

  const description = useMemo(() => {
    if (!item) return ""
    if (item.type === "skill") return item.data.description
    if (item.type === "project") return item.data.description
    if (item.type === "social") return item.data.previewDescription
    if (item.type === "lesson") return item.data.lessonExtracted
    if (item.type === "core") return item.data.coreDescription
    if (item.type === "identity") return item.data.text
    return item.data.lesson
  }, [item])

  if (!mounted) return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sliding Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[600px] z-50 transform transition-transform duration-500 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          background: "rgba(10,10,15,0.92)",
          borderLeft: `1px solid ${colors.primary}33`,
          backdropFilter: "blur(18px)",
        }}
      >
        <div className="h-full overflow-y-auto p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              <div
                className="inline-block px-3 py-1 rounded-full text-xs font-mono tracking-wider mb-4"
                style={{ background: `${colors.primary}14`, border: `1px solid ${colors.primary}44`, color: colors.primary }}
              >
                {label}
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
              <p className="text-white/60">{description}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
            >
              <X className="h-5 w-5 text-white/70" />
            </button>
          </div>

          {/* Content Sections */}
          {item?.type === "skill" && (
            <SkillPanel skill={item.data} projects={item.relatedProjects} primary={colors.primary} secondary={colors.secondary} />
          )}
          {item?.type === "project" && <ProjectMoonPanel project={item.data} skill={item.skill} primary={colors.primary} secondary={colors.secondary} />}
          {item?.type === "social" && <SocialPanel social={item.data} primary={colors.primary} secondary={colors.secondary} />}
          {item?.type === "lesson" && <LessonPanel lesson={item.data} primary={colors.primary} secondary={colors.secondary} />}
          {item?.type === "core" && <CorePanel userData={item.data} primary={colors.primary} secondary={colors.secondary} />}
          {item?.type === "identity" && <IdentityPanel text={item.data.text} primary={colors.primary} secondary={colors.secondary} />}
          {item?.type === "failure" && <FailurePanel failure={item.data} primary={colors.primary} secondary={colors.secondary} />}
        </div>
      </div>
    </>
    ,
    document.body,
  )
}

function Card({ children, borderColor, bg }: { children: ReactNode; borderColor: string; bg: string }) {
  return (
    <div className="border rounded-lg p-6" style={{ borderColor, background: bg }}>
      {children}
    </div>
  )
}

function CorePanel({ userData, primary, secondary }: { userData: UserData; primary: string; secondary: string }) {
  return (
    <div className="space-y-6">
      <Card borderColor={`${primary}44`} bg="rgba(0,0,0,0.25)">
        <div className="flex items-center gap-2 text-sm text-white/50 mb-2">
          <Orbit className="h-4 w-4" />
          <span>MISSION ROLE</span>
        </div>
        <div className="text-white text-lg">{userData.role}</div>
      </Card>

      <Card borderColor={`${secondary}44`} bg={`${secondary}12`}>
        <div className="flex items-center gap-2 text-sm text-white/50 mb-3">
          <Sparkles className="h-4 w-4" />
          <span>MANIFESTO</span>
        </div>
        <p className="text-white/90 leading-relaxed italic">"{userData.manifesto}"</p>
      </Card>

      <Card borderColor="rgba(255,255,255,0.10)" bg="rgba(255,255,255,0.03)">
        <div className="text-sm text-white/50 mb-4">IDENTITY NEGATIONS</div>
        <div className="space-y-2">
          {(userData.identityNegations || []).slice(0, 8).map((line, idx) => (
            <div key={idx} className="text-sm text-white/75">
              • {line}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function IdentityPanel({ text, primary, secondary }: { text: string; primary: string; secondary: string }) {
  return (
    <div className="space-y-6">
      <Card borderColor={`${secondary}44`} bg={`${secondary}10`}>
        <div className="flex items-center gap-2 text-sm text-white/50 mb-3">
          <Sparkles className="h-4 w-4" />
          <span>IDENTITY SIGNAL</span>
        </div>
        <p className="text-white/90 leading-relaxed">{text}</p>
      </Card>

      <Card borderColor="rgba(255,255,255,0.10)" bg="rgba(255,255,255,0.03)">
        <div className="text-sm text-white/50 mb-3">WHY IT MATTERS</div>
        <p className="text-white/70 leading-relaxed">
          Nell’Anti‑Portfolio queste frasi non sono decorazioni: sono coordinate. Dicono cosa <span style={{ color: primary }}>non</span> definisce la persona,
          così diventa più chiaro cosa invece la muove davvero.
        </p>
      </Card>
    </div>
  )
}

function SkillPanel({
  skill,
  projects,
  primary,
  secondary,
}: {
  skill: Skill
  projects: Project[]
  primary: string
  secondary: string
}) {
  return (
    <div className="space-y-6">
      {projects.length > 0 && (
        <Card borderColor="rgba(255,255,255,0.10)" bg="rgba(255,255,255,0.03)">
          <div className="text-sm text-white/50 mb-4">RELATED MISSIONS</div>
          <div className="space-y-4">
            {projects.map((p) => (
              <div key={p.id} className="border rounded-lg p-4" style={{ borderColor: `${primary}22`, background: "rgba(0,0,0,0.25)" }}>
                <div className="text-lg font-semibold text-white mb-1">{p.title}</div>
                <div className="text-sm text-white/60 mb-3">{p.description}</div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {p.tags.map((t) => (
                    <span key={t} className="px-3 py-1 rounded-full text-sm" style={{ background: `${primary}22`, border: `1px solid ${primary}33` }}>
                      {t}
                    </span>
                  ))}
                </div>
                <div className="text-sm" style={{ color: primary }}>
                  {p.outcome}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function ProjectMoonPanel({
  project,
  skill,
  primary,
  secondary,
}: {
  project: Project
  skill: Skill | null
  primary: string
  secondary: string
}) {
  return (
    <div className="space-y-6">
      {skill && (
        <Card borderColor={`${primary}44`} bg="rgba(0,0,0,0.25)">
          <div className="flex items-center gap-2 text-sm text-white/50 mb-2">
            <Tag className="h-4 w-4" />
            <span>CONNECTED SKILL</span>
          </div>
          <div className="text-white text-lg">{skill.name}</div>
        </Card>
      )}

      <Card borderColor="rgba(255,255,255,0.10)" bg="rgba(255,255,255,0.03)">
        <div className="flex items-center gap-2 text-sm text-white/50 mb-3">
          <Rocket className="h-4 w-4" />
          <span>MISSION OUTCOME</span>
        </div>
        <p className="text-white/85 leading-relaxed">{project.outcome || "Outcome non specificato (dato mancante nel profilo)."}</p>
      </Card>

      {project.tags?.length > 0 && (
        <Card borderColor="rgba(255,255,255,0.10)" bg="rgba(255,255,255,0.03)">
          <div className="text-sm text-white/50 mb-4">TAGS</div>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full text-sm"
                style={{ background: `${primary}22`, border: `1px solid ${primary}33` }}
              >
                {t}
              </span>
            ))}
          </div>
        </Card>
      )}

      <Card borderColor={`${secondary}44`} bg={`${secondary}10`}>
        <div className="text-sm mb-3" style={{ color: secondary }}>
          DESCRIPTION
        </div>
        <p className="text-white/85 leading-relaxed">{project.description}</p>
      </Card>
    </div>
  )
}

function SocialPanel({ social, primary, secondary }: { social: SocialLink; primary: string; secondary: string }) {
  return (
    <div className="space-y-6">
      <Card borderColor="rgba(255,255,255,0.10)" bg="rgba(255,255,255,0.03)">
        <div className="flex items-center gap-2 text-sm text-white/50 mb-2">
          <LinkIcon className="h-4 w-4" />
          <span>URL</span>
        </div>
        <div className="text-white/80 font-mono text-sm break-all">{social.url}</div>
      </Card>

      <a
        href={social.url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg py-3 font-semibold"
        style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
      >
        Apri {social.name}
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  )
}

function LessonPanel({ lesson, primary }: { lesson: LessonLearned; primary: string; secondary: string }) {
  return (
    <div className="space-y-6">
      <Card borderColor={`${primary}44`} bg="rgba(0,0,0,0.25)">
        <div className="flex items-center gap-2 text-sm text-white/50 mb-2">
          <Calendar className="h-4 w-4" />
          <span>YEAR</span>
        </div>
        <div className="text-white text-lg">{lesson.year}</div>
      </Card>

      <Card borderColor="rgba(255,255,255,0.10)" bg="rgba(255,255,255,0.03)">
        <div className="flex items-center gap-2 text-sm text-white/50 mb-3">
          <AlertTriangle className="h-4 w-4" />
          <span>INCIDENT REPORT</span>
        </div>
        <p className="text-white/80 leading-relaxed">{lesson.incidentReport}</p>
      </Card>

      <Card borderColor={`${primary}44`} bg={`${primary}12`}>
        <div className="text-sm mb-3" style={{ color: primary }}>
          LESSON EXTRACTED
        </div>
        <p className="text-white/90 leading-relaxed">{lesson.lessonExtracted}</p>
      </Card>
    </div>
  )
}

function FailurePanel({ failure, primary }: { failure: Failure; primary: string; secondary: string }) {
  return (
    <div className="space-y-6">
      <Card borderColor={`${primary}44`} bg="rgba(0,0,0,0.25)">
        <div className="text-sm mb-3" style={{ color: primary }}>
          INCIDENT STORY
        </div>
        <p className="text-white/80 leading-relaxed">{failure.story}</p>
      </Card>

      <Card borderColor={`${primary}44`} bg={`${primary}12`}>
        <div className="text-sm mb-3" style={{ color: primary }}>
          LESSON LEARNED
        </div>
        <p className="text-white/90 leading-relaxed font-semibold">{failure.lesson}</p>
      </Card>
    </div>
  )
}



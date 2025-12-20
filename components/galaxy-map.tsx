"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import type { UserData, Skill, SocialLink, LessonLearned, Project } from "@/lib/user-data"
import { planetColors, themeColors } from "@/lib/user-data"
import { getDeterministicPalette } from "@/lib/planet-appearance"
import { CentralSun } from "@/components/central-sun"
import { BlackHole } from "@/components/black-hole"
import { ProjectPanel } from "@/components/project-panel"
import { GalaxyNode } from "@/components/galaxy-node"
import { ProjectMoon } from "@/components/project-moon"
import { IdentityStar } from "@/components/identity-star"

type SelectedItem =
  | { type: "core" }
  | { type: "skill"; data: Skill }
  | { type: "project"; data: Project }
  | { type: "lesson"; data: LessonLearned }
  | { type: "social"; data: SocialLink }
  | { type: "identity"; data: { id: string; text: string } }
  | { type: "failure" }
  | null

type HoveredItem =
  | { type: "core" }
  | { type: "skill"; id: number }
  | { type: "project"; id: number }
  | { type: "lesson"; id: string }
  | { type: "social"; id: string }
  | { type: "identity"; id: string }
  | { type: "failure" }
  | null

export function GalaxyMap({ userData }: { userData: UserData }) {
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null)
  const [hoveredItem, setHoveredItem] = useState<HoveredItem>(null)
  const colors = themeColors[userData.theme]
  const isSystemHovered = hoveredItem !== null
  const slowFactor = isSystemHovered ? 2 : 1

  const panelItem = useMemo(() => {
    if (!selectedItem) return null
    if (selectedItem.type === "skill") {
      return {
        type: "skill" as const,
        data: selectedItem.data,
        relatedProjects: userData.projects.filter((p) => p.skillId === selectedItem.data.id),
      }
    }
    if (selectedItem.type === "project") {
      const skill = userData.skills.find((s) => s.id === selectedItem.data.skillId) || null
      return { type: "project" as const, data: selectedItem.data, skill }
    }
    if (selectedItem.type === "social") return { type: "social" as const, data: selectedItem.data }
    if (selectedItem.type === "lesson") return { type: "lesson" as const, data: selectedItem.data }
    if (selectedItem.type === "core") return { type: "core" as const, data: userData }
    if (selectedItem.type === "identity") return { type: "identity" as const, data: selectedItem.data }
    return { type: "failure" as const, data: userData.failure }
  }, [selectedItem, userData])

  const identityStars = useMemo(() => {
    const lines = (userData.identityNegations || []).filter(Boolean).slice(0, 5)
    // Spread stars further out so they don't get swallowed by the core glow.
    const pts = [
      { x: -210, y: -140 },
      { x: -110, y: -210 },
      { x: 40, y: -230 },
      { x: 200, y: -140 },
      { x: 260, y: -10 },
    ]
    return lines.map((text, idx) => ({ id: `neg-${idx + 1}`, text, ...pts[idx % pts.length] }))
  }, [userData.identityNegations])

  // Layout: deterministic positions (no AI-driven geometry).
  // Everything that looks like a body is clickable; background decoration remains pointer-events-none.
  const skillAnchors = useMemo(() => {
    const skills = [...userData.skills].slice(0, 7)
    // Spiral-ish galaxy arms around center; tuned for the existing 1100x1100 container.
    // Coordinates are relative to center (0,0).
    return skills.map((s, i) => {
      const arm = i % 2 === 0 ? 1 : -1
      const t = i / Math.max(1, skills.length - 1) // 0..1
      const radius = 240 + t * 360
      const startAngle = (Math.PI * 0.68 + t * Math.PI * 1.35) * arm
      return { skill: s, radius, startAngle }
    })
  }, [userData.skills])

  const lessonAnchors = useMemo(() => {
    const lessons = [...userData.lessonsLearned].slice(0, 2)
    return lessons.map((l, i) => {
      // Outer rim, opposite sides.
      const angle = i === 0 ? -Math.PI / 2.6 : Math.PI / 1.15
      const radius = 640
      return { lesson: l, x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }
    })
  }, [userData.lessonsLearned])

  const socialAnchors = useMemo(() => {
    const socials = [...userData.socialLinks].slice(0, 3)
    return socials.map((s, i) => {
      // Edge satellites.
      const angle = -Math.PI / 8 + i * (Math.PI / 8)
      const radius = 610
      return { social: s, x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }
    })
  }, [userData.socialLinks])

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-35 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${colors.primary}10 0%, transparent 52%)`,
        }}
      />

      {/* Galaxy container */}
      <div className="relative w-[1200px] h-[1200px] max-w-full max-h-full">
        {/* Origin at center (0,0). All bodies are placed relative to this origin => consistent geometry. */}
        <div className="absolute left-1/2 top-1/2" style={{ transform: "translate(-50%, -50%)" }}>
          {/* Identity constellation lines (subtle, behind stars) */}
          <svg
            className="absolute left-0 top-0 pointer-events-none"
            width={1}
            height={1}
            style={{ overflow: "visible", opacity: 0.55, zIndex: 12 }}
          >
            {identityStars.map((st, i) => {
              const next = identityStars[(i + 1) % identityStars.length]
              if (!next) return null
              return (
                <line
                  key={`${st.id}->${next.id}`}
                  x1={st.x}
                  y1={st.y}
                  x2={next.x}
                  y2={next.y}
                  stroke={colors.secondary}
                  strokeOpacity={0.22}
                  strokeWidth={1}
                />
              )
            })}
          </svg>

          {/* Identity constellation (meaningful stars, above core glow) */}
          <div className="absolute" style={{ zIndex: 15 }}>
            {identityStars.map((st, i) => (
              <IdentityStar
                key={st.id}
                id={st.id}
                text={st.text}
                index={i}
                theme={userData.theme}
                x={st.x}
                y={st.y}
                isHovered={hoveredItem?.type === "identity" && hoveredItem.id === st.id}
                isSelected={selectedItem?.type === "identity" && selectedItem.data.id === st.id}
                onHoverStart={() => setHoveredItem({ type: "identity", id: st.id })}
                onHoverEnd={() => setHoveredItem(null)}
                onClick={() => setSelectedItem({ type: "identity", data: { id: st.id, text: st.text } })}
                isSystemHovered={isSystemHovered}
              />
            ))}
          </div>

          {/* Skill planets orbit around the core (not random). */}
          {skillAnchors.map(({ skill, radius, startAngle }) => {
            const palette = getDeterministicPalette(`skill:${skill.id}:${skill.name}:${skill.type}`)
            const size = 46 + (skill.relevance / 10) * 54 + (skill.level / 100) * 10
            const orbitDuration = Math.max(18, Math.min(80, skill.speed * 1.25)) * slowFactor
            return (
              <motion.div
                key={skill.id}
                className="absolute"
                style={{ zIndex: 11, transform: `rotate(${startAngle}rad)` }}
                animate={{ rotate: 360 }}
                transition={{ duration: orbitDuration, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <GalaxyNode
                  kind="skill"
                  label={skill.name}
                  hoverInfo={skill.hoverInfo}
                  theme={userData.theme}
                  palette={{ base: palette.base, accent: palette.accent, glow: palette.glow }}
                  showGlyph={false}
                  dataKey={`skill:${skill.id}:${skill.name}:${skill.type}`}
                  x={radius}
                  y={0}
                  size={size}
                  isSelected={selectedItem?.type === "skill" && selectedItem.data.id === skill.id}
                  isHovered={hoveredItem?.type === "skill" && hoveredItem.id === skill.id}
                  onHoverStart={() => setHoveredItem({ type: "skill", id: skill.id })}
                  onHoverEnd={() => setHoveredItem(null)}
                  onClick={() => setSelectedItem({ type: "skill", data: skill })}
                  isSystemHovered={isSystemHovered}
                />

                {/* Moons: projects tied to this skill (orbit around the planet, not around the core) */}
                {userData.projects
                  .filter((p) => p.skillId === skill.id)
                  .map((p, idx) => (
                    <ProjectMoon
                      key={p.id}
                      project={p}
                      parentKey={`skill:${skill.id}`}
                      index={idx}
                      theme={userData.theme}
                      parentX={radius}
                      parentY={0}
                      isSelected={selectedItem?.type === "project" && selectedItem.data.id === p.id}
                      isHovered={hoveredItem?.type === "project" && hoveredItem.id === p.id}
                      onHoverStart={() => setHoveredItem({ type: "project", id: p.id })}
                      onHoverEnd={() => setHoveredItem(null)}
                      onClick={() => setSelectedItem({ type: "project", data: p })}
                      isSystemHovered={isSystemHovered}
                    />
                  ))}
              </motion.div>
            )
          })}

        {/* Lesson comets */}
        {lessonAnchors.map(({ lesson, x, y }) => (
          <GalaxyNode
            key={lesson.id}
            kind="lesson"
            label={lesson.title}
            hoverInfo={lesson.hoverInfo}
            theme={userData.theme}
            dataKey={`lesson:${lesson.id}:${lesson.title}:${lesson.year}`}
            x={x}
            y={y}
            size={40 + (lesson.relevance / 10) * 52}
            isSelected={selectedItem?.type === "lesson" && selectedItem.data.id === lesson.id}
            isHovered={hoveredItem?.type === "lesson" && hoveredItem.id === lesson.id}
            onHoverStart={() => setHoveredItem({ type: "lesson", id: lesson.id })}
            onHoverEnd={() => setHoveredItem(null)}
            onClick={() => setSelectedItem({ type: "lesson", data: lesson })}
            isSystemHovered={isSystemHovered}
          />
        ))}

        {/* Social satellites */}
        {socialAnchors.map(({ social, x, y }) => (
          <GalaxyNode
            key={social.id}
            kind="social"
            label={social.name}
            hoverInfo={social.hoverInfo}
            theme={userData.theme}
            palette={{
              base: planetColors.social[social.icon].base,
              accent: planetColors.social[social.icon].accent,
              glow: planetColors.social[social.icon].glow,
            }}
            dataKey={`social:${social.id}:${social.name}:${social.icon}`}
            x={x}
            y={y}
            size={36 + (social.relevance / 10) * 44}
            isSelected={selectedItem?.type === "social" && selectedItem.data.id === social.id}
            isHovered={hoveredItem?.type === "social" && hoveredItem.id === social.id}
            onHoverStart={() => setHoveredItem({ type: "social", id: social.id })}
            onHoverEnd={() => setHoveredItem(null)}
            onClick={() => setSelectedItem({ type: "social", data: social })}
            isSystemHovered={isSystemHovered}
          />
        ))}

          {/* Core star (kept centered; lower z than identity constellation) */}
          <div
            className="absolute"
            style={{ transform: "translate(-50%, -50%)", left: 0, top: 0, zIndex: 10 }}
            onMouseEnter={() => setHoveredItem({ type: "core" })}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="relative">
              <CentralSun core={userData.core} coreDescription={userData.coreDescription} theme={userData.theme} />
              <button
                type="button"
                aria-label="Apri scheda Core"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full"
                style={{ background: "transparent" }}
                onClick={() => setSelectedItem({ type: "core" })}
              />
            </div>
          </div>
        </div>

        {/* Failure black hole (kept as-is) */}
        <BlackHole
          failure={userData.failure}
          onClick={() => setSelectedItem({ type: "failure" })}
          isSelected={selectedItem?.type === "failure"}
          isHovered={hoveredItem?.type === "failure"}
          onHoverStart={() => setHoveredItem({ type: "failure" })}
          onHoverEnd={() => setHoveredItem(null)}
          isSystemHovered={isSystemHovered}
        />
      </div>

      {/* HUD overlay info */}
      <div className="absolute bottom-6 left-6 font-mono text-xs text-white/40">
        <p>"{userData.manifesto}"</p>
      </div>

      <ProjectPanel isOpen={panelItem !== null} onClose={() => setSelectedItem(null)} item={panelItem} theme={userData.theme} />
    </div>
  )
}



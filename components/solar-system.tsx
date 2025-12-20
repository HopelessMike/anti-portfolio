"use client"

import { useState } from "react"
import { PlanetNode } from "./planet-node"
import { SocialPlanet } from "./social-planet"
import { LessonPlanet } from "./lesson-planet"
import { BlackHole } from "./black-hole"
import { CentralSun } from "./central-sun"
import { ProjectPanel } from "./project-panel"
import type { UserData, Skill, SocialLink, LessonLearned } from "@/lib/user-data"
import { themeColors } from "@/lib/user-data"

interface SolarSystemProps {
  userData: UserData
}

type SelectedItem =
  | { type: "skill"; data: Skill }
  | { type: "social"; data: SocialLink }
  | { type: "lesson"; data: LessonLearned }
  | { type: "failure" }
  | null

type HoveredItem =
  | { type: "core" }
  | { type: "skill"; id: number }
  | { type: "social"; id: string }
  | { type: "lesson"; id: string }
  | { type: "failure" }
  | null

export function SolarSystem({ userData }: SolarSystemProps) {
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null)
  const [hoveredItem, setHoveredItem] = useState<HoveredItem>(null)
  const colors = themeColors[userData.theme]

  // Check if any celestial body is hovered
  const isSystemHovered = hoveredItem !== null

  // Reduce clutter: prefer fewer meaningful nodes over many similar ones.
  // Keep the full data in the Flight Log + panel; here we only control what is rendered in the solar view.
  const skillsToShow = [...userData.skills]
    .slice()
    .sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0))
    .slice(0, 5)
    .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
  const socialToShow = [...userData.socialLinks]
    .slice()
    .sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0))
    .slice(0, 3)
  const lessonsToShow = userData.lessonsLearned.slice(0, 2)

  const handleSkillClick = (skill: Skill) => {
    setSelectedItem({ type: "skill", data: skill })
  }

  const handleSocialClick = (social: SocialLink) => {
    setSelectedItem({ type: "social", data: social })
  }

  const handleLessonClick = (lesson: LessonLearned) => {
    setSelectedItem({ type: "lesson", data: lesson })
  }

  const handleFailureClick = () => {
    setSelectedItem({ type: "failure" })
  }

  const handleClose = () => {
    setSelectedItem(null)
  }

  const panelItem =
    selectedItem === null
      ? null
      : selectedItem.type === "skill"
        ? {
            type: "skill" as const,
            data: selectedItem.data,
            relatedProjects: userData.projects.filter((p) => p.skillId === selectedItem.data.id),
          }
        : selectedItem.type === "social"
          ? { type: "social" as const, data: selectedItem.data }
          : selectedItem.type === "lesson"
            ? { type: "lesson" as const, data: selectedItem.data }
            : { type: "failure" as const, data: userData.failure }

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${colors.primary}10 0%, transparent 50%)`,
        }}
      />

      {/* Solar system container */}
      <div className="relative w-[1100px] h-[1100px] max-w-full max-h-full origin-center scale-[0.9]">
        <CentralSun
          core={userData.core}
          coreDescription={userData.coreDescription}
          theme={userData.theme}
          onHoverStart={() => setHoveredItem({ type: "core" })}
          onHoverEnd={() => setHoveredItem(null)}
        />

        {skillsToShow.map((skill) => (
          <PlanetNode
            key={skill.id}
            skill={skill}
            onClick={() => handleSkillClick(skill)}
            isSelected={selectedItem?.type === "skill" && selectedItem.data.id === skill.id}
            isHovered={hoveredItem?.type === "skill" && hoveredItem.id === skill.id}
            onHoverStart={() => setHoveredItem({ type: "skill", id: skill.id })}
            onHoverEnd={() => setHoveredItem(null)}
            isSystemHovered={isSystemHovered}
          />
        ))}

        {socialToShow.map((social) => (
          <SocialPlanet
            key={social.id}
            social={social}
            onClick={() => handleSocialClick(social)}
            isSelected={selectedItem?.type === "social" && selectedItem.data.id === social.id}
            isHovered={hoveredItem?.type === "social" && hoveredItem.id === social.id}
            onHoverStart={() => setHoveredItem({ type: "social", id: social.id })}
            onHoverEnd={() => setHoveredItem(null)}
            isSystemHovered={isSystemHovered}
          />
        ))}

        {lessonsToShow.map((lesson) => (
          <LessonPlanet
            key={lesson.id}
            lesson={lesson}
            onClick={() => handleLessonClick(lesson)}
            isSelected={selectedItem?.type === "lesson" && selectedItem.data.id === lesson.id}
            isHovered={hoveredItem?.type === "lesson" && hoveredItem.id === lesson.id}
            onHoverStart={() => setHoveredItem({ type: "lesson", id: lesson.id })}
            onHoverEnd={() => setHoveredItem(null)}
            isSystemHovered={isSystemHovered}
          />
        ))}

        <BlackHole
          failure={userData.failure}
          onClick={handleFailureClick}
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

      <ProjectPanel isOpen={panelItem !== null} onClose={handleClose} item={panelItem} theme={userData.theme} />
    </div>
  )
}

export type ThemeType = "tech" | "marketing" | "design"

export type PlanetType = "skill" | "project" | "lesson" | "social"

export interface Skill {
  id: number
  name: string
  type: ThemeType
  planetType: PlanetType
  level: number
  orbitRadius: number
  speed: number
  description: string
  relevance: number // 1-10, affects planet size
  hoverInfo: string
}

export interface SocialLink {
  id: string
  name: string
  planetType: "social"
  url: string
  icon: "linkedin" | "github" | "portfolio"
  orbitRadius: number
  speed: number
  relevance: number
  hoverInfo: string
  previewDescription: string
}

export interface Project {
  id: number
  title: string
  skillId: number
  description: string
  outcome: string
  tags: string[]
}

export interface LessonLearned {
  id: string
  title: string
  year: number
  incidentReport: string
  lessonExtracted: string
  quote: string
  orbitRadius: number
  speed: number
  relevance: number
  hoverInfo: string
}

export interface Failure {
  title: string
  lesson: string
  story: string
}

export interface UserData {
  name: string
  role: string
  theme: ThemeType
  manifesto: string
  identityNegations: string[]
  backgroundAudio: {
    trackId: string
    volume: number
  }
  core: string
  coreDescription: string // Added description for sun hover
  skills: Skill[]
  socialLinks: SocialLink[]
  lessonsLearned: LessonLearned[]
  projects: Project[]
  failure: Failure
}

export const userData: UserData = {
  name: "Alex Cosmo",
  role: "Navigatore di Sistemi Creativi",
  theme: "design",
  manifesto: "I translate human chaos into digital logic.",
  identityNegations: [
    "Non sono il mio [[job title]].",
    "Non sono i miei [[commit]] su [[GitHub]].",
    "Non sono i miei [[ticket]] su [[Jira]].",
    "Non sono lo [[strumento]] che uso per lavorare.",
    "Non sono le mie [[certificazioni]].",
  ],
  backgroundAudio: { trackId: "neon_orbit_synthwave", volume: 0.3 },
  core: "Simplicity",
  coreDescription: "The art of reducing complexity without losing depth", //
  skills: [
    {
      id: 1,
      name: "React",
      type: "tech",
      planetType: "skill",
      level: 90,
      orbitRadius: 100,
      speed: 20,
      description: "Building modern, reactive user interfaces",
      relevance: 9,
      hoverInfo: "Core frontend technology",
    },
    {
      id: 2,
      name: "UX Strategy",
      type: "design",
      planetType: "skill",
      level: 85,
      orbitRadius: 150,
      speed: 35,
      description: "Crafting user-centered design solutions",
      relevance: 8,
      hoverInfo: "User experience & research",
    },
    {
      id: 3,
      name: "TypeScript",
      type: "tech",
      planetType: "skill",
      level: 88,
      orbitRadius: 200,
      speed: 25,
      description: "Type-safe code architecture",
      relevance: 9,
      hoverInfo: "Type-safe development",
    },
    {
      id: 4,
      name: "Brand Design",
      type: "marketing",
      planetType: "skill",
      level: 75,
      orbitRadius: 250,
      speed: 45,
      description: "Visual identity & brand systems",
      relevance: 6,
      hoverInfo: "Visual branding & identity",
    },
    {
      id: 5,
      name: "Node.js",
      type: "tech",
      planetType: "skill",
      level: 82,
      orbitRadius: 300,
      speed: 55,
      description: "Server-side JavaScript mastery",
      relevance: 7,
      hoverInfo: "Backend architecture",
    },
  ],
  socialLinks: [
    {
      id: "linkedin",
      name: "LinkedIn",
      planetType: "social",
      url: "https://linkedin.com/in/alexcosmo",
      icon: "linkedin",
      orbitRadius: 350,
      speed: 60,
      relevance: 7,
      hoverInfo: "Professional network",
      previewDescription:
        "Connect with me on LinkedIn for professional updates, industry insights, and career opportunities.",
    },
    {
      id: "github",
      name: "GitHub",
      planetType: "social",
      url: "https://github.com/alexcosmo",
      icon: "github",
      orbitRadius: 400,
      speed: 75,
      relevance: 8,
      hoverInfo: "Open source projects",
      previewDescription: "Explore my open source contributions, side projects, and code repositories.",
    },
    {
      id: "portfolio",
      name: "Portfolio",
      planetType: "social",
      url: "https://alexcosmo.dev",
      icon: "portfolio",
      orbitRadius: 450,
      speed: 90,
      relevance: 9,
      hoverInfo: "Full portfolio site",
      previewDescription:
        "View my complete portfolio with case studies, detailed project breakdowns, and design process.",
    },
  ],
  lessonsLearned: [
    {
      id: "lesson-1",
      title: "The Startup Supernova",
      year: 2021,
      incidentReport:
        "Built a social platform for 6 months. Perfect tech stack, beautiful UI, zero users. We forgot to talk to actual humans before writing code.",
      lessonExtracted:
        "Technology is never the bottleneck. Understanding the problem is. Now I ship MVPs in weeks, not months, and validate with real users from day one.",
      quote: "The only real failure is the one from which we learn nothing.",
      orbitRadius: 500,
      speed: 100,
      relevance: 8,
      hoverInfo: "Critical failure analysis",
    },
  ],
  projects: [
    {
      id: 1,
      title: "Neural Dashboard",
      skillId: 1,
      description: "Real-time analytics platform with predictive insights",
      outcome: "40% increase in user engagement",
      tags: ["React", "D3.js", "WebSocket"],
    },
    {
      id: 2,
      title: "Cosmos Design System",
      skillId: 2,
      description: "Comprehensive UI component library for enterprise",
      outcome: "Reduced dev time by 60%",
      tags: ["Figma", "Storybook", "a11y"],
    },
    {
      id: 3,
      title: "Quantum API",
      skillId: 3,
      description: "Type-safe GraphQL layer for microservices",
      outcome: "Zero runtime type errors",
      tags: ["TypeScript", "GraphQL", "Prisma"],
    },
    {
      id: 4,
      title: "Nebula Rebrand",
      skillId: 4,
      description: "Complete visual identity overhaul for tech startup",
      outcome: "300% brand recognition lift",
      tags: ["Branding", "Motion", "3D"],
    },
  ],
  failure: {
    title: "The Startup Crash",
    lesson: "Fail fast, fix faster.",
    story:
      "In 2021, I co-founded a social platform that aimed to revolutionize how creators monetize content. We raised seed funding, built a team of 8, and launched to initial excitement. Within 6 months, we burned through capital chasing features instead of validating core assumptions. The platform shut down, but the lessons about product-market fit and lean methodology became foundational to every project since.",
  },
}

export const planetColors = {
  skill: {
    tech: {
      base: "#22d3ee",
      accent: "#0891b2",
      glow: "rgba(34, 211, 238, 0.4)",
    },
    design: {
      base: "#d946ef",
      accent: "#a21caf",
      glow: "rgba(217, 70, 239, 0.4)",
    },
    marketing: {
      base: "#facc15",
      accent: "#ca8a04",
      glow: "rgba(250, 204, 21, 0.4)",
    },
  },
  social: {
    linkedin: {
      base: "#0077b5",
      accent: "#005885",
      glow: "rgba(0, 119, 181, 0.4)",
    },
    github: {
      base: "#6e5494",
      accent: "#4c3a6b",
      glow: "rgba(110, 84, 148, 0.4)",
    },
    portfolio: {
      base: "#10b981",
      accent: "#059669",
      glow: "rgba(16, 185, 129, 0.4)",
    },
  },
  lesson: {
    base: "#ef4444",
    accent: "#dc2626",
    glow: "rgba(239, 68, 68, 0.4)",
  },
}

export const themeColors = {
  tech: {
    primary: "#22d3ee",
    secondary: "#8b5cf6",
    glow: "0 0 60px rgba(34, 211, 238, 0.5)",
    gradient: "from-cyan-400 to-violet-500",
  },
  marketing: {
    primary: "#facc15",
    secondary: "#d946ef",
    glow: "0 0 60px rgba(250, 204, 21, 0.5)",
    gradient: "from-yellow-400 to-fuchsia-500",
  },
  design: {
    primary: "#d946ef",
    secondary: "#22d3ee",
    glow: "0 0 60px rgba(217, 70, 239, 0.5)",
    gradient: "from-fuchsia-500 via-violet-500 to-cyan-400",
  },
}

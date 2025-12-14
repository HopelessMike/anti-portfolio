import { z } from "zod"
import { BACKGROUND_AUDIO_TRACK_IDS } from "@/lib/audio-tracks"

const ThemeTypeSchema = z.enum(["tech", "marketing", "design"])
const PlanetTypeSchema = z.enum(["skill", "project", "lesson", "social"])

const SkillSchema = z.object({
  id: z.number().int().nonnegative(),
  name: z.string(),
  type: ThemeTypeSchema,
  planetType: z.literal("skill"),
  level: z.number().min(0).max(100),
  orbitRadius: z.number().min(50).max(800),
  speed: z.number().min(5).max(200),
  description: z.string(),
  relevance: z.number().int().min(1).max(10),
  hoverInfo: z.string(),
})

const SocialLinkSchema = z.object({
  id: z.string(),
  name: z.string(),
  planetType: z.literal("social"),
  url: z.string().url(),
  icon: z.enum(["linkedin", "github", "portfolio"]),
  orbitRadius: z.number().min(50).max(800),
  speed: z.number().min(5).max(200),
  relevance: z.number().int().min(1).max(10),
  hoverInfo: z.string(),
  previewDescription: z.string(),
})

const ProjectSchema = z.object({
  id: z.number().int().nonnegative(),
  title: z.string(),
  skillId: z.number().int().nonnegative(),
  description: z.string(),
  outcome: z.string(),
  tags: z.array(z.string()),
})

const LessonLearnedSchema = z.object({
  id: z.string(),
  title: z.string(),
  year: z.number().int().min(1900).max(2100),
  incidentReport: z.string(),
  lessonExtracted: z.string(),
  quote: z.string(),
  orbitRadius: z.number().min(50).max(1000),
  speed: z.number().min(5).max(200),
  relevance: z.number().int().min(1).max(10),
  hoverInfo: z.string(),
})

const FailureSchema = z.object({
  title: z.string(),
  lesson: z.string(),
  story: z.string(),
})

const BackgroundAudioSchema = z.object({
  trackId: z.enum(BACKGROUND_AUDIO_TRACK_IDS as [string, ...string[]]),
  volume: z.number().min(0).max(1),
})

export const UserDataSchema = z.object({
  name: z.string(),
  role: z.string(),
  theme: ThemeTypeSchema,
  manifesto: z.string(),
  identityNegations: z.array(z.string()).default([]),
  backgroundAudio: BackgroundAudioSchema.default({ trackId: "gravity_waves_downtempo", volume: 0.3 }),
  core: z.string(),
  coreDescription: z.string(),
  skills: z.array(SkillSchema),
  socialLinks: z.array(SocialLinkSchema),
  lessonsLearned: z.array(LessonLearnedSchema),
  projects: z.array(ProjectSchema),
  failure: FailureSchema,
})

export const AntiPortfolioDataSchema = z.object({
  version: z.literal("1.0"),
  generatedAt: z.string(),
  userData: UserDataSchema,
  meta: z.object({
    sourceSummary: z.object({
      filesCount: z.number().int().min(0),
      linksCount: z.number().int().min(0),
    }),
    confidence: z.number().min(0).max(1),
    limitations: z.array(z.string()),
  }),
})

export type AntiPortfolioDataZod = z.infer<typeof AntiPortfolioDataSchema>



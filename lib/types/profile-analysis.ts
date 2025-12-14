export interface ProfileAnalysis {
  experiences: {
    companies: string[]
    projects: string[]
    roles: string[]
  }
  challenges: string[]
  lessons: string[]
  psychologicalProfile: {
    traits: string[]
    motivations: string[]
    workStyle: string[]
    strengths: string[]
  }
  confidence: {
    overall: number
    sources: {
      files: number
      web: number
    }
  }
  limitations: string[]
}



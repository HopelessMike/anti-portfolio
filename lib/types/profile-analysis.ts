export interface ProfileAnalysis {
  person: {
    /**
     * Person's real full name, if explicitly present in sources (CV header, contacts, LinkedIn page content).
     * Empty string if unknown/uncertain.
     */
    name: string
  }
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



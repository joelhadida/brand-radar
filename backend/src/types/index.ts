export interface AnalysisRequest {
  brandName: string
}

export interface NetworkData {
  handle: string
  followers: number
  engagement: number
  active: boolean
  postingFrequency?: string
}

export interface BrandStats {
  followers: number
  engagement: number
  paidAds: boolean
  sponsorships: boolean
}

export interface AnalysisResponse {
  brand: string
  followers: number
  engagement: number
  paidAds: boolean
  sponsorships: boolean
  painPoints: string[]
  opportunities?: string[]
  isViable: boolean
  viabilityScore?: number
  proposal?: string
  networks?: {
    [key: string]: NetworkData
  }
  niche?: string
}

export interface ClaudeAnalysis {
  stats: BrandStats
  painPoints: string[]
  isViable: boolean
}

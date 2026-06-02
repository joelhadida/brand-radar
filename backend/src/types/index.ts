export interface AnalysisRequest {
  brandName: string
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
  isViable: boolean
  proposal?: string
}

export interface ClaudeAnalysis {
  stats: BrandStats
  painPoints: string[]
  isViable: boolean
}

import { Request, Response } from 'express'
import { AnalysisRequest, AnalysisResponse } from '../types/index.js'
import {
  extractBrandData,
  analyzeBrandViability,
  generateProposal,
} from '../services/claudeService.js'

export async function analyzeBrandRoute(req: Request, res: Response) {
  try {
    const { brandName } = req.body as AnalysisRequest

    if (!brandName || brandName.trim().length === 0) {
      return res.status(400).json({ error: 'Brand name is required' })
    }

    // Extract brand data from Claude
    console.log(`Extracting data for brand: ${brandName}`)
    const brandData = await extractBrandData(brandName)

    // Analyze viability
    const programName = process.env.PROGRAM_NAME || 'StreamProgram'
    const agencyName = process.env.AGENCY_NAME || 'AgencyName'

    const viabilityAnalysis = await analyzeBrandViability(
      brandData,
      programName,
      agencyName
    )

    // Generate proposal if viable
    let proposal: string | undefined
    if (viabilityAnalysis.isViable) {
      proposal = await generateProposal(
        brandData,
        viabilityAnalysis,
        programName,
        agencyName
      )
    }

    // Calculate total followers and engagement
    const totalFollowers = Object.values(brandData.networks).reduce(
      (sum, net) => sum + (net.active ? net.followers : 0),
      0
    )

    const activeNetworks = Object.values(brandData.networks).filter(
      (n) => n.active
    )
    const avgEngagement =
      activeNetworks.length > 0
        ? activeNetworks.reduce((sum, n) => sum + n.engagement, 0) /
          activeNetworks.length
        : 0

    const response: AnalysisResponse = {
      brand: brandData.brand,
      followers: totalFollowers,
      engagement: avgEngagement,
      paidAds: brandData.paidAds,
      sponsorships: brandData.sponsorships,
      painPoints: viabilityAnalysis.painPoints,
      isViable: viabilityAnalysis.isViable,
      proposal,
      viabilityScore: viabilityAnalysis.viabilityScore,
      networks: brandData.networks,
      niche: brandData.niche,
      opportunities: viabilityAnalysis.opportunities,
    }

    res.json(response)
  } catch (error) {
    console.error('Error analyzing brand:', error)
    res.status(500).json({
      error:
        error instanceof Error ? error.message : 'Internal server error',
    })
  }
}

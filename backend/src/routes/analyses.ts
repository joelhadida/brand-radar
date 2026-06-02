import { Request, Response } from 'express'
import { getRecentAnalyses } from '../services/dbService.js'

export async function getRecentAnalysesRoute(req: Request, res: Response) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20
    const analyses = await getRecentAnalyses(limit)

    // Transform for frontend
    const transformed = analyses.map((a: any) => ({
      id: a.id,
      brand: a.brands?.name || 'Unknown',
      viability_score: a.viability_score,
      is_viable: a.is_viable,
      created_at: a.created_at,
      proposal_status: a.proposals?.[0]?.status || 'draft',
    }))

    res.json(transformed)
  } catch (error) {
    console.error('Error getting recent analyses:', error)
    res.status(500).json({
      error:
        error instanceof Error ? error.message : 'Internal server error',
    })
  }
}

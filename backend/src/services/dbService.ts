import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

export interface BrandRecord {
  id?: string
  name: string
  website?: string
  niche?: string
  created_at?: string
}

export interface AnalysisRecord {
  id?: string
  brand_id: string
  raw_data: Record<string, unknown>
  viability_score: number
  is_viable: boolean
  pain_points: string[]
  opportunities: string[]
  created_by?: string
  created_at?: string
}

export interface ProposalRecord {
  id?: string
  analysis_id: string
  content: string
  pdf_url?: string
  status: 'draft' | 'sent' | 'approved' | 'rejected'
  sent_to_email?: string
  sent_at?: string
  created_at?: string
}

export async function createOrGetBrand(name: string, data: {
  website?: string
  niche?: string
}): Promise<string> {
  try {
    // Check if brand exists
    const { data: existing } = await supabase
      .from('brands')
      .select('id')
      .eq('name', name)
      .single()

    if (existing) {
      return existing.id
    }

    // Create new brand
    const { data: newBrand, error } = await supabase
      .from('brands')
      .insert([{
        name,
        website: data.website,
        niche: data.niche,
      }])
      .select('id')
      .single()

    if (error) throw error
    return newBrand.id
  } catch (error) {
    console.error('Error in createOrGetBrand:', error)
    throw error
  }
}

export async function saveAnalysis(
  brandId: string,
  analysis: AnalysisRecord,
  userId?: string
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('analyses')
      .insert([{
        brand_id: brandId,
        raw_data: analysis.raw_data,
        viability_score: analysis.viability_score,
        is_viable: analysis.is_viable,
        pain_points: analysis.pain_points,
        opportunities: analysis.opportunities,
        created_by: userId,
      }])
      .select('id')
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error('Error saving analysis:', error)
    throw error
  }
}

export async function saveProposal(
  analysisId: string,
  content: string,
  status: 'draft' | 'sent' | 'approved' | 'rejected' = 'draft'
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('proposals')
      .insert([{
        analysis_id: analysisId,
        content,
        status,
      }])
      .select('id')
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error('Error saving proposal:', error)
    throw error
  }
}

export async function getAnalysis(analysisId: string) {
  try {
    const { data, error } = await supabase
      .from('analyses')
      .select(`
        *,
        brands(name, niche, website),
        proposals(*)
      `)
      .eq('id', analysisId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting analysis:', error)
    throw error
  }
}

export async function updateProposalStatus(
  proposalId: string,
  status: 'draft' | 'sent' | 'approved' | 'rejected',
  email?: string
): Promise<void> {
  try {
    const updateData: any = { status }
    if (email) {
      updateData.sent_to_email = email
      updateData.sent_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('proposals')
      .update(updateData)
      .eq('id', proposalId)

    if (error) throw error
  } catch (error) {
    console.error('Error updating proposal status:', error)
    throw error
  }
}

export async function getRecentAnalyses(limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('analyses')
      .select(`
        *,
        brands(name, niche),
        proposals(status)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting recent analyses:', error)
    throw error
  }
}

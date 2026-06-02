import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.CLAUDEAPI_KEY,
})

interface BrandData {
  brand: string
  website: string
  niche: string
  networks: {
    [key: string]: {
      handle: string
      followers: number
      engagement: number
      active: boolean
      postingFrequency?: string
    }
  }
  paidAds: boolean
  sponsorships: boolean
  contentTypes: string[]
  tone: string
}

interface ViabilityAnalysis {
  viabilityScore: number
  isViable: boolean
  painPoints: string[]
  opportunities: string[]
  audienceMatch: string
  reasoning: string
}

export async function extractBrandData(
  brandName: string
): Promise<BrandData> {
  const prompt = `You are an expert digital marketing analyst. Search for public information about the brand "${brandName}".

Extract and return ONLY valid JSON (no markdown, no explanations) with this exact structure:
{
  "brand": "official name",
  "website": "url if exists or empty string",
  "niche": "industry/category",
  "networks": {
    "instagram": {
      "handle": "username or empty",
      "followers": 0,
      "engagement": 0.05,
      "active": true,
      "postingFrequency": "description"
    },
    "tiktok": { "handle": "", "followers": 0, "engagement": 0, "active": false },
    "youtube": { "handle": "", "followers": 0, "engagement": 0, "active": false },
    "linkedin": { "handle": "", "followers": 0, "engagement": 0, "active": false },
    "facebook": { "handle": "", "followers": 0, "engagement": 0, "active": false },
    "twitter": { "handle": "", "followers": 0, "engagement": 0, "active": false }
  },
  "paidAds": false,
  "sponsorships": false,
  "contentTypes": ["video", "image"],
  "tone": "description of communication tone"
}

Notes:
- Engagement as decimal (0.05 = 5%)
- Only include active networks in "active": true
- If no data found, return mostly empty but valid JSON`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  try {
    return JSON.parse(content.text)
  } catch {
    console.error('Failed to parse Claude response:', content.text)
    throw new Error('Invalid JSON response from Claude')
  }
}

export async function analyzeBrandViability(
  brandData: BrandData,
  programName: string,
  agencyName: string
): Promise<ViabilityAnalysis> {
  const totalFollowers = Object.values(brandData.networks).reduce(
    (sum, net) => sum + (net.active ? net.followers : 0),
    0
  )

  const avgEngagement =
    Object.values(brandData.networks)
      .filter((n) => n.active)
      .reduce((sum, n) => sum + n.engagement, 0) /
    (Object.values(brandData.networks).filter((n) => n.active).length || 1)

  const prompt = `You are a senior marketing consultant at "${agencyName}".

Analyze if "${brandData.brand}" is a good candidate for our integrated offer:
- Advertising space in "${programName}" (info/entertainment stream)
- Agency services: content strategy, paid ads (Meta/Google), lead generation funnels

Brand data:
- Niche: ${brandData.niche}
- Total followers: ${totalFollowers.toLocaleString()}
- Average engagement: ${(avgEngagement * 100).toFixed(1)}%
- Active networks: ${Object.values(brandData.networks)
    .filter((n) => n.active)
    .map((n, i) => Object.keys(brandData.networks)[i])
    .join(', ')}
- Does paid ads: ${brandData.paidAds}
- Has sponsorships: ${brandData.sponsorships}
- Content tone: ${brandData.tone}

Rate viability 0-100 using these criteria:
- Active presence (≥2 networks): 20pts
- Followers ≥3000: 15pts
- Low engagement (<2%) BUT existing base: 25pts (THIS IS THE OPPORTUNITY)
- Not doing paid ads or doing it poorly: 20pts
- Niche compatible with stream: 20pts

Return ONLY valid JSON (no markdown):
{
  "viabilityScore": 72,
  "isViable": true,
  "painPoints": ["pain point 1", "pain point 2"],
  "opportunities": ["opportunity 1"],
  "audienceMatch": "why stream audience matters for this brand",
  "reasoning": "2-line explanation of viability"
}`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  try {
    return JSON.parse(content.text)
  } catch {
    console.error('Failed to parse viability response:', content.text)
    throw new Error('Invalid JSON response from Claude')
  }
}

export async function generateProposal(
  brandData: BrandData,
  analysis: ViabilityAnalysis,
  programName: string,
  agencyName: string
): Promise<string> {
  const prompt = `You are a senior sales copywriter for "${agencyName}".

Create a compelling personalized marketing proposal for "${brandData.brand}" based on this diagnosis:

THEIR SITUATION:
- Main problems: ${analysis.painPoints.join(', ')}
- Opportunities we see: ${analysis.opportunities.join(', ')}
- Audience match: ${analysis.audienceMatch}

OUR OFFER:
1. Premium advertising space in "${programName}" (info/entertainment stream)
2. Integrated agency services: content strategy, paid ads optimization, lead generation funnels
3. Cross-platform distribution and strategic amplification

PROPOSAL REQUIREMENTS:
- Mirror their problems in the opening (show we understand)
- Present integrated solution with ${programName} + agency
- Detail specific benefits: viral content, reach, targeted segments, lead generation
- Include 3 package options with estimated budgets:
  * Starter: $1,500/month
  * Professional: $3,500/month
  * Premium: $7,500/month
- Show expected KPIs: follower growth, engagement improvement, leads generated, video views
- End with urgency and next steps
- Tone: professional but approachable, results-oriented, business language
- Format: Markdown with clear sections, ready for PDF

DELIVERABLE:
Return ONLY the markdown proposal text (no JSON, no markdown code fence, just the raw proposal).`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  return content.text
}

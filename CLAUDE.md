# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Brand Radar

**Vision:** A commercial SaaS app that analyzes brands' social media presence and generates personalized marketing proposals with integrated advertising solutions.

## Architecture Overview

### Stack
- **Frontend:** Next.js + React + TypeScript
- **Backend:** Node.js + Express + TypeScript
- **Database:** Supabase (PostgreSQL)
- **AI Engine:** Claude API (data extraction, analysis, proposal generation)
- **Auth:** Supabase Auth

### Core Features
1. **Brand Diagnosis** - User enters brand name → Claude API extracts social stats (followers, engagement, paid ads, sponsorships)
2. **Viability Analysis** - LLM determines if brand fits the agency's proposal (identifies pain points)
3. **Personalized Proposal** - AI generates tailored marketing solution with advertising channel recommendations
4. **Results Storage** - All analyses and proposals saved to DB for historical reference

### Data Flow
```
User Input (Brand Name) 
  → Backend Receives Request
  → Claude API + Web Search (extract stats)
  → Claude Analysis (viability check)
  → Claude Generation (proposal)
  → Store in DB
  → Frontend Displays Results
```

### Database Schema (Initial)
- **brands** - brand_id, name, url, created_at, last_analyzed
- **analyses** - analysis_id, brand_id, followers, engagement, paid_ads, sponsorships, pain_points, is_viable
- **proposals** - proposal_id, analysis_id, strategy, solutions, estimated_budget, kpis, created_at

## Development Workflow

### Initial Setup (Steps 1-3)
1. Create directory structure (frontend, backend, shared configs)
2. Set up Supabase project and database schema
3. Initialize Next.js and Express with TypeScript

### Core Development (Steps 4-9)
4. Build basic UI - search input + results display
5. Create backend endpoint `/api/analyze-brand`
6. Implement Claude API integration (data extraction)
7. Implement viability analysis logic
8. Implement proposal generation
9. Connect frontend to backend with proper error handling

### Enhancement (Steps 10-13)
10. Create brand analysis dashboard/history
11. Improve UI/UX and add validation
12. Set up Supabase auth for user management
13. Deploy to Vercel (frontend) + Railway/Render (backend)

## Key Commands (To Be Added)
```bash
# Will be defined after initial setup
```

## Environment Variables Required
- `CLAUDE_API_KEY` - Anthropic Claude API key
- `SUPABASE_URL` - Database URL
- `SUPABASE_ANON_KEY` - Public Supabase key
- `DATABASE_URL` - Connection string (backend)

## Important Notes
- Claude API calls must include `web_search` capability for real-time brand data extraction
- Proposal generation uses advanced prompting with context from analysis
- All user-facing copy should be in Spanish (es_ES) initially
- Keep API responses cached in DB to reduce redundant Claude API calls

'use client'

import { useState } from 'react'
import SearchBrand from '@/components/SearchBrand'
import AnalysisResults from '@/components/AnalysisResults'

interface AnalysisData {
  brand: string
  followers: number
  engagement: number
  paidAds: boolean
  sponsorships: boolean
  painPoints: string[]
  isViable: boolean
  proposal?: string
}

export default function Home() {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async (brandName: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/analyze-brand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ brandName }),
      })

      if (!response.ok) throw new Error('Failed to analyze brand')
      const data = await response.json()
      setAnalysis(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Brand Radar
          </h1>
          <p className="text-xl text-gray-600">
            Analiza marcas y descubre oportunidades de marketing digital
          </p>
        </header>

        <SearchBrand onAnalyze={handleAnalyze} loading={loading} />

        {analysis && <AnalysisResults data={analysis} />}
      </div>
    </main>
  )
}

'use client'

import { useState } from 'react'

interface SearchBrandProps {
  onAnalyze: (brandName: string) => void
  loading: boolean
}

export default function SearchBrand({ onAnalyze, loading }: SearchBrandProps) {
  const [brandName, setBrandName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (brandName.trim()) {
      onAnalyze(brandName)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-12">
      <div className="flex gap-2">
        <input
          type="text"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          placeholder="Escribe el nombre de una marca..."
          className="flex-1 px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !brandName.trim()}
          className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition disabled:cursor-not-allowed"
        >
          {loading ? 'Analizando...' : 'Analizar'}
        </button>
      </div>
    </form>
  )
}

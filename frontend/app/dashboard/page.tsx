'use client'

import { useEffect, useState } from 'react'

interface Analysis {
  id: string
  brand: string
  viability_score: number
  is_viable: boolean
  created_at: string
  proposal_status?: string
}

export default function Dashboard() {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    viable: 0,
    notViable: 0,
    sent: 0,
  })

  useEffect(() => {
    loadAnalyses()
  }, [])

  const loadAnalyses = async () => {
    try {
      const response = await fetch('/api/analyses/recent')
      if (!response.ok) throw new Error('Failed to load analyses')
      const data = await response.json()
      setAnalyses(data)

      // Calculate stats
      const total = data.length
      const viable = data.filter((a: Analysis) => a.is_viable).length
      const notViable = total - viable
      const sent = data.filter((a: Analysis) => a.proposal_status === 'sent')
        .length

      setStats({ total, viable, notViable, sent })
    } catch (error) {
      console.error('Error loading analyses:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <p className="text-center text-gray-600">Cargando datos...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Historial de marcas analizadas y propuestas
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Total Análisis"
            value={stats.total}
            color="blue"
            icon="📊"
          />
          <StatCard
            label="Viables"
            value={stats.viable}
            color="green"
            icon="✓"
          />
          <StatCard
            label="No Viables"
            value={stats.notViable}
            color="red"
            icon="✗"
          />
          <StatCard
            label="Propuestas Enviadas"
            value={stats.sent}
            color="purple"
            icon="📧"
          />
        </div>

        {/* Conversions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Tasa de Conversión
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-green-500 h-full transition-all"
                  style={{
                    width: `${stats.total > 0 ? (stats.viable / stats.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {stats.total > 0
                ? ((stats.viable / stats.total) * 100).toFixed(1)
                : 0}
              %
            </p>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {stats.viable} de {stats.total} marcas son viables
          </p>
        </div>

        {/* Recent Analyses */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Análisis Recientes
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Marca
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Viabilidad
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analyses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No hay análisis aún. Empieza buscando una marca.
                    </td>
                  </tr>
                ) : (
                  analyses.map((analysis) => (
                    <tr key={analysis.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {analysis.brand}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            analysis.is_viable
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {analysis.is_viable ? '✓ Viable' : '✗ No viable'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-sm font-bold text-gray-900">
                              {analysis.viability_score}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm ${
                            analysis.proposal_status === 'sent'
                              ? 'text-green-600 font-medium'
                              : 'text-gray-600'
                          }`}
                        >
                          {analysis.proposal_status === 'sent'
                            ? '📧 Enviada'
                            : '📋 Borrador'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(analysis.created_at).toLocaleDateString(
                          'es-ES'
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Ver →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            ← Volver a buscar marca
          </a>
        </div>
      </div>
    </main>
  )
}

interface StatCardProps {
  label: string
  value: number
  color: 'blue' | 'green' | 'red' | 'purple'
  icon: string
}

function StatCard({ label, value, color, icon }: StatCardProps) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    purple: 'bg-purple-50 border-purple-200',
  }

  const textColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
  }

  return (
    <div className={`${colors[color]} border-2 rounded-lg p-6`}>
      <p className={`text-3xl mb-2`}>{icon}</p>
      <p className="text-sm text-gray-600">{label}</p>
      <p className={`text-3xl font-bold ${textColors[color]} mt-2`}>
        {value}
      </p>
    </div>
  )
}

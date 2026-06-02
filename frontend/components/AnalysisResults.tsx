'use client'

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

interface AnalysisResultsProps {
  data: AnalysisData
}

export default function AnalysisResults({ data }: AnalysisResultsProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Diagnóstico: {data.brand}
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Seguidores</p>
            <p className="text-2xl font-bold text-blue-600">
              {(data.followers / 1000).toFixed(1)}K
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Engagement</p>
            <p className="text-2xl font-bold text-green-600">
              {(data.engagement * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Publicidad Pagada</p>
            <p className="text-2xl font-bold text-purple-600">
              {data.paidAds ? 'Sí' : 'No'}
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Patrocinios</p>
            <p className="text-2xl font-bold text-orange-600">
              {data.sponsorships ? 'Sí' : 'No'}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Principales Problemas Identificados
          </h3>
          <ul className="space-y-2">
            {data.painPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-red-500 font-bold">•</span>
                <span className="text-gray-700">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className={`p-4 rounded-lg ${
            data.isViable
              ? 'bg-green-100 border-2 border-green-500'
              : 'bg-red-100 border-2 border-red-500'
          }`}
        >
          <p className="font-semibold text-lg">
            {data.isViable
              ? '✓ Viable para nuestra propuesta'
              : '✗ No viable en este momento'}
          </p>
        </div>
      </div>

      {data.isViable && data.proposal && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Propuesta Personalizada
          </h2>
          <div className="prose prose-sm max-w-none text-gray-700">
            {data.proposal}
          </div>
          <button className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
            Descargar Propuesta
          </button>
        </div>
      )}
    </div>
  )
}

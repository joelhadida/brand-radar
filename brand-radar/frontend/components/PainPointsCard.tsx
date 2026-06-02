'use client'

interface PainPointsCardProps {
  painPoints: string[]
  opportunities: string[]
}

export default function PainPointsCard({
  painPoints,
  opportunities,
}: PainPointsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pain Points */}
        <div>
          <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            Problemas Identificados
          </h3>
          <ul className="space-y-3">
            {painPoints.map((point, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-gray-700 p-3 bg-red-50 rounded-lg"
              >
                <span className="text-red-500 font-bold text-lg mt-1">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Opportunities */}
        <div>
          <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Nuestras Soluciones
          </h3>
          <ul className="space-y-3">
            {opportunities.map((opp, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-gray-700 p-3 bg-green-50 rounded-lg"
              >
                <span className="text-green-500 font-bold text-lg mt-1">✓</span>
                <span>{opp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

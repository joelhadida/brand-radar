'use client'

interface ViabilityScoreProps {
  score: number
  isViable: boolean
}

export default function ViabilityScore({
  score,
  isViable,
}: ViabilityScoreProps) {
  const percentage = (score / 100) * 100
  const color = isViable ? 'text-green-600' : 'text-red-600'
  const bgColor = isViable ? 'bg-green-100' : 'bg-red-100'
  const borderColor = isViable ? 'border-green-500' : 'border-red-500'

  return (
    <div className={`${bgColor} border-2 ${borderColor} rounded-lg p-6`}>
      <p className="text-sm font-semibold text-gray-700 mb-3">
        Puntuación de Viabilidad
      </p>

      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke={isViable ? '#10b981' : '#ef4444'}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(percentage / 100) * 251.2} 251.2`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${color}`}>{score}</span>
          </div>
        </div>

        <div>
          <p className={`text-3xl font-bold ${color} mb-2`}>
            {isViable ? '✓ Viable' : '✗ No Viable'}
          </p>
          <p className="text-sm text-gray-600">
            {isViable
              ? 'Esta marca es candidata para nuestra propuesta'
              : 'No es el momento para esta marca'}
          </p>
        </div>
      </div>
    </div>
  )
}

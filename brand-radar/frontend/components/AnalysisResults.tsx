'use client'

import { useState } from 'react'
import ViabilityScore from './ViabilityScore'
import NetworkMetrics from './NetworkMetrics'
import PainPointsCard from './PainPointsCard'
import ProposalView from './ProposalView'

interface NetworkData {
  handle: string
  followers: number
  engagement: number
  active: boolean
  postingFrequency?: string
}

interface AnalysisData {
  brand: string
  followers: number
  engagement: number
  paidAds: boolean
  sponsorships: boolean
  painPoints: string[]
  opportunities?: string[]
  isViable: boolean
  viabilityScore?: number
  proposal?: string
  networks?: {
    [key: string]: NetworkData
  }
  niche?: string
}

interface AnalysisResultsProps {
  data: AnalysisData
}

export default function AnalysisResults({ data }: AnalysisResultsProps) {
  const [proposalApproved, setProposalApproved] = useState(false)

  if (!data.isViable) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 rounded-lg shadow-md p-8 border-2 border-red-500">
          <h2 className="text-3xl font-bold text-red-600 mb-4">
            Diagnóstico: {data.brand}
          </h2>
          <p className="text-gray-700 mb-6">
            Lamentablemente, esta marca no es viable en este momento para nuestra propuesta.
          </p>

          {data.niche && (
            <p className="text-sm text-gray-600 mb-4">
              <strong>Industria:</strong> {data.niche}
            </p>
          )}

          {data.networks && (
            <NetworkMetrics networks={data.networks} />
          )}

          <p className="mt-6 text-sm text-gray-600 italic">
            Te recomendamos analizar otra marca o volver en 3-6 meses cuando haya evolucionado su presencia digital.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          Diagnóstico: {data.brand}
        </h2>
        {data.niche && (
          <p className="text-gray-600">
            <strong>Industria:</strong> {data.niche}
          </p>
        )}
      </div>

      {/* Viability Score */}
      {data.viabilityScore !== undefined && (
        <ViabilityScore
          score={data.viabilityScore}
          isViable={data.isViable}
        />
      )}

      {/* Network Metrics */}
      {data.networks && <NetworkMetrics networks={data.networks} />}

      {/* Pain Points & Opportunities */}
      {data.painPoints && data.opportunities && (
        <PainPointsCard
          painPoints={data.painPoints}
          opportunities={data.opportunities}
        />
      )}

      {/* Proposal */}
      {data.isViable && data.proposal && (
        <ProposalView
          brandName={data.brand}
          proposal={data.proposal}
          onApprove={() => setProposalApproved(true)}
          onReject={() => console.log('Propuesta rechazada')}
        />
      )}

      {/* Approved state - shows next step */}
      {proposalApproved && (
        <div className="bg-green-50 rounded-lg shadow-md p-8 border-2 border-green-500">
          <h3 className="text-2xl font-bold text-green-600 mb-4">
            ¿Siguiente paso?
          </h3>
          <p className="text-gray-700 mb-4">
            La propuesta está lista. Puedes:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
              📄 Generar PDF
            </button>
            <button className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold">
              📧 Enviar por Email
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

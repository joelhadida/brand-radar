'use client'

import { useState } from 'react'

interface ProposalViewProps {
  brandName: string
  proposal: string
  onApprove: () => void
  onReject: () => void
}

export default function ProposalView({
  brandName,
  proposal,
  onApprove,
  onReject,
}: ProposalViewProps) {
  const [status, setStatus] = useState<'preview' | 'approved' | 'rejected'>(
    'preview'
  )

  if (status === 'approved') {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-md p-8 border-2 border-green-500">
        <h2 className="text-3xl font-bold text-green-600 mb-4">
          ✓ Propuesta Aprobada
        </h2>
        <p className="text-gray-700 mb-6">
          La propuesta para <strong>{brandName}</strong> ha sido aprobada y está
          lista para enviar.
        </p>
        <button
          onClick={() => {
            setStatus('preview')
          }}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          Ver propuesta de nuevo
        </button>
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg shadow-md p-8 border-2 border-orange-500">
        <h2 className="text-3xl font-bold text-orange-600 mb-4">
          ⟲ Propuesta Rechazada
        </h2>
        <p className="text-gray-700 mb-6">
          Puedes buscar otra marca o editar los criterios de tu agencia.
        </p>
        <button
          onClick={() => {
            setStatus('preview')
          }}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          Volver a ver propuesta
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        Propuesta Personalizada
      </h2>
      <p className="text-gray-600 mb-6">para {brandName}</p>

      {/* Markdown content */}
      <div className="prose prose-sm max-w-none mb-8 text-gray-700 bg-gray-50 p-6 rounded-lg">
        <div
          dangerouslySetInnerHTML={{
            __html: proposal
              .split('\n')
              .map((line) => {
                // Simple markdown parsing
                if (line.startsWith('## ')) {
                  return `<h2 class="text-xl font-bold mt-4 mb-2">${line.replace('## ', '')}</h2>`
                }
                if (line.startsWith('### ')) {
                  return `<h3 class="text-lg font-semibold mt-3 mb-2">${line.replace('### ', '')}</h3>`
                }
                if (line.startsWith('- ')) {
                  return `<li class="ml-4">${line.replace('- ', '')}</li>`
                }
                if (line.startsWith('* ')) {
                  return `<li class="ml-4">${line.replace('* ', '')}</li>`
                }
                if (line.trim() === '') {
                  return '<br />'
                }
                return `<p>${line}</p>`
              })
              .join(''),
          }}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 justify-end">
        <button
          onClick={() => {
            setStatus('rejected')
            onReject()
          }}
          className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition"
        >
          Rechazar
        </button>
        <button
          onClick={() => {
            setStatus('approved')
            onApprove()
          }}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
        >
          Aprobar y Continuar
        </button>
      </div>
    </div>
  )
}

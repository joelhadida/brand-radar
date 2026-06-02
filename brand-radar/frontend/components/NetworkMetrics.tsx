'use client'

interface Network {
  handle: string
  followers: number
  engagement: number
  active: boolean
  postingFrequency?: string
}

interface NetworkMetricsProps {
  networks: {
    [key: string]: Network
  }
}

const networkIcons: { [key: string]: string } = {
  instagram: '📷',
  tiktok: '🎵',
  youtube: '🎥',
  linkedin: '💼',
  facebook: '👥',
  twitter: '𝕏',
}

const networkNames: { [key: string]: string } = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  twitter: 'X (Twitter)',
}

export default function NetworkMetrics({ networks }: NetworkMetricsProps) {
  const networkList = Object.keys(networks).filter(
    key => networks[key].active
  )

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Presencia en Redes Sociales
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {networkList.map(key => {
          const network = networks[key]
          const followerDisplay = network.followers >= 1000
            ? `${(network.followers / 1000).toFixed(1)}K`
            : network.followers.toString()

          return (
            <div
              key={key}
              className="border-l-4 border-blue-500 pl-4 py-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">{networkIcons[key] || '🔗'}</span>
                  {networkNames[key]}
                </p>
                {network.handle && (
                  <p className="text-xs text-gray-500">@{network.handle}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Seguidores</p>
                  <p className="text-lg font-bold text-blue-600">
                    {followerDisplay}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Engagement</p>
                  <p className="text-lg font-bold text-green-600">
                    {(network.engagement * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {network.postingFrequency && (
                <p className="text-xs text-gray-500 mt-2">
                  📅 {network.postingFrequency}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {networkList.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          No se encontraron redes sociales activas
        </p>
      )}
    </div>
  )
}

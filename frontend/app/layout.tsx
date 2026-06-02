import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'Brand Radar',
  description: 'Analyze brands and generate personalized marketing proposals',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        <Navigation />
        {children}
      </body>
    </html>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold hover:text-blue-100">
          Brand Radar
        </Link>

        <div className="flex gap-6">
          <Link
            href="/"
            className={`font-semibold transition ${
              isActive('/')
                ? 'text-white border-b-2 border-white'
                : 'text-blue-100 hover:text-white'
            }`}
          >
            Analizar
          </Link>
          <Link
            href="/dashboard"
            className={`font-semibold transition ${
              isActive('/dashboard')
                ? 'text-white border-b-2 border-white'
                : 'text-blue-100 hover:text-white'
            }`}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  )
}

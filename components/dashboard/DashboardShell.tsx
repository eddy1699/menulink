'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { NavigationProgress } from './NavigationProgress'
import { KryptonLoader } from './KryptonLoader'

interface Props {
  restaurantName?: string
  restaurantSlug?: string
  userName?: string | null
  children: React.ReactNode
}

export function DashboardShell({ restaurantName, restaurantSlug, userName, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <div className="flex min-h-screen">
      <KryptonLoader />
      <NavigationProgress />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — drawer on mobile, static on desktop */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 md:static md:z-auto md:translate-x-0 md:self-stretch
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <Sidebar
          restaurantName={restaurantName}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          userName={userName}
          restaurantSlug={restaurantSlug}
          onMenuOpen={() => setSidebarOpen(true)}
        />
        <main
          className="flex-1 p-4 sm:p-6 page-transition"
          style={{ backgroundColor: 'var(--brand-cream)' }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

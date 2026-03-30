'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Palette,
  QrCode,
  BarChart2,
  Globe,
  CreditCard,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Resumen', icon: LayoutDashboard },
  { href: '/dashboard/menu', label: 'Mi Carta', icon: UtensilsCrossed },
  { href: '/dashboard/apariencia', label: 'Apariencia', icon: Palette },
  { href: '/dashboard/qr', label: 'QR Code', icon: QrCode },
  { href: '/dashboard/analitica', label: 'Analítica', icon: BarChart2 },
  { href: '/dashboard/idiomas', label: 'Idiomas', icon: Globe },
  { href: '/dashboard/plan', label: 'Mi Plan', icon: CreditCard },
  { href: '/dashboard/ajustes', label: 'Ajustes', icon: Settings },
]

interface SidebarProps {
  restaurantName?: string
}

export function Sidebar({ restaurantName }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className="w-64 min-h-screen flex flex-col border-r"
      style={{
        backgroundColor: 'var(--brand-dark)',
        borderColor: 'rgba(255,255,255,0.1)',
      }}
    >
      {/* Logo */}
      <div
        className="p-6 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <Link href="/dashboard">
          <span
            className="text-xl font-bold"
            style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-gold)' }}
          >
            MenuQR
          </span>
        </Link>
        {restaurantName && (
          <p className="text-xs mt-1 truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {restaurantName}
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium"
              style={
                isActive
                  ? { backgroundColor: 'var(--brand-gold)', color: 'var(--brand-dark)' }
                  : { color: 'rgba(255,255,255,0.7)' }
              }
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div
        className="p-4 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <Link
          href="/"
          className="text-xs block hover:opacity-70 transition-opacity"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          ← Volver al inicio
        </Link>
      </div>
    </aside>
  )
}

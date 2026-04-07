'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'
import NProgress from 'nprogress'
import { X, Loader2, LayoutDashboard, UtensilsCrossed, Palette, QrCode, BarChart2, Globe, CreditCard, Settings, Link2 } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Resumen', icon: LayoutDashboard },
  { href: '/dashboard/menu', label: 'Mi Carta', icon: UtensilsCrossed },
  { href: '/dashboard/apariencia', label: 'Apariencia', icon: Palette },
  { href: '/dashboard/qr', label: 'QR Code', icon: QrCode },
  { href: '/dashboard/analitica', label: 'Analítica', icon: BarChart2 },
  { href: '/dashboard/idiomas', label: 'Idiomas', icon: Globe },
  { href: '/dashboard/dominio', label: 'Dominio', icon: Link2 },
  { href: '/dashboard/plan', label: 'Mi Plan', icon: CreditCard },
  { href: '/dashboard/ajustes', label: 'Ajustes', icon: Settings },
]

interface SidebarProps {
  restaurantName?: string
  onClose?: () => void
}

export function Sidebar({ restaurantName, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  let _pendingHref: string | null = null

  const navigate = (href: string) => {
    if (href === pathname) { onClose?.(); return }
    _pendingHref = href
    NProgress.start()
    startTransition(() => { router.push(href) })
    onClose?.()
  }

  return (
    <aside
      className="w-72 md:w-64 h-screen md:h-full flex flex-col border-r"
      style={{ backgroundColor: 'var(--brand-dark)', borderColor: 'rgba(255,255,255,0.1)' }}
    >
      {/* Logo + close button */}
      <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <button onClick={() => navigate('/dashboard')} className="text-left">
          <span
            className="text-xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: '#fff' }}
          >
            Karta
          </span>
          {restaurantName && (
            <p className="text-xs mt-0.5 truncate max-w-[160px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {restaurantName}
            </p>
          )}
        </button>
        {/* Close button — only visible on mobile */}
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg transition-opacity hover:opacity-70"
          style={{ color: 'rgba(255,255,255,0.6)' }}
          aria-label="Cerrar menú"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col p-3 overflow-y-auto">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150 active:scale-95"
                style={
                  isActive
                    ? { backgroundColor: '#1B4FD8', color: '#fff' }
                    : { color: 'rgba(255,255,255,0.7)' }
                }
              >
                {isPending && _pendingHref === item.href ? (
                  <Loader2 size={18} className="animate-spin shrink-0" />
                ) : (
                  <Icon size={18} className="shrink-0" />
                )}
                {item.label}
              </button>
            )
          })}
        </div>

        <div className="mt-auto pt-4 px-1">
          <button
            onClick={() => { NProgress.start(); router.push('/') }}
            className="text-xs hover:opacity-70 transition-opacity"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            ← Volver al inicio
          </button>
        </div>
      </nav>
    </aside>
  )
}

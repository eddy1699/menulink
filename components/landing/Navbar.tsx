'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E4E4E7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: '#0D0D0D' }}
            >
              Karta
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#1B4FD8] uppercase tracking-widest">
              PE
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Funciones', href: '#funciones' },
              { label: 'Precios',   href: '#precios' },
              { label: 'Testimonios', href: '#testimonios' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-[#6B7280] hover:text-[#0D0D0D] transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/demo" className="text-sm font-semibold text-[#1B4FD8] hover:text-[#3D6FFF] transition-colors">
              Demo
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-[#0D0D0D] hover:text-[#1B4FD8] font-medium"
              >
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/registro">
              <Button
                size="sm"
                className="font-semibold rounded-[10px] transition-all duration-200 bg-[#1B4FD8] hover:bg-[#3D6FFF] text-white"
              >
                Crear menú gratis
              </Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-[#0D0D0D] hover:bg-[#F5F5F7] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#E4E4E7] px-4 py-4 flex flex-col gap-4">
          {[
            { label: 'Funciones',   href: '#funciones' },
            { label: 'Precios',     href: '#precios' },
            { label: 'Testimonios', href: '#testimonios' },
            { label: 'Demo',        href: '/demo' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-[#0D0D0D]"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#E4E4E7]">
            <Link href="/login">
              <Button variant="outline" className="w-full border-[#E4E4E7] text-[#0D0D0D] rounded-[10px]">
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/registro">
              <Button
                className="w-full font-semibold rounded-[10px]"
                style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
              >
                Crear menú gratis
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        backgroundColor: 'var(--brand-cream)',
        borderColor: 'var(--brand-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
            >
              MenuQR
            </span>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--brand-gold)', color: 'var(--brand-dark)' }}
            >
              Perú
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#funciones"
              className="text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: 'var(--brand-dark)' }}
            >
              Funciones
            </Link>
            <Link
              href="#precios"
              className="text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: 'var(--brand-dark)' }}
            >
              Precios
            </Link>
            <Link
              href="#testimonios"
              className="text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: 'var(--brand-dark)' }}
            >
              Testimonios
            </Link>
            <Link
              href="/demo"
              className="text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: 'var(--brand-gold)' }}
            >
              Demo
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                style={{ color: 'var(--brand-dark)' }}
              >
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/registro">
              <Button
                size="sm"
                style={{ backgroundColor: 'var(--brand-gold)', color: 'var(--brand-dark)' }}
                className="font-semibold hover:opacity-90"
              >
                Crear menú gratis
              </Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ color: 'var(--brand-dark)' }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t px-4 py-4 flex flex-col gap-4"
          style={{ backgroundColor: 'var(--brand-cream)', borderColor: 'var(--brand-border)' }}
        >
          <Link href="#funciones" className="text-sm font-medium" style={{ color: 'var(--brand-dark)' }} onClick={() => setMobileOpen(false)}>
            Funciones
          </Link>
          <Link href="#precios" className="text-sm font-medium" style={{ color: 'var(--brand-dark)' }} onClick={() => setMobileOpen(false)}>
            Precios
          </Link>
          <Link href="#testimonios" className="text-sm font-medium" style={{ color: 'var(--brand-dark)' }} onClick={() => setMobileOpen(false)}>
            Testimonios
          </Link>
          <Link href="/demo" className="text-sm font-medium" style={{ color: 'var(--brand-gold)' }} onClick={() => setMobileOpen(false)}>
            Demo
          </Link>
          <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: 'var(--brand-border)' }}>
            <Link href="/login">
              <Button variant="outline" className="w-full">Iniciar sesión</Button>
            </Link>
            <Link href="/registro">
              <Button
                className="w-full font-semibold"
                style={{ backgroundColor: 'var(--brand-gold)', color: 'var(--brand-dark)' }}
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

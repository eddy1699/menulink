'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, CheckCircle } from 'lucide-react'

export default function RecuperarPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/recuperar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Error al enviar el email')
        return
      }
      setSent(true)
    } catch {
      setError('Error de conexión. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}
        >
          Karta
        </h1>
      </div>

      {sent ? (
        <div className="text-center space-y-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{ backgroundColor: '#dcfce7' }}
          >
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--brand-dark)', fontFamily: 'var(--font-display)' }}>
            Email enviado
          </h2>
          <p className="text-sm" style={{ color: 'var(--brand-muted)' }}>
            Revisa tu bandeja de entrada en <strong>{email}</strong>. El enlace para restablecer tu contraseña expira en 1 hora.
          </p>
          <Link href="/login">
            <Button className="w-full mt-4" variant="outline" style={{ borderColor: 'var(--brand-border)' }}>
              Volver al login
            </Button>
          </Link>
        </div>
      ) : (
        <div
          className="rounded-2xl border p-8"
          style={{ backgroundColor: 'white', borderColor: 'var(--brand-border)' }}
        >
          <h2
            className="text-xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}
          >
            Recuperar contraseña
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--brand-muted)' }}>
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@restaurante.com"
                className="mt-1"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full font-semibold"
              style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
            >
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </Button>
          </form>

          <Link
            href="/login"
            className="flex items-center gap-1 text-sm mt-4 justify-center"
            style={{ color: 'var(--brand-muted)' }}
          >
            <ArrowLeft size={14} />
            Volver al login
          </Link>
        </div>
      )}
    </div>
  )
}

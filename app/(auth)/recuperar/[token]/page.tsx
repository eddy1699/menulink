'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al restablecer la contraseña')
        return
      }
      router.push('/login?reset=ok')
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

      <div
        className="rounded-2xl border p-8"
        style={{ backgroundColor: 'white', borderColor: 'var(--brand-border)' }}
      >
        <h2
          className="text-xl font-bold mb-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}
        >
          Nueva contraseña
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--brand-muted)' }}>
          Elige una contraseña segura de al menos 6 caracteres.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nueva contraseña</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label>Confirmar contraseña</Label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
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
            {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
          </Button>
        </form>

        <Link
          href="/login"
          className="block text-sm mt-4 text-center"
          style={{ color: 'var(--brand-muted)' }}
        >
          Cancelar
        </Link>
      </div>
    </div>
  )
}

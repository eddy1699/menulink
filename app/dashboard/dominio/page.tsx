'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, CheckCircle, Clock, XCircle, Lock } from 'lucide-react'

interface CustomDomain {
  id: string
  domain: string
  status: string
  verifiedAt: string | null
  createdAt: string
}

interface Restaurant {
  plan: string
}

const STATUS_INFO: Record<string, { icon: React.ReactNode; label: string; bg: string; color: string; description: string }> = {
  pending: {
    icon: <Clock size={16} />,
    label: 'Pendiente de verificación',
    bg: '#fef3c7', color: '#92400e',
    description: 'Nuestro equipo verificará tu dominio en las próximas 24-48 horas.',
  },
  verified: {
    icon: <CheckCircle size={16} />,
    label: 'Verificado',
    bg: '#dbeafe', color: '#1e40af',
    description: 'Tu dominio fue verificado. Estamos configurando el acceso.',
  },
  active: {
    icon: <CheckCircle size={16} />,
    label: 'Activo',
    bg: '#dcfce7', color: '#166534',
    description: 'Tu carta está disponible en tu dominio personalizado.',
  },
  failed: {
    icon: <XCircle size={16} />,
    label: 'Verificación fallida',
    bg: '#fee2e2', color: '#991b1b',
    description: 'No se pudo verificar el dominio. Revisa tu configuración DNS.',
  },
}

export default function DominioPage() {
  const [domain, setDomain] = useState<CustomDomain | null>(null)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [inputDomain, setInputDomain] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/dominios').then(r => r.json()),
      fetch('/api/restaurants/me').then(r => r.json()),
    ]).then(([domainData, restaurantData]) => {
      setDomain(domainData)
      setRestaurant(restaurantData)
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/dominios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: inputDomain.trim().toLowerCase() }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Error al registrar dominio')
    } else {
      setDomain(data)
      setInputDomain('')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        {[1,2].map(i => <div key={i} className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--brand-border)' }} />)}
      </div>
    )
  }

  const isBusiness = restaurant?.plan === 'BUSINESS'

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}>
        Dominio Personalizado
      </h1>

      {!isBusiness && (
        <Card style={{ borderColor: 'var(--brand-border)' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--brand-warm)' }}>
                <Lock size={20} style={{ color: 'var(--brand-muted)' }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--brand-dark)' }}>
                  Disponible en Plan Business
                </p>
                <p className="text-sm" style={{ color: 'var(--brand-muted)' }}>
                  Conecta tu propio dominio (ej: <span className="font-mono">carta.turestaurante.com</span>) con el Plan Business.
                </p>
              </div>
            </div>
            <a href="/dashboard/plan">
              <Button className="mt-4 w-full font-semibold" style={{ backgroundColor: '#1B4FD8', color: '#fff' }}>
                Ver planes →
              </Button>
            </a>
          </CardContent>
        </Card>
      )}

      {isBusiness && !domain && (
        <Card style={{ borderColor: 'var(--brand-border)' }}>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
              Registrar dominio personalizado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--brand-muted)' }}>
              Usa tu propio dominio para la carta. Ejemplo: <span className="font-mono">carta.turestaurante.com</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label>Tu dominio</Label>
                <Input
                  value={inputDomain}
                  onChange={e => setInputDomain(e.target.value)}
                  placeholder="carta.turestaurante.com"
                  className="mt-1 font-mono"
                  required
                />
              </div>
              {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
              <Button
                type="submit"
                disabled={saving || !inputDomain.trim()}
                className="w-full font-semibold"
                style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
              >
                {saving ? 'Registrando...' : 'Solicitar dominio'}
              </Button>
            </form>

            {/* DNS instructions */}
            <div className="p-4 rounded-xl border text-sm space-y-2" style={{ backgroundColor: 'var(--brand-warm)', borderColor: 'var(--brand-border)' }}>
              <p className="font-semibold" style={{ color: 'var(--brand-dark)' }}>Cómo configurar tu DNS:</p>
              <p style={{ color: 'var(--brand-muted)' }}>
                En tu proveedor de dominio (GoDaddy, Namecheap, etc.), añade este registro:
              </p>
              <div className="font-mono text-xs bg-white rounded-lg p-3 border" style={{ borderColor: 'var(--brand-border)' }}>
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-bold">Tipo</span>
                  <span className="font-bold">Nombre</span>
                  <span className="font-bold">Valor</span>
                  <span>CNAME</span>
                  <span>carta</span>
                  <span>menuqr.pe</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isBusiness && domain && (
        <Card style={{ borderColor: 'var(--brand-border)' }}>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
              Tu dominio personalizado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe size={18} style={{ color: 'var(--brand-muted)' }} />
                <span className="font-mono font-semibold" style={{ color: 'var(--brand-dark)' }}>{domain.domain}</span>
              </div>
              {(() => {
                const info = STATUS_INFO[domain.status] ?? STATUS_INFO.pending
                return (
                  <Badge style={{ backgroundColor: info.bg, color: info.color }} className="flex items-center gap-1">
                    {info.icon} {info.label}
                  </Badge>
                )
              })()}
            </div>

            <p className="text-sm" style={{ color: 'var(--brand-muted)' }}>
              {(STATUS_INFO[domain.status] ?? STATUS_INFO.pending).description}
            </p>

            {domain.status === 'pending' && (
              <div className="p-4 rounded-xl border text-sm space-y-2" style={{ backgroundColor: 'var(--brand-warm)', borderColor: 'var(--brand-border)' }}>
                <p className="font-semibold" style={{ color: 'var(--brand-dark)' }}>Configura tu DNS mientras tanto:</p>
                <div className="font-mono text-xs bg-white rounded-lg p-3 border" style={{ borderColor: 'var(--brand-border)' }}>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-bold">Tipo</span>
                    <span className="font-bold">Nombre</span>
                    <span className="font-bold">Valor</span>
                    <span>CNAME</span>
                    <span>{domain.domain.split('.')[0]}</span>
                    <span>menuqr.pe</span>
                  </div>
                </div>
              </div>
            )}

            {domain.status === 'active' && (
              <a href={`https://${domain.domain}`} target="_blank" rel="noopener noreferrer">
                <Button className="w-full" variant="outline" style={{ borderColor: 'var(--brand-border)' }}>
                  Abrir mi carta en {domain.domain} →
                </Button>
              </a>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { signOut } from 'next-auth/react'

export default function AjustesPage() {
  const [restaurantId, setRestaurantId] = useState('')
  const [restaurantSlug, setRestaurantSlug] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/restaurants/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.id) {
          setRestaurantId(data.id)
          setRestaurantSlug(data.slug)
          setIsActive(data.isActive)
        }
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch(`/api/restaurants/${restaurantId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1
        className="text-2xl font-bold"
        style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
      >
        Ajustes
      </h1>

      <Card style={{ borderColor: 'var(--brand-border)' }}>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem' }}>
            Estado de la carta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--brand-warm)' }}>
            <div>
              <Label className="font-medium">Carta pública activa</Label>
              <p className="text-xs mt-1" style={{ color: 'var(--brand-muted)' }}>
                Cuando está desactivada, los clientes ven un mensaje de &ldquo;temporalmente inactivo&rdquo;.
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          {restaurantSlug && (
            <div className="mt-4">
              <Label className="text-xs">URL de tu carta</Label>
              <div
                className="mt-1 p-3 rounded-lg border text-sm font-mono break-all"
                style={{ backgroundColor: 'var(--brand-cream)', borderColor: 'var(--brand-border)', color: 'var(--brand-dark)' }}
              >
                {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/{restaurantSlug}
              </div>
            </div>
          )}

          <Button
            className="mt-4 font-semibold"
            onClick={handleSave}
            disabled={saving}
            style={{ backgroundColor: 'var(--brand-gold)', color: 'var(--brand-dark)' }}
          >
            {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar cambios'}
          </Button>
        </CardContent>
      </Card>

      <Card style={{ borderColor: 'var(--brand-border)' }}>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem', color: '#dc2626' }}>
            Zona de peligro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="border-red-200 text-red-500 hover:bg-red-50 w-full"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const AVAILABLE_LANGUAGES = [
  { id: 'es', label: 'Español', flag: '🇪🇸', required: true },
  { id: 'en', label: 'English', flag: '🇬🇧', required: false },
  { id: 'pt', label: 'Português', flag: '🇧🇷', required: false },
]

export default function IdiomasPage() {
  const [languages, setLanguages] = useState<string[]>(['es'])
  const [restaurantId, setRestaurantId] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/restaurants/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.languages) setLanguages(data.languages)
        if (data.id) setRestaurantId(data.id)
      })
  }, [])

  const toggleLanguage = (langId: string) => {
    if (langId === 'es') return // Can't disable Spanish
    setLanguages((prev) =>
      prev.includes(langId)
        ? prev.filter((l) => l !== langId)
        : [...prev, langId]
    )
  }

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch(`/api/restaurants/${restaurantId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ languages }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
        >
          Idiomas
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--brand-muted)' }}>
          Activa los idiomas disponibles en tu carta pública
        </p>
      </div>

      <Card style={{ borderColor: 'var(--brand-border)' }}>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem' }}>
            Idiomas disponibles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {AVAILABLE_LANGUAGES.map((lang) => (
            <div key={lang.id} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--brand-warm)' }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <div>
                  <Label className="font-medium cursor-pointer">{lang.label}</Label>
                  {lang.required && (
                    <p className="text-xs" style={{ color: 'var(--brand-muted)' }}>Idioma principal (requerido)</p>
                  )}
                </div>
              </div>
              <Switch
                checked={languages.includes(lang.id)}
                onCheckedChange={() => toggleLanguage(lang.id)}
                disabled={lang.required}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div
        className="p-4 rounded-xl border text-sm"
        style={{ backgroundColor: 'var(--brand-warm)', borderColor: 'var(--brand-border)', color: 'var(--brand-muted)' }}
      >
        <strong style={{ color: 'var(--brand-dark)' }}>Nota:</strong> Para activar las traducciones, asegúrate de completar los campos EN y PT de cada plato en la sección &ldquo;Mi Carta&rdquo;.
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="font-semibold"
        style={{ backgroundColor: 'var(--brand-gold)', color: 'var(--brand-dark)' }}
      >
        {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar idiomas'}
      </Button>
    </div>
  )
}

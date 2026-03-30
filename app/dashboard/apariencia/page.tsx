'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect } from 'react'

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  bgColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  phone: z.string().optional(),
  address: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function AparienciaPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [restaurantId, setRestaurantId] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      primaryColor: '#C0392B',
      bgColor: '#FFF8F0',
    },
  })

  const primaryColor = watch('primaryColor')
  const bgColor = watch('bgColor')

  useEffect(() => {
    fetch('/api/restaurants/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.id) {
          setRestaurantId(data.id)
          Object.entries(data).forEach(([key, val]) => {
            if (key in schema.shape) setValue(key as keyof FormData, val as string)
          })
        }
        setLoading(false)
      })
  }, [setValue])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    const res = await fetch(`/api/restaurants/${restaurantId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--brand-border)' }} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1
        className="text-2xl font-bold"
        style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
      >
        Apariencia
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card style={{ borderColor: 'var(--brand-border)' }}>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem' }}>
              Información del restaurante
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nombre del restaurante *</Label>
              <Input {...register('name')} className="mt-1" />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea {...register('description')} rows={3} className="mt-1" placeholder="Una breve descripción de tu restaurante..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Teléfono</Label>
                <Input {...register('phone')} className="mt-1" placeholder="+51 999 999 999" />
              </div>
              <div>
                <Label>Distrito</Label>
                <Input {...register('district')} className="mt-1" placeholder="Miraflores" />
              </div>
            </div>
            <div>
              <Label>Dirección</Label>
              <Input {...register('address')} className="mt-1" placeholder="Av. Principal 123" />
            </div>
            <div>
              <Label>Ciudad</Label>
              <Input {...register('city')} className="mt-1" placeholder="Lima" />
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: 'var(--brand-border)' }}>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem' }}>
              Colores de tu carta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Color principal</Label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    {...register('primaryColor')}
                    className="h-10 w-12 rounded cursor-pointer border"
                    style={{ borderColor: 'var(--brand-border)' }}
                  />
                  <Input
                    {...register('primaryColor')}
                    placeholder="#C0392B"
                    className="font-mono"
                  />
                </div>
              </div>
              <div>
                <Label>Color de fondo</Label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    {...register('bgColor')}
                    className="h-10 w-12 rounded cursor-pointer border"
                    style={{ borderColor: 'var(--brand-border)' }}
                  />
                  <Input
                    {...register('bgColor')}
                    placeholder="#FFF8F0"
                    className="font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div
              className="rounded-xl overflow-hidden border mt-4"
              style={{ borderColor: 'var(--brand-border)' }}
            >
              <div
                className="p-4 text-white text-center"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="font-bold text-sm">Vista previa del header</div>
              </div>
              <div
                className="p-4"
                style={{ backgroundColor: bgColor }}
              >
                <div
                  className="text-sm font-semibold"
                  style={{ color: primaryColor }}
                >
                  Categoría ejemplo
                </div>
                <div className="bg-white rounded-lg p-3 mt-2 border" style={{ borderColor: '#f0f0f0' }}>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Plato ejemplo</span>
                    <span style={{ color: primaryColor }}>S/ 28.00</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={saving}
          className="font-semibold"
          style={{ backgroundColor: 'var(--brand-gold)', color: 'var(--brand-dark)' }}
        >
          {saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar cambios'}
        </Button>
      </form>
    </div>
  )
}

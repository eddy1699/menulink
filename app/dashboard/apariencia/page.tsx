'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImagePlus } from 'lucide-react'

const FONTS = [
  { value: 'inter',     label: 'Inter',            stack: 'Inter, sans-serif' },
  { value: 'playfair',  label: 'Playfair Display',  stack: '"Playfair Display", serif' },
  { value: 'lato',      label: 'Lato',              stack: 'Lato, sans-serif' },
  { value: 'merriweather', label: 'Merriweather',   stack: 'Merriweather, serif' },
  { value: 'poppins',   label: 'Poppins',           stack: 'Poppins, sans-serif' },
  { value: 'raleway',   label: 'Raleway',           stack: 'Raleway, sans-serif' },
  { value: 'oswald',    label: 'Oswald',            stack: 'Oswald, sans-serif' },
  { value: 'dancing',   label: 'Dancing Script',    stack: '"Dancing Script", cursive' },
]

const FONT_GOOGLE_URLS: Record<string, string> = {
  inter:        'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
  playfair:     'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap',
  lato:         'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap',
  merriweather: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap',
  poppins:      'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap',
  raleway:      'https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700&display=swap',
  oswald:       'https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&display=swap',
  dancing:      'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap',
}

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  bgColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  fontFamily: z.string().optional(),
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
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      primaryColor: '#C0392B',
      bgColor: '#FFF8F0',
    },
  })

  const primaryColor = watch('primaryColor')
  const bgColor = watch('bgColor')
  const fontFamily = watch('fontFamily') ?? 'inter'
  const fontStack = FONTS.find(f => f.value === fontFamily)?.stack ?? 'Inter, sans-serif'

  useEffect(() => {
    fetch('/api/restaurants/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.id) {
          setRestaurantId(data.id)
          if (data.logoUrl) setLogoUrl(data.logoUrl)
          Object.entries(data).forEach(([key, val]) => {
            if (key in schema.shape) setValue(key as keyof FormData, (val ?? '') as string)
          })
        }
        setLoading(false)
      })
  }, [setValue])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleUploadLogo = async () => {
    if (!logoFile) return
    setUploadingLogo(true)
    const formData = new FormData()
    formData.append('file', logoFile)
    formData.append('type', 'logo')
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (res.ok) {
      const { url } = await res.json()
      setLogoUrl(url)
      setLogoFile(null)
      setLogoPreview(null)
    }
    setUploadingLogo(false)
  }

  const onSubmit = async (data: FormData) => {
    console.log('[apariencia] onSubmit fired, restaurantId:', restaurantId, 'data:', data)
    setSaving(true)
    if (logoFile) await handleUploadLogo()

    const res = await fetch(`/api/restaurants/${restaurantId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    console.log('[apariencia] PUT response:', res.status, json)
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const onError = (errors: unknown) => {
    console.log('[apariencia] validation errors:', errors)
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
        style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}
      >
        Apariencia
      </h1>

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
        {/* Logo */}
        <Card style={{ borderColor: 'var(--brand-border)' }}>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
              Logo del restaurante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {(logoPreview || logoUrl) ? (
                  <>
                    <img
                      src={logoPreview || logoUrl!}
                      alt="Logo"
                      className="w-24 h-24 rounded-xl object-cover border"
                      style={{ borderColor: 'var(--brand-border)' }}
                    />
                    <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ImagePlus size={20} className="text-white" />
                    </div>
                  </>
                ) : (
                  <div
                    className="w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 text-xs transition-colors hover:border-[#1B4FD8]"
                    style={{ borderColor: 'var(--brand-border)', color: 'var(--brand-muted)' }}
                  >
                    <ImagePlus size={20} />
                    <span>Subir logo</span>
                  </div>
                )}
              </div>
              <div className="text-sm" style={{ color: 'var(--brand-muted)' }}>
                <p>JPG, PNG o WebP</p>
                <p>Máximo 5MB</p>
                <p className="text-xs mt-1">Recomendado: 200×200px</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleLogoChange}
              className="hidden"
            />
          </CardContent>
        </Card>

        <Card style={{ borderColor: 'var(--brand-border)' }}>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <CardTitle style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
              Diseño de tu carta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Font selector */}
            <div>
              <Label>Tipografía</Label>
              <select
                value={fontFamily}
                onChange={(e) => setValue('fontFamily', e.target.value)}
                className="mt-1 w-full h-10 rounded-md border px-3 text-sm bg-white focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--brand-border)', color: 'var(--brand-dark)', fontFamily: fontStack }}
              >
                {FONTS.map((f) => (
                  <option key={f.value} value={f.value} style={{ fontFamily: f.stack }}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Color principal</Label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setValue('primaryColor', e.target.value)}
                    className="h-10 w-12 rounded cursor-pointer border"
                    style={{ borderColor: 'var(--brand-border)' }}
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setValue('primaryColor', e.target.value)}
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
                    value={bgColor}
                    onChange={(e) => setValue('bgColor', e.target.value)}
                    className="h-10 w-12 rounded cursor-pointer border"
                    style={{ borderColor: 'var(--brand-border)' }}
                  />
                  <Input
                    value={bgColor}
                    onChange={(e) => setValue('bgColor', e.target.value)}
                    placeholder="#FFF8F0"
                    className="font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Live preview */}
            <link rel="stylesheet" href={FONT_GOOGLE_URLS[fontFamily] ?? FONT_GOOGLE_URLS.inter} />
            <div
              className="rounded-xl overflow-hidden border mt-2"
              style={{ borderColor: 'var(--brand-border)' }}
            >
              <div
                className="p-4 text-white text-center"
                style={{ backgroundColor: primaryColor, fontFamily: fontStack }}
              >
                {(logoPreview || logoUrl) && (
                  <img
                    src={logoPreview || logoUrl!}
                    alt="Logo"
                    className="w-12 h-12 rounded-full object-cover mx-auto mb-2 border-2 border-white/30"
                  />
                )}
                <div className="font-bold text-base">Mi Restaurante</div>
                <div className="text-xs opacity-80 mt-0.5">Carta digital</div>
              </div>
              <div className="p-4 space-y-2" style={{ backgroundColor: bgColor, fontFamily: fontStack }}>
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
                  Entradas
                </div>
                <div className="bg-white rounded-lg p-3 border" style={{ borderColor: '#f0f0f0' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--brand-dark)' }}>Ceviche clásico</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--brand-muted)' }}>Con leche de tigre y cancha</div>
                    </div>
                    <span className="text-sm font-bold ml-4" style={{ color: primaryColor }}>S/ 28.00</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={saving || uploadingLogo}
          className="font-semibold"
          style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
        >
          {uploadingLogo ? 'Subiendo logo...' : saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar cambios'}
        </Button>
      </form>
    </div>
  )
}

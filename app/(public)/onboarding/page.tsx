'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, ChefHat, Clock, Users, Sparkles } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'Ingresa tu nombre completo'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(7, 'Ingresa un teléfono válido'),
  restaurantName: z.string().min(2, 'Ingresa el nombre de tu restaurante'),
  message: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const benefits = [
  { icon: ChefHat, text: 'Cargamos tu carta completa por ti' },
  { icon: Clock, text: 'Lista en menos de 24 horas' },
  { icon: Users, text: 'Asesor dedicado durante todo el proceso' },
  { icon: Sparkles, text: 'Diseño personalizado con tus colores y logo' },
]

export default function OnboardingPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
  })

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    setServerError('')
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        setServerError(err.error || 'Error al enviar. Intenta nuevamente.')
        return
      }
      setSubmitted(true)
    } catch {
      setServerError('Error de conexión. Intenta nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--brand-cream)' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'var(--brand-border)', backgroundColor: 'white' }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span
              className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}
            >
              Karta
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: '#1B4FD8', color: '#fff' }}>
              Perú
            </span>
          </Link>
          <Link href="/registro">
            <Button variant="outline" size="sm" style={{ borderColor: 'var(--brand-border)' }}>
              Registrarme solo
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {submitted ? (
          /* Success state */
          <div className="max-w-lg mx-auto text-center py-16">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: '#dcfce7' }}
            >
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h1
              className="text-3xl font-bold mb-4"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}
            >
              ¡Solicitud enviada!
            </h1>
            <p className="text-lg mb-3" style={{ color: 'var(--brand-muted)' }}>
              Recibimos tu solicitud. Un asesor de Karta se contactará contigo en las próximas <strong>24 horas</strong> para comenzar a cargar tu carta.
            </p>
            <p className="text-sm mb-8" style={{ color: 'var(--brand-muted)' }}>
              Revisa tu correo — te enviaremos una confirmación en breve.
            </p>
            <Link href="/">
              <Button style={{ backgroundColor: '#1B4FD8', color: '#fff' }}>
                Volver al inicio
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: info */}
            <div>
              <div
                className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full mb-6"
                style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
              >
                <Sparkles size={12} />
                Onboarding Asistido
              </div>
              <h1
                className="text-3xl sm:text-4xl font-bold mb-4 leading-tight"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}
              >
                Nosotros cargamos tu carta por ti
              </h1>
              <p className="text-lg mb-8" style={{ color: 'var(--brand-muted)' }}>
                ¿No tienes tiempo o no sabes por dónde empezar? Cuéntanos sobre tu restaurante y nuestro equipo configura todo mientras tú te enfocas en lo que mejor sabes hacer.
              </p>

              <ul className="space-y-4 mb-10">
                {benefits.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'var(--brand-warm)' }}
                    >
                      <Icon size={18} style={{ color: 'var(--brand-gold)' }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--brand-dark)' }}>
                      {text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Price callout */}
              <div
                className="p-5 rounded-2xl border"
                style={{ backgroundColor: 'var(--brand-dark)', borderColor: 'var(--brand-gold)' }}
              >
                <div className="text-white text-sm mb-1 opacity-70">Servicio incluido en el plan</div>
                <div
                  className="text-2xl font-bold mb-1"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-gold)' }}
                >
                  Business
                </div>
                <div className="text-white text-sm opacity-70">
                  S/ 29.90/mes · Sin contrato de permanencia
                </div>
              </div>
            </div>

            {/* Right: form */}
            <div
              className="rounded-2xl border p-8"
              style={{ backgroundColor: 'white', borderColor: 'var(--brand-border)' }}
            >
              <h2
                className="text-xl font-bold mb-6"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}
              >
                Cuéntanos sobre tu restaurante
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <Label>Nombre completo *</Label>
                  <Input
                    {...register('name')}
                    placeholder="Carlos Quispe"
                    className="mt-1"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label>Nombre del restaurante *</Label>
                  <Input
                    {...register('restaurantName')}
                    placeholder="La Cevichería de Don Carlos"
                    className="mt-1"
                  />
                  {errors.restaurantName && (
                    <p className="text-xs text-red-500 mt-1">{errors.restaurantName.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Email *</Label>
                    <Input
                      {...register('email')}
                      type="email"
                      placeholder="tu@restaurante.com"
                      className="mt-1"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>WhatsApp / Teléfono *</Label>
                    <Input
                      {...register('phone')}
                      placeholder="+51 999 999 999"
                      className="mt-1"
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>¿Algo que quieras contarnos? <span className="text-xs font-normal" style={{ color: 'var(--brand-muted)' }}>(opcional)</span></Label>
                  <Textarea
                    {...register('message')}
                    placeholder="Tenemos 45 platos, usamos carta física en A4, queremos colores verde y dorado..."
                    rows={3}
                    className="mt-1 text-sm"
                  />
                </div>

                {serverError && (
                  <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
                    {serverError}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full font-semibold text-base py-6"
                  style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
                >
                  {submitting ? 'Enviando...' : 'Solicitar onboarding asistido →'}
                </Button>

                <p className="text-xs text-center" style={{ color: 'var(--brand-muted)' }}>
                  Te contactamos en menos de 24 horas · Sin compromiso
                </p>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { generateSlug } from '@/lib/slug'
import { PaymentForm } from '@/components/dashboard/PaymentForm'
import { KryptonLoader } from '@/components/dashboard/KryptonLoader'
import { Check, ChevronRight, ImageIcon, Palette, Type, CreditCard, Sparkles, CheckCircle2, Loader2, Upload, X } from 'lucide-react'

const PLANS = [
  {
    id: 'STARTER',
    name: 'Starter',
    price: 9.90,
    serviceFee: 19.90,
    serviceDesc: 'Cargamos tu menú completo sin fotos de platos',
    photosLabel: 'Foto de tu carta o menú físico',
    photosNote: 'Sube una foto clara de tu carta o menú escrito. Nosotros la digitalizamos.',
    includesPhotos: false,
    features: ['Hasta 20 platos', 'Hasta 10 categorías', 'Link + QR descargable', 'Multiidioma ES/EN/PT'],
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: 19.90,
    serviceFee: 49.90,
    serviceDesc: 'Cargamos tu menú completo con fotos de cada plato',
    photosLabel: 'Fotos de cada plato de tu menú',
    photosNote: 'Sube fotos claras de cada plato por separado. Cuantas más, mejor.',
    includesPhotos: true,
    popular: true,
    features: ['Hasta 80 platos', 'Hasta 20 categorías', 'Fotos de tus platos', 'Analítica básica', 'Hasta 3 menús'],
  },
  {
    id: 'BUSINESS',
    name: 'Business',
    price: 29.90,
    serviceFee: 79.90,
    serviceDesc: 'Configuración completa con fotos, sucursales y analítica',
    photosLabel: 'Fotos de todos tus platos y sucursales',
    photosNote: 'Sube fotos de cada plato. También puedes incluir fotos del local.',
    includesPhotos: true,
    features: ['Platos y categorías ilimitados', 'Fotos ilimitadas', 'Analítica avanzada', 'Soporte prioritario'],
  },
]

const REQUIREMENTS = [
  { icon: ImageIcon,  text: 'Fotos de tu menú (y de los platos si tu plan lo incluye)' },
  { icon: Palette,    text: 'Logo de tu negocio y colores de tu marca' },
  { icon: Type,       text: 'Tipo de fuente que deseas usar (o el estilo visual que prefieras)' },
  { icon: CreditCard, text: 'Pago del plan + servicio de configuración (hasta en 6 cuotas)' },
]

const FONT_OPTIONS = [
  { value: 'serif',       label: 'Clásica y elegante (serif)' },
  { value: 'sans-serif',  label: 'Moderna y limpia (sans-serif)' },
  { value: 'handwritten', label: 'Manuscrita y artesanal (handwritten)' },
  { value: 'display',     label: 'Decorativa / display' },
  { value: 'monospace',   label: 'Técnica / monospace' },
  { value: 'other',       label: 'Otra — especificaré el nombre' },
  { value: 'none',        label: 'Sin preferencia — elijan ustedes' },
]

const STEPS = [
  { n: 1, label: 'Elige tu plan' },
  { n: 2, label: 'Crea tu cuenta' },
  { n: 3, label: 'Realiza el pago' },
  { n: 4, label: 'Envía tu información' },
]

export default function LoHacemosPorTiPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null)

  // Step 2
  const [name, setName] = useState('')
  const [restaurantName, setRestaurantName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [regLoading, setRegLoading] = useState(false)
  const [regError, setRegError] = useState('')

  // Step 3 payment
  const [formToken, setFormToken] = useState<string | null>(null)
  const [loadingToken, setLoadingToken] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  // Step 4 setup form
  const [contactPhone, setContactPhone] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#C0392B')
  const [secondaryColor, setSecondaryColor] = useState('#FFFFFF')
  const [fontStyle, setFontStyle] = useState('')
  const [customFont, setCustomFont] = useState('')
  const [notes, setNotes] = useState('')
  const [menuPhotos, setMenuPhotos] = useState<File[]>([])
  const [logoFiles, setLogoFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [done, setDone] = useState(false)

  const menuInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const handleSelectPlan = (plan: typeof PLANS[0]) => {
    setSelectedPlan(plan)
    setStep(2)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlan) return
    setRegLoading(true)
    setRegError('')

    try {
      const res = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, restaurantName, slug: generateSlug(restaurantName) }),
      })
      const json = await res.json()
      if (!res.ok) { setRegError(json.error || 'Error al crear cuenta'); setRegLoading(false); return }

      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) { setRegError('Cuenta creada. Inicia sesión manualmente.'); setRegLoading(false); return }

      setStep(3)
      setRegLoading(false)
      loadPaymentToken(selectedPlan.id)
    } catch {
      setRegError('Error de conexión. Intenta nuevamente.')
      setRegLoading(false)
    }
  }

  const loadPaymentToken = async (planId: string) => {
    setLoadingToken(true)
    setPaymentError('')
    try {
      const res = await fetch('/api/payments/create-token-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await res.json()
      if (!res.ok || !data.formToken) { setPaymentError(data.error || 'Error al cargar el pago'); setLoadingToken(false); return }
      setFormToken(data.formToken)
    } catch {
      setPaymentError('Error de conexión. Recarga la página.')
    } finally {
      setLoadingToken(false)
    }
  }

  const handlePaymentSuccess = useCallback(() => {
    setStep(4)
  }, [])

  const handlePaymentError = useCallback((msg: string) => {
    setPaymentError(msg)
  }, [])

  const isSafe = (val: string) => {
    if (/https?:\/\/|www\./i.test(val)) return false
    if (/<[^>]*>|on\w+\s*=/i.test(val)) return false
    if (/[<>{}\[\]\\]/g.test(val)) return false
    if (/\b(SELECT|INSERT|DROP|UPDATE|DELETE|eval|exec|script)\b/i.test(val)) return false
    return true
  }

  const handleSubmitSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')

    const textFields = [restaurantName, contactPhone, customFont, notes]
    if (textFields.some((f) => f && !isSafe(f))) {
      setSubmitError('Por favor usa solo texto simple, sin links ni caracteres especiales.')
      setSubmitting(false)
      return
    }

    if (notes.length > 500) {
      setSubmitError('El mensaje no puede superar los 500 caracteres.')
      setSubmitting(false)
      return
    }

    const fd = new FormData()
    fd.append('restaurantName', restaurantName)
    fd.append('contactEmail', email)
    fd.append('contactPhone', contactPhone)
    fd.append('colors', `Principal: ${primaryColor} / Secundario: ${secondaryColor}`)
    fd.append('customFont', customFont)
    fd.append('fontStyle', fontStyle)
    fd.append('notes', notes)
    fd.append('plan', selectedPlan?.name || '')
    menuPhotos.forEach((f) => fd.append('menuPhotos', f))
    logoFiles.forEach((f) => fd.append('logo', f))

    try {
      const res = await fetch('/api/setup-request', { method: 'POST', body: fd })
      if (!res.ok) { setSubmitError('Error al enviar. Intenta nuevamente.'); setSubmitting(false); return }
      setDone(true)
    } catch {
      setSubmitError('Error de conexión.')
      setSubmitting(false)
    }
  }

  const serviceFee = selectedPlan?.serviceFee ?? 0
  const total = selectedPlan ? selectedPlan.price + serviceFee : 0

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <KryptonLoader />

      {/* Nav */}
      <div className="bg-white border-b border-[#E4E4E7] px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
          Karta
        </Link>
        <Link href="/registro" className="text-sm text-[#6B7280] hover:text-[#1B4FD8]">
          Prefiero hacerlo yo mismo →
        </Link>
      </div>

      {/* Progress */}
      <div className="bg-white border-b border-[#E4E4E7] px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-1">
          {STEPS.map(({ n, label }, i) => (
            <div key={n} className="flex items-center gap-1 flex-1">
              <div className="flex items-center gap-1.5 shrink-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    backgroundColor: step > n ? '#1B4FD8' : step === n ? '#1B4FD8' : '#E4E4E7',
                    color: step >= n ? '#fff' : '#6B7280',
                  }}
                >
                  {step > n ? <Check size={12} /> : n}
                </div>
                <span className="text-xs font-medium hidden sm:block" style={{ color: step >= n ? '#0D0D0D' : '#6B7280' }}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-1" style={{ backgroundColor: step > n ? '#1B4FD8' : '#E4E4E7' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-[#EEF2FF] text-[#1B4FD8] text-xs font-bold">
                <Sparkles size={14} /> Nosotros lo hacemos por ti
              </div>
              <h1 className="text-3xl font-bold text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
                Tu carta digital lista en 24–48 h
              </h1>
              <p className="text-[#6B7280] mt-2 max-w-md mx-auto">
                Nuestro equipo configura tu carta completa. Solo necesitas enviarnos tu información.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E4E4E7] p-6">
              <h2 className="font-semibold text-[#0D0D0D] mb-4">¿Qué necesitamos de ti?</h2>
              <div className="space-y-3">
                {REQUIREMENTS.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-[#1B4FD8]" />
                    </div>
                    <p className="text-sm text-[#6B7280] pt-1">{text}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#9CA3AF] mt-4 border-t border-[#E4E4E7] pt-4">
                Una vez que pagues, te pediremos toda la información en un formulario. Tu carta estará lista en 24–48 h.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-[#0D0D0D] mb-4">Elige el plan que necesitas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan)}
                    className="relative text-left p-5 rounded-2xl border-2 transition-all hover:shadow-lg hover:-translate-y-0.5"
                    style={{ borderColor: plan.popular ? '#1B4FD8' : '#E4E4E7', backgroundColor: plan.popular ? '#0D0D0D' : '#fff' }}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#1B4FD8] text-white text-xs font-bold">
                        Más popular
                      </div>
                    )}
                    <div className="font-bold mb-1" style={{ color: plan.popular ? '#fff' : '#0D0D0D', fontFamily: 'var(--font-display)' }}>{plan.name}</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-[#6B7280]">S/</span>
                      <span className="text-2xl font-bold" style={{ color: plan.popular ? '#3D6FFF' : '#1B4FD8', fontFamily: 'var(--font-display)' }}>{plan.price.toFixed(2)}</span>
                      <span className="text-xs text-[#6B7280]">/mes</span>
                    </div>
                    <div className="flex items-center gap-1 mb-3 mt-1">
                      <span className="text-xs" style={{ color: plan.popular ? 'rgba(255,255,255,0.5)' : '#9CA3AF' }}>+ S/ {plan.serviceFee.toFixed(2)} configuración</span>
                    </div>
                    <p className="text-xs mb-3" style={{ color: plan.popular ? 'rgba(255,255,255,0.6)' : '#6B7280' }}>{plan.serviceDesc}</p>
                    <ul className="space-y-1.5 mb-4">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-1.5">
                          <Check size={12} className="mt-0.5 shrink-0 text-[#1B4FD8]" />
                          <span className="text-xs" style={{ color: plan.popular ? 'rgba(255,255,255,0.7)' : '#6B7280' }}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="w-full py-2 rounded-xl text-sm font-semibold text-center flex items-center justify-center gap-1"
                      style={{ backgroundColor: plan.popular ? '#1B4FD8' : '#EEF2FF', color: plan.popular ? '#fff' : '#1B4FD8' }}>
                      Elegir {plan.name} <ChevronRight size={14} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && selectedPlan && (
          <div className="space-y-6">
            <div>
              <button onClick={() => setStep(1)} className="text-sm text-[#6B7280] hover:text-[#1B4FD8] mb-4 flex items-center gap-1">
                ← Cambiar plan
              </button>
              <h1 className="text-2xl font-bold text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>Crea tu cuenta</h1>
              <p className="text-[#6B7280] mt-1">Plan: <span className="font-semibold text-[#1B4FD8]">{selectedPlan.name} — S/ {selectedPlan.price.toFixed(2)}/mes</span></p>
            </div>
            <div className="bg-white rounded-2xl border border-[#E4E4E7] p-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Tu nombre</Label>
                    <Input placeholder="Juan Pérez" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Nombre del restaurante</Label>
                    <Input placeholder="La Cevichería Limeña" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} required minLength={2} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" placeholder="tu@restaurante.pe" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Contraseña</Label>
                  <Input type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                {regError && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{regError}</div>}
                <div className="p-4 rounded-xl border border-[#E4E4E7] bg-[#F5F5F7] space-y-2">
                  <p className="text-sm font-semibold text-[#0D0D0D]">Resumen del pago</p>
                  <div className="flex justify-between text-sm text-[#6B7280]"><span>Plan {selectedPlan.name}</span><span>S/ {selectedPlan.price.toFixed(2)}/mes</span></div>
                  <div className="flex justify-between text-sm text-[#6B7280]"><span>Servicio de configuración</span><span>S/ {serviceFee.toFixed(2)} único</span></div>
                  <div className="flex justify-between font-bold text-[#0D0D0D] border-t border-[#E4E4E7] pt-2"><span>Total a pagar</span><span className="text-[#1B4FD8]">S/ {total.toFixed(2)}</span></div>
                </div>
                <Button type="submit" className="w-full font-semibold" disabled={regLoading} style={{ backgroundColor: '#1B4FD8', color: '#fff' }}>
                  {regLoading ? <><Loader2 size={16} className="animate-spin mr-2" />Creando cuenta...</> : 'Continuar al pago →'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && selectedPlan && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>Pago seguro</h1>
              <p className="text-[#6B7280] mt-1">Plan <span className="font-semibold text-[#1B4FD8]">{selectedPlan.name}</span> + servicio de configuración</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#E4E4E7] p-5 space-y-2">
              <div className="flex justify-between text-sm text-[#6B7280]"><span>Plan {selectedPlan.name} (mensual)</span><span>S/ {selectedPlan.price.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-[#6B7280]"><span>Servicio de configuración (único)</span><span>S/ {serviceFee.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-[#0D0D0D] border-t border-[#E4E4E7] pt-3"><span>Total</span><span className="text-[#1B4FD8] text-lg">S/ {total.toFixed(2)}</span></div>
            </div>
            <div className="bg-white rounded-2xl border border-[#E4E4E7] p-6">
              {loadingToken && (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-[#6B7280]">
                  <Loader2 size={18} className="animate-spin" /> Preparando pasarela de pago...
                </div>
              )}
              {paymentError && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 mb-4">{paymentError}</div>}
              {formToken && !loadingToken && (
                <PaymentForm formToken={formToken} onSuccess={handlePaymentSuccess} onError={handlePaymentError} />
              )}
              <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-[#EEF2FF] border border-[#1B4FD8]/20">
                <span className="text-base">💳</span>
                <p className="text-xs text-[#1B4FD8]">
                  Puedes pagar hasta en <strong>6 cuotas</strong> sin interés con tarjetas participantes. Selecciona el número de cuotas en el formulario de pago.
                </p>
              </div>
              <p className="text-xs text-center text-[#9CA3AF] mt-3">Pago procesado de forma segura por Izipay · PCI-DSS Nivel 1</p>
            </div>
          </div>
        )}

        {/* ── STEP 4: formulario de datos ── */}
        {step === 4 && selectedPlan && (
          <div className="space-y-6">
            {done ? (
              <div className="text-center space-y-4 py-10">
                <div className="w-20 h-20 rounded-full bg-[#EEF2FF] flex items-center justify-center mx-auto">
                  <CheckCircle2 size={40} className="text-[#1B4FD8]" />
                </div>
                <h1 className="text-2xl font-bold text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
                  ¡Todo listo!
                </h1>
                <p className="text-[#6B7280] max-w-sm mx-auto">
                  Recibimos tu información. En las próximas <strong>24–48 horas</strong> tu carta digital estará publicada y lista para compartir.
                </p>
                <Button className="font-semibold mt-4" style={{ backgroundColor: '#1B4FD8', color: '#fff' }} onClick={() => router.push('/dashboard')}>
                  Ir a mi panel →
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-full bg-[#1B4FD8] flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                    <span className="text-sm font-semibold text-[#1B4FD8]">Pago confirmado</span>
                  </div>
                  <h1 className="text-2xl font-bold text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
                    Envíanos tu información
                  </h1>
                  <p className="text-[#6B7280] mt-1">
                    Con estos datos configuramos tu carta. Cuanto más detalle nos des, mejor quedará.
                  </p>
                </div>

                <form onSubmit={handleSubmitSetup} className="space-y-5">
                  {/* Fotos del menú */}
                  <div className="bg-white rounded-2xl border border-[#E4E4E7] p-5 space-y-3">
                    <h2 className="font-semibold text-[#0D0D0D] flex items-center gap-2">
                      <ImageIcon size={16} className="text-[#1B4FD8]" /> {selectedPlan?.photosLabel}
                    </h2>
                    <p className="text-xs text-[#6B7280]">{selectedPlan?.photosNote}</p>
                    {!selectedPlan?.includesPhotos && (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FFF9EC] border border-[#F0D89A] text-xs text-[#7A5C00]">
                        <span>ℹ️</span>
                        <span>El plan <strong>Starter</strong> no incluye fotos de platos. Solo digitalizamos tu carta. Si deseas fotos, considera el plan <strong>Pro</strong>.</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => menuInputRef.current?.click()}
                      className="w-full h-20 rounded-xl border-2 border-dashed border-[#E4E4E7] flex flex-col items-center justify-center gap-1 text-sm text-[#6B7280] hover:border-[#1B4FD8] hover:text-[#1B4FD8] transition-colors"
                    >
                      <Upload size={18} />
                      <span>{selectedPlan?.includesPhotos ? 'Subir fotos de los platos' : 'Subir foto de tu carta'}</span>
                    </button>
                    <input
                      ref={menuInputRef}
                      type="file"
                      multiple={selectedPlan?.includesPhotos}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setMenuPhotos(Array.from(e.target.files || []))}
                    />
                    {menuPhotos.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {menuPhotos.map((f, i) => (
                          <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#EEF2FF] text-xs text-[#1B4FD8]">
                            <ImageIcon size={11} /> {f.name}
                            <button type="button" onClick={() => setMenuPhotos((p) => p.filter((_, j) => j !== i))}>
                              <X size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Logo y colores */}
                  <div className="bg-white rounded-2xl border border-[#E4E4E7] p-5 space-y-4">
                    <h2 className="font-semibold text-[#0D0D0D] flex items-center gap-2">
                      <Palette size={16} className="text-[#1B4FD8]" /> Logo y colores
                    </h2>

                    {/* Logo upload */}
                    <div className="space-y-2">
                      <Label className="text-xs">Logo de tu negocio</Label>
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="w-full h-16 rounded-xl border-2 border-dashed border-[#E4E4E7] flex items-center justify-center gap-2 text-sm text-[#6B7280] hover:border-[#1B4FD8] hover:text-[#1B4FD8] transition-colors"
                      >
                        <Upload size={16} /> Subir logo (PNG, JPG, SVG)
                      </button>
                      <input ref={logoInputRef} type="file" accept="image/*" className="hidden"
                        onChange={(e) => setLogoFiles(e.target.files ? [e.target.files[0]] : [])} />
                      {logoFiles.length > 0 && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#EEF2FF] text-xs text-[#1B4FD8] w-fit">
                          <ImageIcon size={11} /> {logoFiles[0].name}
                          <button type="button" onClick={() => setLogoFiles([])}><X size={11} /></button>
                        </div>
                      )}
                    </div>

                    {/* Color pickers */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Color principal</Label>
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-[#E4E4E7]">
                          <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="w-10 h-10 rounded-lg border-0 cursor-pointer p-0"
                          />
                          <div>
                            <p className="text-sm font-semibold text-[#0D0D0D]">{primaryColor.toUpperCase()}</p>
                            <p className="text-xs text-[#6B7280]">Color principal</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Color secundario</Label>
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-[#E4E4E7]">
                          <input
                            type="color"
                            value={secondaryColor}
                            onChange={(e) => setSecondaryColor(e.target.value)}
                            className="w-10 h-10 rounded-lg border-0 cursor-pointer p-0"
                          />
                          <div>
                            <p className="text-sm font-semibold text-[#0D0D0D]">{secondaryColor.toUpperCase()}</p>
                            <p className="text-xs text-[#6B7280]">Color secundario</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fuente */}
                  <div className="bg-white rounded-2xl border border-[#E4E4E7] p-5 space-y-4">
                    <h2 className="font-semibold text-[#0D0D0D] flex items-center gap-2">
                      <Type size={16} className="text-[#1B4FD8]" /> Tipo de fuente
                    </h2>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Selecciona un estilo</Label>
                      <select
                        value={fontStyle}
                        onChange={(e) => { setFontStyle(e.target.value); if (e.target.value !== 'other') setCustomFont('') }}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#E4E4E7] text-sm text-[#0D0D0D] bg-white focus:outline-none focus:border-[#1B4FD8] focus:ring-2 focus:ring-[#1B4FD8]/15"
                      >
                        <option value="">— Elige un estilo —</option>
                        {FONT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    {fontStyle === 'other' && (
                      <div className="space-y-1.5">
                        <Label className="text-xs">Nombre de la fuente que deseas</Label>
                        <Input
                          placeholder="Ej: Playfair Display, Montserrat, Pacifico…"
                          value={customFont}
                          onChange={(e) => setCustomFont(e.target.value)}
                        />
                        <p className="text-xs text-[#6B7280] bg-[#FFF9EC] border border-[#F0D89A] rounded-lg px-3 py-2">
                          Haremos lo posible por implementarla y te avisaremos. En caso no sea posible, se asignará una fuente predeterminada similar.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Contacto y notas */}
                  <div className="bg-white rounded-2xl border border-[#E4E4E7] p-5 space-y-4">
                    <h2 className="font-semibold text-[#0D0D0D]">Datos de contacto y notas</h2>
                    <div className="space-y-1.5">
                      <Label className="text-xs">WhatsApp / Teléfono</Label>
                      <Input placeholder="+51 999 999 999" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs">Notas adicionales (opcional)</Label>
                        <span className={`text-xs ${notes.length > 500 ? 'text-red-500' : 'text-[#9CA3AF]'}`}>
                          {notes.length}/500
                        </span>
                      </div>
                      <Textarea
                        placeholder="Cuéntanos cualquier detalle extra: estilo del restaurante, referencias visuales, qué categorías tiene tu menú, etc."
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                        className="text-sm"
                      />
                      <p className="text-xs text-[#9CA3AF]">
                        ⚠️ No incluyas links, código ni caracteres especiales. Solo aceptamos texto simple.
                      </p>
                    </div>
                  </div>

                  {submitError && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{submitError}</div>}

                  <Button
                    type="submit"
                    className="w-full font-semibold py-6 text-base"
                    disabled={submitting}
                    style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
                  >
                    {submitting ? <><Loader2 size={16} className="animate-spin mr-2" />Enviando...</> : 'Enviar información →'}
                  </Button>

                  <p className="text-xs text-center text-[#9CA3AF]">
                    Te contactaremos a <strong>{email}</strong> en las próximas 24–48 h.
                  </p>
                </form>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, ChevronRight, Loader2 } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────
interface RestaurantData {
  id: string
  name: string
  description: string | null
  phone: string | null
  district: string | null
  city: string
  primaryColor: string
  bgColor: string
  onboardingStep: number
}

// ── Step indicator ─────────────────────────────────────────
const STEPS = [
  { n: 1, label: 'Tu restaurante' },
  { n: 2, label: 'Colores' },
  { n: 3, label: 'Primera categoría' },
  { n: 4, label: 'Primer plato' },
]

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-10">
      {STEPS.map((step, i) => (
        <div key={step.n} className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
            style={
              step.n < current
                ? { backgroundColor: '#22c55e', color: 'white' }
                : step.n === current
                ? { backgroundColor: '#1B4FD8', color: '#fff' }
                : { backgroundColor: 'var(--brand-border)', color: 'var(--brand-muted)' }
            }
          >
            {step.n < current ? <CheckCircle size={16} /> : step.n}
          </div>
          <span
            className="text-xs font-medium hidden sm:block"
            style={{ color: step.n === current ? 'var(--brand-dark)' : 'var(--brand-muted)' }}
          >
            {step.label}
          </span>
          {i < STEPS.length - 1 && (
            <div
              className="w-8 h-px mx-1"
              style={{ backgroundColor: step.n < current ? '#22c55e' : 'var(--brand-border)' }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Step 1: Datos básicos ──────────────────────────────────
function Step1({
  data,
  onNext,
}: {
  data: RestaurantData
  onNext: (updates: Partial<RestaurantData>) => Promise<void>
}) {
  const [name, setName] = useState(data.name || '')
  const [description, setDescription] = useState(data.description || '')
  const [phone, setPhone] = useState(data.phone || '')
  const [district, setDistrict] = useState(data.district || '')
  const [city, setCity] = useState(data.city || 'Lima')
  const [saving, setSaving] = useState(false)

  const handleNext = async () => {
    if (!name.trim()) return
    setSaving(true)
    await onNext({ name, description, phone, district, city })
    setSaving(false)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}>
          Cuéntanos sobre tu restaurante
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--brand-muted)' }}>
          Esta información aparecerá en tu carta digital pública.
        </p>
      </div>
      <div>
        <Label>Nombre del restaurante *</Label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="La Cevichería Limeña" className="mt-1" />
      </div>
      <div>
        <Label>Descripción <span className="text-xs font-normal" style={{ color: 'var(--brand-muted)' }}>(opcional)</span></Label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Los mejores ceviches de Miraflores desde 1985" className="mt-1 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Teléfono <span className="text-xs font-normal" style={{ color: 'var(--brand-muted)' }}>(opcional)</span></Label>
          <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+51 999 999 999" className="mt-1" />
        </div>
        <div>
          <Label>Distrito</Label>
          <Input value={district} onChange={e => setDistrict(e.target.value)} placeholder="Miraflores" className="mt-1" />
        </div>
      </div>
      <div>
        <Label>Ciudad</Label>
        <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Lima" className="mt-1" />
      </div>
      <Button
        onClick={handleNext}
        disabled={!name.trim() || saving}
        className="w-full gap-2 font-semibold"
        style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
        {saving ? 'Guardando...' : 'Siguiente'}
      </Button>
    </div>
  )
}

// ── Step 2: Colores ────────────────────────────────────────
function Step2({
  data,
  onNext,
  onBack,
}: {
  data: RestaurantData
  onNext: (updates: Partial<RestaurantData>) => Promise<void>
  onBack: () => void
}) {
  const [primaryColor, setPrimaryColor] = useState(data.primaryColor || '#C0392B')
  const [bgColor, setBgColor] = useState(data.bgColor || '#FFF8F0')
  const [saving, setSaving] = useState(false)

  const PRESETS = [
    { primary: '#1B4F72', bg: '#EAF4FB', label: 'Azul marino' },
    { primary: '#922B21', bg: '#FDF2F2', label: 'Rojo clásico' },
    { primary: '#1E8449', bg: '#EAFAF1', label: 'Verde fresco' },
    { primary: '#784212', bg: '#FDF5E6', label: 'Marrón cálido' },
    { primary: '#1A1208', bg: '#FAF7F2', label: 'Negro elegante' },
    { primary: '#6C3483', bg: '#F5EEF8', label: 'Púrpura' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}>
          Elige los colores de tu carta
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--brand-muted)' }}>
          El color principal aparece en el header y los precios. El fondo en el cuerpo de la carta.
        </p>
      </div>

      {/* Presets */}
      <div>
        <Label className="text-xs mb-2 block">Paletas sugeridas</Label>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map(p => (
            <button
              key={p.primary}
              type="button"
              onClick={() => { setPrimaryColor(p.primary); setBgColor(p.bg) }}
              className="flex flex-col items-center gap-1 p-2 rounded-xl border transition-all hover:scale-105"
              style={{
                borderColor: primaryColor === p.primary ? p.primary : 'var(--brand-border)',
                borderWidth: primaryColor === p.primary ? 2 : 1,
              }}
            >
              <div className="flex gap-1">
                <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: p.primary }} />
                <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: p.bg, borderColor: 'var(--brand-border)' }} />
              </div>
              <span className="text-xs" style={{ color: 'var(--brand-muted)' }}>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom pickers */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs">Color principal</Label>
          <div className="flex gap-2 mt-1">
            <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
              className="h-10 w-12 rounded cursor-pointer border" style={{ borderColor: 'var(--brand-border)' }} />
            <Input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="font-mono text-sm" />
          </div>
        </div>
        <div>
          <Label className="text-xs">Color de fondo</Label>
          <div className="flex gap-2 mt-1">
            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
              className="h-10 w-12 rounded cursor-pointer border" style={{ borderColor: 'var(--brand-border)' }} />
            <Input value={bgColor} onChange={e => setBgColor(e.target.value)} className="font-mono text-sm" />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--brand-border)' }}>
        <div className="p-4 text-white text-center text-sm font-bold" style={{ backgroundColor: primaryColor }}>
          {data.name || 'Tu restaurante'}
        </div>
        <div className="p-4" style={{ backgroundColor: bgColor }}>
          <div className="text-sm font-bold mb-2" style={{ color: primaryColor }}>Categoría ejemplo</div>
          <div className="bg-white rounded-lg p-3 border flex justify-between" style={{ borderColor: '#eee' }}>
            <span className="text-sm font-medium">Plato ejemplo</span>
            <span className="text-sm font-bold" style={{ color: primaryColor }}>S/ 28.00</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1" style={{ borderColor: 'var(--brand-border)' }}>
          Atrás
        </Button>
        <Button
          onClick={async () => { setSaving(true); await onNext({ primaryColor, bgColor }); setSaving(false) }}
          disabled={saving}
          className="flex-1 gap-2 font-semibold"
          style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
          {saving ? 'Guardando...' : 'Siguiente'}
        </Button>
      </div>
    </div>
  )
}

// ── Step 3: Primera categoría ──────────────────────────────
function Step3({
  onNext,
  onBack,
}: {
  onNext: (categoryId: string) => Promise<void>
  onBack: () => void
}) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const SUGGESTIONS = ['Entradas', 'Platos de Fondo', 'Bebidas', 'Postres', 'Ensaladas', 'Pizzas']

  const handleNext = async () => {
    if (!name.trim()) return
    setSaving(true)
    const res = await fetch('/api/menu/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    })
    if (!res.ok) { setSaving(false); return }
    const cat = await res.json()
    await onNext(cat.id)
    setSaving(false)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}>
          Crea tu primera categoría
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--brand-muted)' }}>
          Las categorías agrupan tus platos. Puedes agregar más después.
        </p>
      </div>

      <div>
        <Label>Nombre de la categoría *</Label>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ej: Entradas, Platos de Fondo, Bebidas..."
          className="mt-1"
          onKeyDown={e => { if (e.key === 'Enter') handleNext() }}
          autoFocus
        />
      </div>

      <div>
        <p className="text-xs mb-2" style={{ color: 'var(--brand-muted)' }}>Sugerencias:</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setName(s)}
              className="px-3 py-1.5 rounded-full text-sm border transition-all hover:border-[var(--brand-gold)]"
              style={{
                borderColor: name === s ? 'var(--brand-gold)' : 'var(--brand-border)',
                backgroundColor: name === s ? 'var(--brand-warm)' : 'white',
                color: 'var(--brand-dark)',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1" style={{ borderColor: 'var(--brand-border)' }}>
          Atrás
        </Button>
        <Button
          onClick={handleNext}
          disabled={!name.trim() || saving}
          className="flex-1 gap-2 font-semibold"
          style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
          {saving ? 'Guardando...' : 'Siguiente'}
        </Button>
      </div>
    </div>
  )
}

// ── Step 4: Primer plato ───────────────────────────────────
function Step4({
  categoryId,
  onFinish,
  onBack,
}: {
  categoryId: string
  onFinish: () => Promise<void>
  onBack: () => void
}) {
  const [itemName, setItemName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [saving, setSaving] = useState(false)

  const handleFinish = async () => {
    if (!itemName.trim() || !price) return
    setSaving(true)
    await fetch('/api/menu/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: itemName.trim(),
        description: description.trim() || undefined,
        price: parseFloat(price),
        categoryId,
        isAvailable: true,
        allergens: [],
      }),
    })
    await onFinish()
    setSaving(false)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}>
          Agrega tu primer plato
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--brand-muted)' }}>
          Puedes agregar fotos, traducciones y más platos desde el panel.
        </p>
      </div>

      <div>
        <Label>Nombre del plato *</Label>
        <Input value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Ceviche Clásico" className="mt-1" autoFocus />
      </div>
      <div>
        <Label>Descripción <span className="text-xs font-normal" style={{ color: 'var(--brand-muted)' }}>(opcional)</span></Label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Con leche de tigre, choclo y cancha serrana" className="mt-1 text-sm" />
      </div>
      <div>
        <Label>Precio (S/) *</Label>
        <Input type="number" min="0" step="0.50" value={price} onChange={e => setPrice(e.target.value)} placeholder="28.00" className="mt-1" />
      </div>

      {/* Preview */}
      {itemName && price && (
        <div className="flex gap-3 p-3 rounded-xl border" style={{ backgroundColor: 'white', borderColor: 'var(--brand-border)' }}>
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: 'var(--brand-warm)' }}>
            🍽️
          </div>
          <div>
            <div className="flex justify-between items-start gap-4">
              <span className="font-semibold text-sm" style={{ color: 'var(--brand-dark)' }}>{itemName}</span>
              <span className="font-bold text-sm shrink-0" style={{ color: '#C0392B' }}>S/ {parseFloat(price || '0').toFixed(2)}</span>
            </div>
            {description && <p className="text-xs mt-0.5" style={{ color: 'var(--brand-muted)' }}>{description}</p>}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1" style={{ borderColor: 'var(--brand-border)' }}>
          Atrás
        </Button>
        <Button
          onClick={handleFinish}
          disabled={!itemName.trim() || !price || saving}
          className="flex-1 gap-2 font-semibold"
          style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : '🎉'}
          {saving ? 'Finalizando...' : '¡Finalizar setup!'}
        </Button>
      </div>
    </div>
  )
}

// ── Step 5: Completado ─────────────────────────────────────
function StepDone({ restaurantSlug }: { restaurantSlug: string }) {
  const router = useRouter()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return (
    <div className="text-center space-y-6 py-4">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto text-4xl"
        style={{ backgroundColor: 'var(--brand-warm)' }}>
        🎉
      </div>
      <div>
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}>
          ¡Tu carta está lista!
        </h2>
        <p className="text-sm mt-2" style={{ color: 'var(--brand-muted)' }}>
          Ya puedes compartirla con tus clientes.
        </p>
      </div>
      <div className="p-4 rounded-xl border text-left" style={{ backgroundColor: 'var(--brand-warm)', borderColor: 'var(--brand-border)' }}>
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--brand-muted)' }}>Tu link de carta:</p>
        <p className="font-mono text-sm break-all" style={{ color: 'var(--brand-dark)' }}>
          {appUrl}/{restaurantSlug}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <a href={`${appUrl}/${restaurantSlug}`} target="_blank" rel="noopener noreferrer">
          <Button className="w-full" variant="outline" style={{ borderColor: 'var(--brand-border)' }}>
            Ver mi carta →
          </Button>
        </a>
        <Button
          onClick={() => router.push('/dashboard')}
          className="w-full font-semibold"
          style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
        >
          Ir al panel
        </Button>
      </div>
    </div>
  )
}

// ── Main wizard ────────────────────────────────────────────
export default function OnboardingWizardPage() {
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null)
  const [restaurantSlug, setRestaurantSlug] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [categoryId, setCategoryId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/restaurants/me')
      .then(r => r.json())
      .then(data => {
        if (data.id) {
          setRestaurant(data)
          setRestaurantSlug(data.slug)
          // Resume from where they left off
          const step = Math.max(1, Math.min(data.onboardingStep + 1, 4))
          setCurrentStep(data.onboardingStep >= 4 ? 5 : step)
        }
        setLoading(false)
      })
  }, [])

  const saveStep = async (step: number, updates?: Partial<RestaurantData>) => {
    if (!restaurant) return
    const body: Record<string, unknown> = { onboardingStep: step }
    if (updates) Object.assign(body, updates)

    const res = await fetch(`/api/restaurants/${restaurant.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      const updated = await res.json()
      setRestaurant(updated)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin" style={{ color: '#1B4FD8' }} />
      </div>
    )
  }

  if (!restaurant) return null

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--brand-cream)' }}>
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}>
            Karta
          </span>
          <p className="text-sm mt-1" style={{ color: 'var(--brand-muted)' }}>
            Configuración inicial · {currentStep < 5 ? `Paso ${currentStep} de 4` : '¡Listo!'}
          </p>
        </div>

        <div className="rounded-2xl border p-8" style={{ backgroundColor: 'white', borderColor: 'var(--brand-border)' }}>
          {currentStep < 5 && <StepIndicator current={currentStep} />}

          {currentStep === 1 && (
            <Step1
              data={restaurant}
              onNext={async updates => {
                await saveStep(1, updates)
                setCurrentStep(2)
              }}
            />
          )}
          {currentStep === 2 && (
            <Step2
              data={restaurant}
              onNext={async updates => {
                await saveStep(2, updates)
                setCurrentStep(3)
              }}
              onBack={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 3 && (
            <Step3
              onNext={async catId => {
                await saveStep(3)
                setCategoryId(catId)
                setCurrentStep(4)
              }}
              onBack={() => setCurrentStep(2)}
            />
          )}
          {currentStep === 4 && (
            <Step4
              categoryId={categoryId}
              onFinish={async () => {
                await saveStep(4)
                setCurrentStep(5)
              }}
              onBack={() => setCurrentStep(3)}
            />
          )}
          {currentStep === 5 && <StepDone restaurantSlug={restaurantSlug} />}
        </div>

        {currentStep < 5 && (
          <button
            onClick={() => router.push('/dashboard')}
            className="block text-center text-xs mt-4 w-full hover:opacity-70"
            style={{ color: 'var(--brand-muted)' }}
          >
            Saltar por ahora → completar más tarde
          </button>
        )}
      </div>
    </div>
  )
}

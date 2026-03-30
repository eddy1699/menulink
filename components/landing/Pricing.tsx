import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: '39.90',
    desc: 'Para empezar',
    features: [
      'Hasta 20 platos',
      'Hasta 10 categorías',
      'Link + QR descargable',
      'Colores y logo personalizados',
      'Multiidioma ES/EN/PT',
      'Modo agotado en tiempo real',
    ],
    popular: false,
    cta: 'Empezar ahora',
  },
  {
    name: 'Pro',
    price: '79.90',
    desc: 'El más elegido',
    features: [
      'Hasta 80 platos',
      'Hasta 20 categorías',
      'Link + QR descargable',
      'Colores y logo personalizados',
      'Multiidioma ES/EN/PT',
      'Modo agotado en tiempo real',
      'Fotos de tus platos',
      'Analítica básica de visitas',
      'Hasta 3 menús',
    ],
    popular: true,
    cta: 'Empezar ahora',
  },
  {
    name: 'Business',
    price: '119.90',
    desc: 'Para cadenas',
    features: [
      'Platos y categorías ilimitados',
      'Link + QR descargable',
      'Colores y logo personalizados',
      'Multiidioma ES/EN/PT',
      'Modo agotado en tiempo real',
      'Fotos ilimitadas',
      'Analítica avanzada',
      'Menús y sucursales ilimitados',
      'Soporte prioritario',
    ],
    popular: false,
    cta: 'Contactar ventas',
  },
]

const allPlansInclude = [
  'Link público + QR descargable',
  'Colores y logo personalizados',
  'Multiidioma ES/EN/PT',
  'Modo agotado en tiempo real',
  'Sin contrato de permanencia',
]

export function Pricing() {
  return (
    <section id="precios" className="py-20 px-4" style={{ backgroundColor: 'var(--brand-warm)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
          >
            Precios claros, sin sorpresas
          </h2>
          <p className="text-lg" style={{ color: 'var(--brand-muted)' }}>
            Sin contrato de permanencia · Sin tarjeta de crédito para empezar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-2xl border flex flex-col ${plan.popular ? 'shadow-xl scale-105' : ''}`}
              style={{
                backgroundColor: plan.popular ? 'var(--brand-dark)' : 'var(--brand-cream)',
                borderColor: plan.popular ? 'var(--brand-gold)' : 'var(--brand-border)',
                borderWidth: plan.popular ? '2px' : '1px',
              }}
            >
              {plan.popular && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs font-semibold px-4 py-1 rounded-full"
                  style={{ backgroundColor: 'var(--brand-gold)', color: 'var(--brand-dark)' }}
                >
                  Más popular
                </div>
              )}
              <div className="mb-6">
                <div
                  className="text-xl font-bold mb-1"
                  style={{
                    fontFamily: 'var(--font-playfair)',
                    color: plan.popular ? 'white' : 'var(--brand-dark)',
                  }}
                >
                  {plan.name}
                </div>
                <div className="text-sm mb-4" style={{ color: plan.popular ? 'rgba(255,255,255,0.7)' : 'var(--brand-muted)' }}>
                  {plan.desc}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm" style={{ color: plan.popular ? 'rgba(255,255,255,0.7)' : 'var(--brand-muted)' }}>
                    S/
                  </span>
                  <span
                    className="text-4xl font-bold"
                    style={{
                      fontFamily: 'var(--font-playfair)',
                      color: plan.popular ? 'var(--brand-gold)' : 'var(--brand-dark)',
                    }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-sm" style={{ color: plan.popular ? 'rgba(255,255,255,0.7)' : 'var(--brand-muted)' }}>
                    /mes
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check
                      size={16}
                      className="mt-0.5 shrink-0"
                      style={{ color: 'var(--brand-gold)' }}
                    />
                    <span className="text-sm" style={{ color: plan.popular ? 'rgba(255,255,255,0.85)' : 'var(--brand-muted)' }}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href="/registro">
                <Button
                  className="w-full font-semibold"
                  style={
                    plan.popular
                      ? { backgroundColor: 'var(--brand-gold)', color: 'var(--brand-dark)' }
                      : { backgroundColor: 'var(--brand-dark)', color: 'white' }
                  }
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* All plans include */}
        <div
          className="p-6 rounded-2xl border text-center"
          style={{ backgroundColor: 'var(--brand-cream)', borderColor: 'var(--brand-border)' }}
        >
          <h3
            className="font-semibold mb-4"
            style={{ color: 'var(--brand-dark)' }}
          >
            Todos los planes incluyen
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {allPlansInclude.map((f) => (
              <div key={f} className="flex items-center gap-2">
                <Check size={14} style={{ color: 'var(--brand-gold)' }} />
                <span className="text-sm" style={{ color: 'var(--brand-muted)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: '9.90',
    desc: 'Para empezar',
    href: '/registro',
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
    price: '19.90',
    desc: 'El más elegido',
    href: '/registro',
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
    price: '29.90',
    desc: 'Para cadenas',
    href: '/onboarding',
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
    <section id="precios" className="py-20 px-4 bg-[#F5F5F7]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4 text-[#0D0D0D]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Precios claros, sin sorpresas
          </h2>
          <p className="text-lg text-[#6B7280]">
            Sin contrato de permanencia · Sin tarjeta de crédito para empezar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-2xl border flex flex-col ${plan.popular ? 'shadow-xl scale-105' : 'shadow-[0_2px_12px_rgba(0,0,0,0.06)]'}`}
              style={{
                backgroundColor: plan.popular ? '#0D0D0D' : '#FFFFFF',
                borderColor: plan.popular ? '#1B4FD8' : '#E4E4E7',
                borderWidth: plan.popular ? '2px' : '1px',
              }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full bg-[#1B4FD8] text-white uppercase tracking-widest">
                  Más popular
                </div>
              )}

              <div className="mb-6">
                <div
                  className="text-xl font-bold mb-1"
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: plan.popular ? '#fff' : '#0D0D0D',
                  }}
                >
                  {plan.name}
                </div>
                <div className="text-sm mb-4" style={{ color: plan.popular ? '#6B7280' : '#6B7280' }}>
                  {plan.desc}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-[#6B7280]">S/</span>
                  <span
                    className="text-4xl font-bold"
                    style={{
                      fontFamily: 'var(--font-display)',
                      color: plan.popular ? '#3D6FFF' : '#1B4FD8',
                    }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-sm text-[#6B7280]">/mes</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={15} className="mt-0.5 shrink-0 text-[#1B4FD8]" />
                    <span className="text-sm" style={{ color: plan.popular ? 'rgba(255,255,255,0.8)' : '#6B7280' }}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href}>
                <Button
                  className="w-full font-semibold rounded-[10px] transition-all duration-200"
                  style={
                    plan.popular
                      ? { backgroundColor: '#1B4FD8', color: '#fff' }
                      : { backgroundColor: '#EEF2FF', color: '#1B4FD8' }
                  }
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="p-6 rounded-2xl border border-[#E4E4E7] bg-white text-center">
          <h3 className="font-bold mb-4 text-[#0D0D0D]">Todos los planes incluyen</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {allPlansInclude.map((f) => (
              <div key={f} className="flex items-center gap-2">
                <Check size={14} className="text-[#1B4FD8]" />
                <span className="text-sm text-[#6B7280]">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

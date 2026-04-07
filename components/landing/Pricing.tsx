'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

const BASE_PRICES: Record<string, number> = { Starter: 9.90, Pro: 19.90, Business: 29.90 }

type Period = '1' | '6' | '12'

const PERIODS: { value: Period; label: string; discount: number; badge?: string }[] = [
  { value: '1',  label: 'Mensual',    discount: 0 },
  { value: '6',  label: '6 meses',   discount: 4.5, badge: '-4.5%' },
  { value: '12', label: '12 meses',  discount: 10,  badge: '-10%' },
]

function calcPrice(base: number, period: Period) {
  const months = parseInt(period)
  const discount = PERIODS.find(p => p.value === period)!.discount
  return parseFloat((base * months * (1 - discount / 100)).toFixed(2))
}

function perMonth(base: number, period: Period) {
  const months = parseInt(period)
  const discount = PERIODS.find(p => p.value === period)!.discount
  return parseFloat((base * (1 - discount / 100)).toFixed(2))
}

const plans = [
  {
    name: 'Starter',
    desc: 'Para empezar',
    href: '/registro',
    features: [
      'Hasta 25 platos, bebidas o productos',
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
    desc: 'Para cadenas',
    href: '/registro',
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
    cta: 'Empezar ahora',
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
  const [period, setPeriod] = useState<Period>('1')

  return (
    <section id="precios" className="py-20 px-4 bg-[#F5F5F7]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[#0D0D0D]" style={{ fontFamily: 'var(--font-display)' }}>
            Precios claros, sin sorpresas
          </h2>
          <p className="text-lg text-[#6B7280] mb-8">Sin contrato de permanencia · Cancela cuando quieras</p>

          {/* Period toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white border border-[#E4E4E7]">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: period === p.value ? '#1B4FD8' : 'transparent',
                  color: period === p.value ? '#fff' : '#6B7280',
                }}
              >
                {p.label}
                {p.badge && (
                  <span
                    className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: period === p.value ? '#22c55e' : '#dcfce7',
                      color: period === p.value ? '#fff' : '#16a34a',
                    }}
                  >
                    {p.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
          {period !== '1' && (
            <p className="text-sm text-[#16a34a] font-medium mt-3">
              ✓ Pagas todo junto y ahorras un {PERIODS.find(p => p.value === period)!.discount}%
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => {
            const base = BASE_PRICES[plan.name]
            const total = calcPrice(base, period)
            const monthly = perMonth(base, period)
            const months = parseInt(period)

            return (
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
                  <div className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: plan.popular ? '#fff' : '#0D0D0D' }}>
                    {plan.name}
                  </div>
                  <div className="text-sm mb-4 text-[#6B7280]">{plan.desc}</div>

                  {period === '1' ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm text-[#6B7280]">S/</span>
                      <span className="text-4xl font-bold" style={{ fontFamily: 'var(--font-display)', color: plan.popular ? '#3D6FFF' : '#1B4FD8' }}>
                        {base.toFixed(2)}
                      </span>
                      <span className="text-sm text-[#6B7280]">/mes</span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-[#6B7280]">S/</span>
                        <span className="text-4xl font-bold" style={{ fontFamily: 'var(--font-display)', color: plan.popular ? '#3D6FFF' : '#1B4FD8' }}>
                          {total.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-[#6B7280]">S/ {monthly.toFixed(2)}/mes · {months} meses</span>
                        <span className="text-xs line-through text-[#9CA3AF]">S/ {(base * months).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check size={15} className="mt-0.5 shrink-0 text-[#1B4FD8]" />
                      <span className="text-sm" style={{ color: plan.popular ? 'rgba(255,255,255,0.8)' : '#6B7280' }}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.href}>
                  <Button
                    className="w-full font-semibold rounded-[10px] transition-all duration-200"
                    style={plan.popular ? { backgroundColor: '#1B4FD8', color: '#fff' } : { backgroundColor: '#EEF2FF', color: '#1B4FD8' }}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            )
          })}
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

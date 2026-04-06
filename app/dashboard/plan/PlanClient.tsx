'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X, Clock, CreditCard, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { PLAN_NAMES, PLAN_PRICES } from '@/lib/plan-limits'
import { PaymentForm } from '@/components/dashboard/PaymentForm'

const PLAN_FEATURES = {
  STARTER: [
    'Hasta 20 platos',
    'Hasta 10 categorías',
    'Link + QR descargable',
    'Multiidioma ES/EN/PT',
  ],
  PRO: [
    'Hasta 80 platos',
    'Hasta 20 categorías',
    'Fotos de platos',
    'Analítica básica',
    'Hasta 3 menús',
  ],
  BUSINESS: [
    'Platos y categorías ilimitados',
    'Fotos ilimitadas',
    'Analítica avanzada',
    'Sucursales ilimitadas',
    'Soporte prioritario',
  ],
}

type Plan = 'STARTER' | 'PRO' | 'BUSINESS'

interface Transaction {
  id: string
  plan: string
  amount: number
  status: string
  orderId: string
  createdAt: string
}

interface Props {
  restaurantId: string
  currentPlan: Plan
  planExpiresAt: string | null
  trialEndsAt: string | null
  isInTrial: boolean
  trialDaysLeft: number
  planExpired: boolean
  transactions: Transaction[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount)
}

export function PlanClient({
  restaurantId,
  currentPlan,
  planExpiresAt,
  trialEndsAt,
  isInTrial,
  trialDaysLeft,
  planExpired,
  transactions,
}: Props) {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [formToken, setFormToken] = useState<string | null>(null)
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null)

  const handleSelectPlan = async (plan: Plan) => {
    setLoadingPlan(plan)
    setPaymentError(null)

    try {
      const res = await fetch('/api/payments/create-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()

      if (!res.ok || !data.formToken) {
        setPaymentError(data.error || 'Error al iniciar el pago')
        return
      }

      setSelectedPlan(plan)
      setFormToken(data.formToken)
    } catch {
      setPaymentError('Error de conexión. Intenta nuevamente.')
    } finally {
      setLoadingPlan(null)
    }
  }

  const handleSuccess = useCallback((plan: string) => {
    setPaymentSuccess(plan)
    setSelectedPlan(null)
    setFormToken(null)
    setTimeout(() => router.refresh(), 2000)
  }, [router])

  const handleError = useCallback((msg: string) => {
    setPaymentError(msg)
  }, [])

  const cancelPayment = () => {
    setSelectedPlan(null)
    setFormToken(null)
    setPaymentError(null)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}
        >
          Mi Plan
        </h1>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge style={{ backgroundColor: '#1B4FD8', color: '#fff' }}>
            {PLAN_NAMES[currentPlan]}
          </Badge>

          {isInTrial && (
            <div className="flex items-center gap-1 text-sm px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--brand-warm)', color: 'var(--brand-muted)' }}>
              <Clock size={12} />
              Trial gratuito · {trialDaysLeft} día{trialDaysLeft !== 1 ? 's' : ''} restante{trialDaysLeft !== 1 ? 's' : ''}
            </div>
          )}

          {planExpired && !isInTrial && (
            <div className="flex items-center gap-1 text-sm px-2 py-0.5 rounded-full bg-red-50 text-red-600">
              <AlertTriangle size={12} />
              Plan vencido
            </div>
          )}

          {planExpiresAt && !planExpired && !isInTrial && (
            <span className="text-sm" style={{ color: 'var(--brand-muted)' }}>
              Expira: {formatDate(planExpiresAt)}
            </span>
          )}
        </div>
      </div>

      {/* Trial banner */}
      {isInTrial && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl border"
          style={{ backgroundColor: '#FFF9EC', borderColor: '#F0D89A' }}
        >
          <Clock size={18} className="mt-0.5 shrink-0" style={{ color: '#B8860B' }} />
          <div>
            <p className="font-semibold text-sm" style={{ color: '#7A5C00' }}>
              Estás en tu período de prueba gratuito
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#9A7B20' }}>
              Te quedan <strong>{trialDaysLeft} días</strong>. Elige un plan para continuar sin interrupciones
              {trialEndsAt ? ` después del ${formatDate(trialEndsAt)}` : ''}.
            </p>
          </div>
        </div>
      )}

      {/* Expired banner */}
      {planExpired && !isInTrial && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-500" />
          <div>
            <p className="font-semibold text-sm text-red-700">Tu plan ha vencido</p>
            <p className="text-xs mt-0.5 text-red-500">
              Tu carta digital puede estar limitada. Renueva tu plan para reactivarla.
            </p>
          </div>
        </div>
      )}

      {/* Payment success */}
      {paymentSuccess && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-green-200 bg-green-50">
          <CheckCircle2 size={18} className="shrink-0 text-green-600" />
          <p className="text-sm font-semibold text-green-700">
            ¡Pago exitoso! Tu plan {PLAN_NAMES[paymentSuccess as Plan] ?? paymentSuccess} está activo.
          </p>
        </div>
      )}

      {/* Plan cards */}
      {!selectedPlan && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.keys(PLAN_FEATURES) as Plan[]).map((plan) => {
            const isCurrent = plan === currentPlan && !planExpired
            const isUpgrade = plan !== currentPlan || planExpired

            return (
              <Card
                key={plan}
                className="border"
                style={{
                  borderColor: isCurrent ? 'var(--brand-gold)' : 'var(--brand-border)',
                  borderWidth: isCurrent ? '2px' : '1px',
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--brand-dark)' }}>
                      {PLAN_NAMES[plan]}
                    </CardTitle>
                    {isCurrent && (
                      <Badge className="text-xs" style={{ backgroundColor: '#1B4FD8', color: '#fff' }}>
                        Actual
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-sm" style={{ color: 'var(--brand-muted)' }}>S/</span>
                    <span className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}>
                      {PLAN_PRICES[plan].toFixed(2)}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--brand-muted)' }}>/mes</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {PLAN_FEATURES[plan].map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <Check size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--brand-gold)' }} />
                      <span className="text-xs" style={{ color: 'var(--brand-muted)' }}>{f}</span>
                    </div>
                  ))}

                  {isUpgrade && (
                    <Button
                      className="w-full mt-4 text-sm font-semibold"
                      style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
                      disabled={loadingPlan === plan}
                      onClick={() => handleSelectPlan(plan)}
                    >
                      <CreditCard size={14} className="mr-1.5" />
                      {loadingPlan === plan ? 'Cargando…' : isCurrent && planExpired ? 'Renovar' : `Contratar ${PLAN_NAMES[plan]}`}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Payment form */}
      {selectedPlan && formToken && (
        <div
          className="rounded-2xl border p-6 space-y-4"
          style={{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-cream)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}>
                Pago seguro — Plan {PLAN_NAMES[selectedPlan]}
              </h2>
              <p className="text-sm mt-0.5" style={{ color: 'var(--brand-muted)' }}>
                {formatAmount(PLAN_PRICES[selectedPlan])} / mes · Renovación manual
              </p>
            </div>
            <button
              onClick={cancelPayment}
              className="text-sm flex items-center gap-1 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--brand-muted)' }}
            >
              <X size={14} /> Cancelar
            </button>
          </div>

          {paymentError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {paymentError}
            </div>
          )}

          <PaymentForm
            formToken={formToken}
            onSuccess={handleSuccess}
            onError={handleError}
          />

          <p className="text-xs text-center" style={{ color: 'var(--brand-muted)' }}>
            Pago procesado de forma segura por Izipay · PCI-DSS Nivel 1
          </p>
        </div>
      )}

      {/* Error outside form */}
      {paymentError && !selectedPlan && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {paymentError}
        </div>
      )}

      {/* Transaction history */}
      {transactions.length > 0 && (
        <div>
          <h2 className="font-semibold text-base mb-3" style={{ color: 'var(--brand-dark)' }}>
            Historial de pagos
          </h2>
          <div
            className="rounded-xl border overflow-x-auto"
            style={{ borderColor: 'var(--brand-border)' }}
          >
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr style={{ backgroundColor: 'var(--brand-warm)' }}>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--brand-muted)' }}>Fecha</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--brand-muted)' }}>Plan</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--brand-muted)' }}>Monto</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--brand-muted)' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr
                    key={tx.id}
                    className="border-t"
                    style={{ borderColor: 'var(--brand-border)', backgroundColor: i % 2 === 0 ? '#fff' : 'var(--brand-cream)' }}
                  >
                    <td className="px-4 py-3" style={{ color: 'var(--brand-dark)' }}>
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--brand-dark)' }}>
                      {PLAN_NAMES[tx.plan as Plan] ?? tx.plan}
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--brand-dark)' }}>
                      {formatAmount(tx.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className="text-xs"
                        style={{
                          backgroundColor: tx.status === 'PAID' ? '#d1fae5' : tx.status === 'FAILED' ? '#fee2e2' : '#fef9c3',
                          color: tx.status === 'PAID' ? '#065f46' : tx.status === 'FAILED' ? '#991b1b' : '#854d0e',
                        }}
                      >
                        {tx.status === 'PAID' ? 'Pagado' : tx.status === 'FAILED' ? 'Fallido' : 'Pendiente'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

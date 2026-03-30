import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { PLAN_LIMITS, PLAN_NAMES, PLAN_PRICES } from '@/lib/plan-limits'
import { formatDate } from '@/lib/utils'

export default async function PlanPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const restaurant = await prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
    select: { plan: true, planExpiresAt: true },
  })

  if (!restaurant) redirect('/dashboard')

  const currentPlan = restaurant.plan

  const planFeatures = {
    STARTER: ['Hasta 20 platos', 'Hasta 10 categorías', 'Link + QR descargable', 'Multiidioma ES/EN/PT'],
    PRO: ['Hasta 80 platos', 'Hasta 20 categorías', 'Fotos de platos', 'Analítica básica', 'Hasta 3 menús'],
    BUSINESS: ['Platos y categorías ilimitados', 'Fotos ilimitadas', 'Analítica avanzada', 'Sucursales ilimitadas', 'Soporte prioritario'],
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
        >
          Mi Plan
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge style={{ backgroundColor: 'var(--brand-gold)', color: 'var(--brand-dark)' }}>
            Plan actual: {PLAN_NAMES[currentPlan]}
          </Badge>
          {restaurant.planExpiresAt && (
            <span className="text-sm" style={{ color: 'var(--brand-muted)' }}>
              Expira: {formatDate(restaurant.planExpiresAt)}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(PLAN_LIMITS) as Array<keyof typeof PLAN_LIMITS>).map((plan) => {
          const isCurrent = plan === currentPlan
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
                  <CardTitle style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.1rem' }}>
                    {PLAN_NAMES[plan]}
                  </CardTitle>
                  {isCurrent && (
                    <Badge
                      className="text-xs"
                      style={{ backgroundColor: 'var(--brand-gold)', color: 'var(--brand-dark)' }}
                    >
                      Actual
                    </Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-sm" style={{ color: 'var(--brand-muted)' }}>S/</span>
                  <span
                    className="text-3xl font-bold"
                    style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
                  >
                    {PLAN_PRICES[plan].toFixed(2)}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--brand-muted)' }}>/mes</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {planFeatures[plan].map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <Check size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--brand-gold)' }} />
                    <span className="text-xs" style={{ color: 'var(--brand-muted)' }}>{f}</span>
                  </div>
                ))}
                {!isCurrent && (
                  <Button
                    className="w-full mt-4 text-sm font-semibold"
                    style={{
                      backgroundColor: 'var(--brand-gold)',
                      color: 'var(--brand-dark)',
                    }}
                  >
                    Cambiar a {PLAN_NAMES[plan]}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div
        className="p-4 rounded-xl border text-sm"
        style={{ backgroundColor: 'var(--brand-warm)', borderColor: 'var(--brand-border)', color: 'var(--brand-muted)' }}
      >
        Para cambiar de plan o necesitar ayuda, contáctanos en{' '}
        <a href="mailto:hola@menuqr.pe" className="underline" style={{ color: 'var(--brand-gold)' }}>
          hola@menuqr.pe
        </a>
      </div>
    </div>
  )
}

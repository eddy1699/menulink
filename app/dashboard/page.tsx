import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UtensilsCrossed, Eye, QrCode, TrendingUp, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { PLAN_NAMES } from '@/lib/plan-limits'
import { formatDate } from '@/lib/utils'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const restaurant = await prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
    include: {
      categories: { include: { items: true } },
      visits: { orderBy: { createdAt: 'desc' }, take: 30 },
    },
  })

  if (!restaurant) {
    return (
      <div className="text-center py-20">
        <p>No se encontró restaurante. Contacta soporte.</p>
      </div>
    )
  }

  const totalItems = restaurant.categories.reduce((acc, cat) => acc + cat.items.length, 0)
  const availableItems = restaurant.categories.reduce(
    (acc, cat) => acc + cat.items.filter((i) => i.isAvailable).length,
    0
  )
  const totalVisits = restaurant.visits.length
  const menuUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${restaurant.slug}`

  const wizardIncomplete = restaurant.onboardingStep < 4

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl">
      {/* Wizard banner */}
      {wizardIncomplete && (
        <div
          className="flex items-center justify-between gap-4 p-4 rounded-2xl border"
          style={{ backgroundColor: 'var(--brand-dark)', borderColor: 'var(--brand-gold)' }}
        >
          <div className="flex items-center gap-3">
            <Sparkles size={20} style={{ color: 'var(--brand-gold)' }} />
            <div>
              <p className="font-semibold text-sm text-white">
                Completa la configuración inicial
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Paso {restaurant.onboardingStep + 1} de 4 — Tu carta no está lista aún
              </p>
            </div>
          </div>
          <Link href="/dashboard/onboarding">
            <Button size="sm" className="shrink-0 font-semibold" style={{ backgroundColor: '#1B4FD8', color: '#fff' }}>
              Continuar →
            </Button>
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}
          >
            Bienvenido, {session.user.name?.split(' ')[0]}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--brand-muted)' }}>
            {restaurant.name} · {restaurant.district ? `${restaurant.district}, ` : ''}{restaurant.city}
          </p>
        </div>
        <Badge
          className="self-start text-sm px-3 py-1"
          style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
        >
          Plan {PLAN_NAMES[restaurant.plan]}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Platos', value: totalItems, sub: `${availableItems} disponibles`, icon: UtensilsCrossed },
          { label: 'Categorías', value: restaurant.categories.length, sub: 'activas', icon: UtensilsCrossed },
          { label: 'Visitas (30d)', value: totalVisits, sub: 'últimos 30 días', icon: Eye },
          { label: 'Tu carta', value: 'Activa', sub: restaurant.isActive ? '✓ Publicada' : '× Inactiva', icon: TrendingUp },
        ].map((stat) => (
          <Card key={stat.label} className="border" style={{ borderColor: 'var(--brand-border)' }}>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-medium" style={{ color: 'var(--brand-muted)' }}>
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div
                className="text-2xl font-bold"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}
              >
                {stat.value}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--brand-muted)' }}>
                {stat.sub}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border" style={{ borderColor: 'var(--brand-border)' }}>
          <CardHeader>
            <CardTitle className="text-base" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}>
              Acciones rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <Link href="/dashboard/menu" className="block">
                <div
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border aspect-square transition-all hover:shadow-md hover:-translate-y-0.5"
                  style={{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-cream)' }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EEF2FF' }}>
                    <UtensilsCrossed size={20} style={{ color: '#1B4FD8' }} />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight" style={{ color: 'var(--brand-dark)' }}>
                    Editar carta
                  </span>
                </div>
              </Link>

              <Link href="/dashboard/qr" className="block">
                <div
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border aspect-square transition-all hover:shadow-md hover:-translate-y-0.5"
                  style={{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-cream)' }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EEF2FF' }}>
                    <QrCode size={20} style={{ color: '#1B4FD8' }} />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight" style={{ color: 'var(--brand-dark)' }}>
                    Ver mi QR
                  </span>
                </div>
              </Link>

              <a href={menuUrl} target="_blank" rel="noopener noreferrer" className="block">
                <div
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border aspect-square transition-all hover:shadow-md hover:-translate-y-0.5"
                  style={{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-cream)' }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EEF2FF' }}>
                    <Eye size={20} style={{ color: '#1B4FD8' }} />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight" style={{ color: 'var(--brand-dark)' }}>
                    Ver carta publicada
                  </span>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="border" style={{ borderColor: 'var(--brand-border)' }}>
          <CardHeader>
            <CardTitle
              className="text-base"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}
            >
              Tu link de carta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="p-3 rounded-lg border text-sm font-mono break-all"
              style={{
                backgroundColor: 'var(--brand-warm)',
                borderColor: 'var(--brand-border)',
                color: 'var(--brand-dark)',
              }}
            >
              {menuUrl}
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--brand-muted)' }}>
              Comparte este link o imprime tu QR para que tus clientes lo escaneen.
            </p>
            {restaurant.planExpiresAt && (
              <p className="text-xs mt-2 text-orange-600">
                Plan expira: {formatDate(restaurant.planExpiresAt)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

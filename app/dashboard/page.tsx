import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UtensilsCrossed, Eye, QrCode, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PLAN_NAMES } from '@/lib/plan-limits'
import { formatDate } from '@/lib/utils'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const restaurant = await prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
    include: {
      categories: {
        include: { items: true },
      },
      visits: {
        orderBy: { createdAt: 'desc' },
        take: 30,
      },
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

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
          >
            Bienvenido, {session.user.name?.split(' ')[0]}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--brand-muted)' }}>
            {restaurant.name} · {restaurant.district ? `${restaurant.district}, ` : ''}{restaurant.city}
          </p>
        </div>
        <Badge
          className="self-start text-sm px-3 py-1"
          style={{ backgroundColor: 'var(--brand-gold)', color: 'var(--brand-dark)' }}
        >
          Plan {PLAN_NAMES[restaurant.plan]}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
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
            <CardTitle
              className="text-base"
              style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
            >
              Acciones rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/menu">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                style={{ borderColor: 'var(--brand-border)' }}
              >
                <UtensilsCrossed size={16} />
                Editar carta
              </Button>
            </Link>
            <Link href="/dashboard/qr">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                style={{ borderColor: 'var(--brand-border)' }}
              >
                <QrCode size={16} />
                Ver mi QR
              </Button>
            </Link>
            <a href={menuUrl} target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                style={{ borderColor: 'var(--brand-border)' }}
              >
                <Eye size={16} />
                Ver carta publicada
              </Button>
            </a>
          </CardContent>
        </Card>

        <Card className="border" style={{ borderColor: 'var(--brand-border)' }}>
          <CardHeader>
            <CardTitle
              className="text-base"
              style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
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

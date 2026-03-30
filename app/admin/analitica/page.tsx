import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminAnaliticaPage() {
  const [totalVisits, , topRestaurants] = await Promise.all([
    prisma.visit.count(),
    prisma.visit.groupBy({
      by: ['restaurantId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
    prisma.restaurant.findMany({
      include: { _count: { select: { visits: true } } },
      orderBy: { visits: { _count: 'desc' } },
      take: 10,
    }),
  ])

  // Visits last 30 days grouped by day
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const recentVisitsCount = await prisma.visit.count({
    where: { createdAt: { gte: thirtyDaysAgo } },
  })

  return (
    <div className="space-y-6 max-w-5xl">
      <h1
        className="text-2xl font-bold"
        style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
      >
        Analítica Global
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Visitas totales', value: totalVisits },
          { label: 'Visitas (30d)', value: recentVisitsCount },
          { label: 'Promedio diario (30d)', value: Math.round(recentVisitsCount / 30) },
        ].map((stat) => (
          <Card key={stat.label} style={{ borderColor: 'var(--brand-border)' }}>
            <CardContent className="p-4">
              <div className="text-xs mb-1" style={{ color: 'var(--brand-muted)' }}>{stat.label}</div>
              <div
                className="text-3xl font-bold"
                style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
              >
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card style={{ borderColor: 'var(--brand-border)' }}>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem' }}>
            Top restaurantes por visitas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topRestaurants.map((r) => {
              const pct = totalVisits > 0 ? Math.round((r._count.visits / totalVisits) * 100) : 0
              return (
                <div key={r.id} className="flex items-center gap-3">
                  <div className="w-40 text-sm truncate" style={{ color: 'var(--brand-dark)' }}>
                    {r.name}
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: 'var(--brand-gold)' }}
                    />
                  </div>
                  <div className="text-sm w-16 text-right" style={{ color: 'var(--brand-muted)' }}>
                    {r._count.visits} visitas
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

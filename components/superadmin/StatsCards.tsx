import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatsCardsProps {
  stats: {
    totalRestaurants: number
    totalUsers: number
    totalVisits: number
    newThisMonth: number
    planDistribution: Array<{ plan: string; _count: { plan: number } }>
  }
}

export function StatsCards({ stats }: StatsCardsProps) {

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Restaurantes activos', value: stats.totalRestaurants },
        { label: 'Usuarios totales', value: stats.totalUsers },
        { label: 'Visitas totales', value: stats.totalVisits },
        { label: 'Nuevos este mes', value: stats.newThisMonth },
      ].map((stat) => (
        <Card key={stat.label} className="border" style={{ borderColor: 'var(--brand-border)' }}>
          <CardHeader className="pb-1 pt-4 px-4">
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
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

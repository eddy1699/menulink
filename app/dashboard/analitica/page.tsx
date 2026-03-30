import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VisitsChart } from '@/components/dashboard/VisitsChart'
import { getPlanLimits } from '@/lib/plan-limits'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AnaliticaPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const restaurant = await prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
    include: {
      visits: {
        orderBy: { createdAt: 'desc' },
        take: 365,
      },
    },
  })

  if (!restaurant) redirect('/dashboard')

  const limits = getPlanLimits(restaurant.plan)

  if (!limits.allowAnalytics) {
    return (
      <div className="space-y-6 max-w-2xl">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
        >
          Analítica
        </h1>
        <div
          className="text-center p-12 rounded-2xl border-2 border-dashed"
          style={{ borderColor: 'var(--brand-border)' }}
        >
          <div className="text-4xl mb-4">📊</div>
          <h2
            className="text-xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
          >
            Analítica disponible en Plan Pro
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--brand-muted)' }}>
            Conoce cuántos clientes visitan tu carta, desde qué idioma y en qué horarios.
          </p>
          <Link href="/dashboard/plan">
            <Button style={{ backgroundColor: 'var(--brand-gold)', color: 'var(--brand-dark)' }}>
              Actualizar a Pro →
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Aggregate visits by day (last 30 days)
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const recentVisits = restaurant.visits.filter((v) => v.createdAt >= thirtyDaysAgo)

  // Group by day
  const visitsByDay: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().split('T')[0]
    visitsByDay[key] = 0
  }
  recentVisits.forEach((v) => {
    const key = v.createdAt.toISOString().split('T')[0]
    if (visitsByDay[key] !== undefined) {
      visitsByDay[key]++
    }
  })

  const chartData = Object.entries(visitsByDay).map(([date, count]) => ({
    date,
    visits: count,
  }))

  // Language breakdown
  const langCounts: Record<string, number> = {}
  restaurant.visits.forEach((v) => {
    const lang = v.language || 'es'
    langCounts[lang] = (langCounts[lang] || 0) + 1
  })

  return (
    <div className="space-y-6 max-w-4xl">
      <h1
        className="text-2xl font-bold"
        style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
      >
        Analítica
      </h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Visitas totales', value: restaurant.visits.length },
          { label: 'Últimos 30 días', value: recentVisits.length },
          { label: 'Promedio diario', value: Math.round(recentVisits.length / 30) },
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

      {/* Chart */}
      <Card style={{ borderColor: 'var(--brand-border)' }}>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem' }}>
            Visitas en los últimos 30 días
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VisitsChart data={chartData} primaryColor={restaurant.primaryColor} />
        </CardContent>
      </Card>

      {/* Languages */}
      <Card style={{ borderColor: 'var(--brand-border)' }}>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-playfair)', fontSize: '1rem' }}>
            Idiomas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(langCounts).length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--brand-muted)' }}>Sin datos aún.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(langCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([lang, count]) => {
                  const total = restaurant.visits.length
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0
                  const langNames: Record<string, string> = { es: 'Español', en: 'English', pt: 'Português' }
                  return (
                    <div key={lang} className="flex items-center gap-3">
                      <div className="w-12 text-sm font-medium" style={{ color: 'var(--brand-dark)' }}>
                        {langNames[lang] || lang}
                      </div>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: restaurant.primaryColor }}
                        />
                      </div>
                      <div className="text-sm" style={{ color: 'var(--brand-muted)' }}>
                        {count} ({pct}%)
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

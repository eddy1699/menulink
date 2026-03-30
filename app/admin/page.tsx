import { prisma } from '@/lib/prisma'
import { StatsCards } from '@/components/superadmin/StatsCards'
import { RestaurantTable } from '@/components/superadmin/RestaurantTable'

export default async function AdminDashboard() {
  const [totalRestaurants, totalUsers, totalVisits, planDistribution, restaurants, newThisMonth] =
    await Promise.all([
      prisma.restaurant.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.visit.count(),
      prisma.restaurant.groupBy({ by: ['plan'], _count: { plan: true } }),
      prisma.restaurant.findMany({
        include: { owner: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.restaurant.count({
        where: { createdAt: { gte: new Date(new Date().setDate(1)) } },
      }),
    ])

  const stats = {
    totalRestaurants,
    totalUsers,
    totalVisits,
    newThisMonth,
    planDistribution,
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <h1
        className="text-2xl font-bold"
        style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
      >
        Dashboard Superadmin
      </h1>

      <StatsCards stats={stats} />

      <div>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
        >
          Últimos restaurantes
        </h2>
        <RestaurantTable
          restaurants={restaurants.map((r) => ({
            ...r,
            createdAt: r.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  )
}

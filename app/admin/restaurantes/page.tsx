import { prisma } from '@/lib/prisma'
import { RestaurantTable } from '@/components/superadmin/RestaurantTable'

export default async function AdminRestaurantesPage() {
  const restaurants = await prisma.restaurant.findMany({
    include: { owner: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}
          >
            Restaurantes
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--brand-muted)' }}>
            {restaurants.length} restaurantes registrados
          </p>
        </div>
      </div>

      <RestaurantTable
        restaurants={restaurants.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </div>
  )
}

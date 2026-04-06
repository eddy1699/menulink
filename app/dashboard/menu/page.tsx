import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { PLAN_NAMES, getPlanLimits } from '@/lib/plan-limits'
import { MenuEditorWithPreview } from '@/components/dashboard/MenuEditorWithPreview'

export default async function MenuPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const restaurant = await prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
    include: {
      categories: {
        include: { items: { orderBy: { order: 'asc' } } },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!restaurant) redirect('/dashboard')

  const limits = getPlanLimits(restaurant.plan)
  const totalItems = restaurant.categories.reduce((acc, cat) => acc + cat.items.length, 0)

  const restaurantData = {
    name: restaurant.name,
    description: restaurant.description,
    logoUrl: restaurant.logoUrl,
    primaryColor: restaurant.primaryColor,
    bgColor: restaurant.bgColor,
    district: restaurant.district,
    city: restaurant.city,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}
          >
            Mi Carta
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--brand-muted)' }}>
            {totalItems} platos ·{' '}
            {limits.maxItems === Infinity ? 'Ilimitados' : `máx. ${limits.maxItems}`} con Plan{' '}
            {PLAN_NAMES[restaurant.plan]}
          </p>
        </div>
      </div>

      {totalItems >= limits.maxItems && (
        <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-sm text-orange-700">
          Has alcanzado el límite de platos de tu plan.{' '}
          <a href="/dashboard/plan" className="underline font-semibold">
            Actualiza tu plan →
          </a>
        </div>
      )}

      <MenuEditorWithPreview
        categories={restaurant.categories}
        plan={restaurant.plan}
        restaurant={restaurantData}
      />
    </div>
  )
}

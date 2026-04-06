import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { cache } from 'react'

const getRestaurantInfo = cache(async (userId: string) => {
  return prisma.restaurant.findUnique({
    where: { ownerId: userId },
    select: { name: true, slug: true },
  })
})

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  let restaurantName: string | undefined
  let restaurantSlug: string | undefined

  if (session.user.role === 'RESTAURANT_ADMIN') {
    const restaurant = await getRestaurantInfo(session.user.id)
    restaurantName = restaurant?.name
    restaurantSlug = restaurant?.slug
  }

  return (
    <DashboardShell
      restaurantName={restaurantName}
      restaurantSlug={restaurantSlug}
      userName={session.user.name}
    >
      {children}
    </DashboardShell>
  )
}

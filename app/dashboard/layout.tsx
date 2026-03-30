import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { TopBar } from '@/components/dashboard/TopBar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  let restaurantName: string | undefined
  let restaurantSlug: string | undefined

  if (session.user.role === 'RESTAURANT_ADMIN') {
    const restaurant = await prisma.restaurant.findUnique({
      where: { ownerId: session.user.id },
      select: { name: true, slug: true },
    })
    restaurantName = restaurant?.name
    restaurantSlug = restaurant?.slug
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar restaurantName={restaurantName} />
      <div className="flex-1 flex flex-col">
        <TopBar userName={session.user.name} restaurantSlug={restaurantSlug} />
        <main className="flex-1 p-6" style={{ backgroundColor: 'var(--brand-cream)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

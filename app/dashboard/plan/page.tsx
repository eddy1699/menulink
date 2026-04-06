import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { PlanClient } from './PlanClient'

export default async function PlanPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const restaurant = await prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
    select: {
      id: true,
      plan: true,
      planExpiresAt: true,
      trialEndsAt: true,
      transactions: {
        where: { status: { not: 'PENDING' } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          plan: true,
          amount: true,
          status: true,
          orderId: true,
          createdAt: true,
        },
      },
    },
  })

  if (!restaurant) redirect('/dashboard')

  const now = new Date()
  const isInTrial = restaurant.trialEndsAt && restaurant.trialEndsAt > now
  const trialDaysLeft = isInTrial
    ? Math.ceil((restaurant.trialEndsAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0
  const planExpired = restaurant.planExpiresAt && restaurant.planExpiresAt < now

  return (
    <PlanClient
      restaurantId={restaurant.id}
      currentPlan={restaurant.plan}
      planExpiresAt={restaurant.planExpiresAt?.toISOString() ?? null}
      trialEndsAt={restaurant.trialEndsAt?.toISOString() ?? null}
      isInTrial={!!isInTrial}
      trialDaysLeft={trialDaysLeft}
      planExpired={!!planExpired}
      transactions={restaurant.transactions.map((t) => ({
        ...t,
        amount: t.amount,
        createdAt: t.createdAt.toISOString(),
        plan: t.plan as string,
        status: t.status as string,
      }))}
    />
  )
}

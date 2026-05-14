import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { SupportClient } from './SupportClient'

export default async function SoportePage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      restaurant: {
        include: {
          addOns: {
            where: {
              addOnType: 'PRIORITY_SUPPORT',
              status: 'active',
            },
            take: 1,
          },
          supportTickets: {
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
        },
      },
    },
  })

  if (!user?.restaurant) redirect('/dashboard')

  const activeSub = user.restaurant.addOns[0] ?? null
  const isPriority =
    !!activeSub &&
    (!activeSub.currentPeriodEnd || activeSub.currentPeriodEnd > new Date())

  const tickets = user.restaurant.supportTickets.map((t) => ({
    id: t.id,
    subject: t.subject,
    status: t.status,
    priority: t.priority,
    createdAt: t.createdAt.toISOString(),
    resolvedAt: t.resolvedAt?.toISOString() ?? null,
  }))

  return <SupportClient isPriority={isPriority} tickets={tickets} />
}

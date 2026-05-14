import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const restaurant = await prisma.restaurant.findFirst({
    where: { owner: { email: session.user.email } },
    select: { id: true },
  })
  if (!restaurant) {
    return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 })
  }

  const subscription = await prisma.addOnSubscription.findFirst({
    where: {
      restaurantId: restaurant.id,
      addOnType: 'PRIORITY_SUPPORT',
      status: 'active',
    },
  })
  if (!subscription) {
    return NextResponse.json({ error: 'No tienes este add-on activo' }, { status: 404 })
  }

  await prisma.addOnSubscription.update({
    where: { id: subscription.id },
    data: {
      status: 'cancelled',
      cancelledAt: new Date(),
    },
  })

  return NextResponse.json({ ok: true, periodEnd: subscription.currentPeriodEnd })
}

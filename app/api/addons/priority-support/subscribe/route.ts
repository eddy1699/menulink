import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  createServiceFormToken,
  generateServiceOrderId,
  getPublicKey,
} from '@/lib/izipay'

const PRIORITY_SUPPORT_PRICE_CENTS = 1990 // S/ 19.90/mes

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

  // Check if already active
  const existing = await prisma.addOnSubscription.findFirst({
    where: {
      restaurantId: restaurant.id,
      addOnType: 'PRIORITY_SUPPORT',
      status: 'active',
    },
  })
  if (existing) {
    return NextResponse.json({ error: 'Ya tienes este add-on activo' }, { status: 409 })
  }

  // Reuse or create a pending subscription record
  let subscription = await prisma.addOnSubscription.findFirst({
    where: {
      restaurantId: restaurant.id,
      addOnType: 'PRIORITY_SUPPORT',
      status: 'pending_payment',
    },
  })
  if (!subscription) {
    subscription = await prisma.addOnSubscription.create({
      data: {
        restaurantId: restaurant.id,
        addOnType: 'PRIORITY_SUPPORT',
        monthlyPriceCents: PRIORITY_SUPPORT_PRICE_CENTS,
        status: 'pending_payment',
      },
    })
  }

  // Clear stale pending payments
  await prisma.servicePayment.deleteMany({
    where: {
      serviceType: 'PRIORITY_SUPPORT',
      referenceId: subscription.id,
      status: 'PENDING',
    },
  })

  const orderId = generateServiceOrderId('PSUP')
  await prisma.servicePayment.create({
    data: {
      serviceType: 'PRIORITY_SUPPORT',
      referenceId: subscription.id,
      restaurantId: restaurant.id,
      email: session.user.email,
      amount: PRIORITY_SUPPORT_PRICE_CENTS / 100,
      orderId,
    },
  })

  try {
    const formToken = await createServiceFormToken({
      orderId,
      amountCents: PRIORITY_SUPPORT_PRICE_CENTS,
      email: session.user.email,
      reference: subscription.id,
    })
    return NextResponse.json({
      formToken,
      publicKey: getPublicKey(),
      orderId,
      subscriptionId: subscription.id,
    })
  } catch (e) {
    console.error('[priority-support/subscribe]', e)
    return NextResponse.json({ error: 'Error al conectar con Izipay' }, { status: 502 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { PlanType } from '@prisma/client'
import { createFormToken, generateOrderId, getPublicKey } from '@/lib/izipay'

const schema = z.object({
  plan: z.enum(['STARTER', 'PRO', 'BUSINESS']),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
  }

  const { plan } = parsed.data

  const restaurant = await prisma.restaurant.findFirst({
    where: { owner: { email: session.user.email } },
    select: { id: true },
  })

  if (!restaurant) {
    return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 })
  }

  // Remove previous pending transactions to avoid duplicates in history
  await prisma.paymentTransaction.deleteMany({
    where: { restaurantId: restaurant.id, status: 'PENDING' },
  })

  const orderId = generateOrderId(restaurant.id)

  await prisma.paymentTransaction.create({
    data: {
      restaurantId: restaurant.id,
      plan: plan as PlanType,
      amount: { STARTER: 9.90, PRO: 19.90, BUSINESS: 29.90 }[plan],
      orderId,
    },
  })

  try {
    const formToken = await createFormToken({
      orderId,
      plan: plan as PlanType,
      email: session.user.email,
      restaurantId: restaurant.id,
    })

    return NextResponse.json({
      formToken,
      publicKey: getPublicKey(),
      orderId,
    })
  } catch (e) {
    console.error('[create-token]', e)
    return NextResponse.json({ error: 'Error al conectar con Izipay' }, { status: 502 })
  }
}

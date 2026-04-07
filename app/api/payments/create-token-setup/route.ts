import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { PlanType } from '@prisma/client'
import { generateOrderId, getPublicKey } from '@/lib/izipay'
import { createFormTokenCustom } from '@/lib/izipay'

const schema = z.object({
  plan: z.enum(['STARTER', 'PRO', 'BUSINESS']),
})

const PLAN_AMOUNTS_CENTS: Record<string, number> = {
  STARTER:  990,
  PRO:      1990,
  BUSINESS: 2990,
}
const SETUP_FEE_CENTS: Record<string, number> = {
  STARTER:  1990,  // S/ 19.90
  PRO:      4990,  // S/ 49.90
  BUSINESS: 7990,  // S/ 79.90
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })

  const { plan } = parsed.data

  const restaurant = await prisma.restaurant.findFirst({
    where: { owner: { email: session.user.email } },
    select: { id: true },
  })
  if (!restaurant) return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 })

  await prisma.paymentTransaction.deleteMany({
    where: { restaurantId: restaurant.id, status: 'PENDING' },
  })

  const orderId = generateOrderId(restaurant.id)
  const totalCents = PLAN_AMOUNTS_CENTS[plan] + SETUP_FEE_CENTS[plan]
  const totalSoles = totalCents / 100

  await prisma.paymentTransaction.create({
    data: {
      restaurantId: restaurant.id,
      plan: plan as PlanType,
      amount: totalSoles,
      orderId,
    },
  })

  try {
    const formToken = await createFormTokenCustom({
      orderId,
      amountCents: totalCents,
      email: session.user.email,
      restaurantId: restaurant.id,
    })

    return NextResponse.json({ formToken, publicKey: getPublicKey(), orderId })
  } catch (e) {
    console.error('[create-token-setup]', e)
    return NextResponse.json({ error: 'Error al conectar con Izipay' }, { status: 502 })
  }
}

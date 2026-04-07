import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PlanType } from '@prisma/client'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { clientAnswer } = body

  if (!clientAnswer) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const answer = typeof clientAnswer === 'string'
    ? JSON.parse(clientAnswer)
    : clientAnswer

  // Log full answer so we can see the real structure from Izipay
  console.log('[confirm] full answer:', JSON.stringify(answer, null, 2))

  const orderStatus: string =
    answer.orderStatus ||
    answer.orderDetails?.orderStatus ||
    answer.transactions?.[0]?.status ||
    answer.transactions?.[0]?.detailedStatus ||
    ''

  const orderId: string =
    answer.orderDetails?.orderId ||
    answer.orderId ||
    answer.transactions?.[0]?.orderId ||
    ''

  console.log('[confirm] orderId:', orderId, '| orderStatus:', orderStatus)

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID no encontrado', debug: { keys: Object.keys(answer) } }, { status: 400 })
  }

  const tx = await prisma.paymentTransaction.findUnique({ where: { orderId } })
  if (!tx) {
    return NextResponse.json({ error: 'Transacción no encontrada', orderId }, { status: 404 })
  }

  const isPaid = ['PAID', 'CAPTURED', 'ACCEPTED', 'RUNNING'].includes(orderStatus.toUpperCase())

  if (isPaid) {
    const daysToAdd = (tx.billingMonths ?? 1) * 30
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + daysToAdd)

    await prisma.$transaction([
      prisma.paymentTransaction.update({
        where: { orderId },
        data: { status: 'PAID', izipayTransId: answer.transactions?.[0]?.uuid },
      }),
      prisma.restaurant.update({
        where: { id: tx.restaurantId },
        data: { plan: tx.plan as PlanType, planExpiresAt: expiresAt, trialEndsAt: null },
      }),
    ])

    return NextResponse.json({ ok: true, plan: tx.plan })
  }

  await prisma.paymentTransaction.update({
    where: { orderId },
    data: {
      status: 'FAILED',
      errorCode: answer.transactions?.[0]?.errorCode,
      errorMessage: answer.transactions?.[0]?.errorMessage,
    },
  })

  return NextResponse.json(
    { error: 'Pago no completado', orderStatus, debug: { keys: Object.keys(answer), transactions: answer.transactions } },
    { status: 402 }
  )
}

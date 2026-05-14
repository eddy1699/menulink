import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { clientAnswer } = body

  if (!clientAnswer) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const answer = typeof clientAnswer === 'string' ? JSON.parse(clientAnswer) : clientAnswer

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

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID no encontrado' }, { status: 400 })
  }

  const payment = await prisma.servicePayment.findUnique({ where: { orderId } })
  if (!payment) {
    return NextResponse.json({ error: 'Pago no encontrado', orderId }, { status: 404 })
  }
  if (payment.serviceType !== 'ONBOARDING_ASSISTED') {
    return NextResponse.json({ error: 'Tipo de pago inválido' }, { status: 400 })
  }
  if (!payment.referenceId) {
    return NextResponse.json({ error: 'Referencia no encontrada' }, { status: 400 })
  }

  const isPaid = ['PAID', 'CAPTURED', 'ACCEPTED', 'RUNNING'].includes(orderStatus.toUpperCase())

  if (isPaid) {
    await prisma.$transaction([
      prisma.servicePayment.update({
        where: { orderId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          izipayTransId: answer.transactions?.[0]?.uuid,
        },
      }),
      prisma.onboardingRequest.update({
        where: { id: payment.referenceId },
        data: {
          paymentStatus: 'paid',
          paidOrderId: orderId,
        },
      }),
    ])
    return NextResponse.json({ ok: true })
  }

  await prisma.servicePayment.update({
    where: { orderId },
    data: {
      status: 'FAILED',
      errorCode: answer.transactions?.[0]?.errorCode,
      errorMessage: answer.transactions?.[0]?.errorMessage,
    },
  })

  return NextResponse.json({ error: 'Pago no completado', orderStatus }, { status: 402 })
}

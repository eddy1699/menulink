import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySignature } from '@/lib/izipay'
import { PlanType } from '@prisma/client'

// IPN webhook — called directly by Izipay servers
// Configure URL in Izipay back office: https://yourdomain.com/api/payments/ipn
export async function POST(req: NextRequest) {
  const formData = await req.formData()

  const krAnswer = formData.get('kr-answer') as string
  const krHash = formData.get('kr-hash') as string

  if (!krAnswer || !krHash) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  if (!verifySignature(krAnswer, krHash)) {
    console.error('[IPN] Invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const answer = JSON.parse(Buffer.from(krAnswer, 'base64').toString('utf-8'))
  const orderId = answer.orderDetails?.orderId
  const orderStatus = answer.orderDetails?.orderStatus
  const transId = answer.transactions?.[0]?.uuid

  if (!orderId) {
    return NextResponse.json({ ok: true }) // Not our order
  }

  const tx = await prisma.paymentTransaction.findUnique({ where: { orderId } })
  if (!tx || tx.status === 'PAID') {
    return NextResponse.json({ ok: true }) // Already processed
  }

  if (orderStatus === 'PAID') {
    const nextMonth = new Date()
    nextMonth.setDate(nextMonth.getDate() + 30)

    await prisma.$transaction([
      prisma.paymentTransaction.update({
        where: { orderId },
        data: { status: 'PAID', izipayTransId: transId },
      }),
      prisma.restaurant.update({
        where: { id: tx.restaurantId },
        data: {
          plan: tx.plan as PlanType,
          planExpiresAt: nextMonth,
          trialEndsAt: null,
        },
      }),
    ])
  } else {
    await prisma.paymentTransaction.update({
      where: { orderId },
      data: {
        status: 'FAILED',
        errorCode: answer.transactions?.[0]?.errorCode,
        errorMessage: answer.transactions?.[0]?.errorMessage,
      },
    })
  }

  return NextResponse.json({ ok: true })
}

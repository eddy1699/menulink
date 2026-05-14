import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import {
  createServiceFormToken,
  generateServiceOrderId,
  getPublicKey,
} from '@/lib/izipay'

const ONBOARDING_PRICE_CENTS = 12000 // S/ 120.00

const schema = z.object({
  onboardingRequestId: z.string(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const request = await prisma.onboardingRequest.findUnique({
    where: { id: parsed.data.onboardingRequestId },
  })
  if (!request) {
    return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 })
  }
  if (request.paymentStatus === 'paid') {
    return NextResponse.json({ error: 'Esta solicitud ya está pagada' }, { status: 409 })
  }

  // Clear stale pending payments for this request
  await prisma.servicePayment.deleteMany({
    where: {
      serviceType: 'ONBOARDING_ASSISTED',
      referenceId: request.id,
      status: 'PENDING',
    },
  })

  const orderId = generateServiceOrderId('ONB')
  await prisma.servicePayment.create({
    data: {
      serviceType: 'ONBOARDING_ASSISTED',
      referenceId: request.id,
      email: request.email,
      amount: ONBOARDING_PRICE_CENTS / 100,
      orderId,
    },
  })

  try {
    const formToken = await createServiceFormToken({
      orderId,
      amountCents: ONBOARDING_PRICE_CENTS,
      email: request.email,
      reference: request.id,
    })
    return NextResponse.json({ formToken, publicKey: getPublicKey(), orderId })
  } catch (e) {
    console.error('[onboarding/pay]', e)
    return NextResponse.json({ error: 'Error al conectar con Izipay' }, { status: 502 })
  }
}

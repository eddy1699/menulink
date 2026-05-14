import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import {
  sendSupportTicketToInbox,
  sendSupportTicketConfirmationToCustomer,
} from '@/lib/email'

const schema = z.object({
  subject: z.string().min(3, 'Asunto muy corto').max(200),
  message: z.string().min(10, 'Cuéntanos un poco más').max(5000),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' },
      { status: 400 },
    )
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
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
        },
      },
    },
  })
  if (!user?.restaurant) {
    return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 })
  }

  const activeSub = user.restaurant.addOns[0]
  const stillValid =
    activeSub && (!activeSub.currentPeriodEnd || activeSub.currentPeriodEnd > new Date())
  const priority = Boolean(stillValid)

  const ticket = await prisma.supportTicket.create({
    data: {
      restaurantId: user.restaurant.id,
      email: session.user.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
      priority,
    },
  })

  const emailPayload = {
    ticketId: ticket.id,
    subject: ticket.subject,
    message: ticket.message,
    customerEmail: session.user.email,
    customerName: user.name,
    restaurantName: user.restaurant.name,
    priority,
  }

  // Fire and forget — never block ticket creation on email
  Promise.allSettled([
    sendSupportTicketToInbox(emailPayload),
    sendSupportTicketConfirmationToCustomer(emailPayload),
  ]).catch(() => {})

  return NextResponse.json({ data: ticket, priority })
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const restaurant = await prisma.restaurant.findFirst({
    where: { owner: { email: session.user.email } },
    select: { id: true },
  })
  if (!restaurant) {
    return NextResponse.json({ data: [] })
  }

  const tickets = await prisma.supportTicket.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })
  return NextResponse.json({ data: tickets })
}

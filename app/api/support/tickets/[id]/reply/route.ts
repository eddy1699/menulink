import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendSupportReplyToInbox } from '@/lib/email'

const attachmentSchema = z.object({
  fileUrl: z.string().url(),
  fileName: z.string().min(1).max(200),
  fileSize: z.number().int().nonnegative(),
  mimeType: z.string().min(1).max(120),
})

const schema = z.object({
  body: z.string().min(1, 'El mensaje no puede estar vacío').max(5000),
  attachments: z.array(attachmentSchema).max(5).default([]),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' },
      { status: 400 },
    )
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { restaurant: { select: { id: true, name: true } } },
  })
  if (!user?.restaurant) {
    return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 })
  }

  const ticket = await prisma.supportTicket.findFirst({
    where: { id, restaurantId: user.restaurant.id },
  })
  if (!ticket) {
    return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 })
  }

  const now = new Date()
  const newStatus = ticket.status === 'resolved' ? 'open' : ticket.status

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.supportTicketMessage.create({
      data: {
        ticketId: ticket.id,
        senderType: 'customer',
        senderName: user.name,
        senderEmail: session.user.email!,
        body: parsed.data.body,
        attachments: parsed.data.attachments.length
          ? { create: parsed.data.attachments }
          : undefined,
      },
      include: { attachments: true },
    })
    await tx.supportTicket.update({
      where: { id: ticket.id },
      data: {
        lastMessageAt: now,
        status: newStatus,
        resolvedAt: newStatus === 'resolved' ? ticket.resolvedAt : null,
      },
    })
    return created
  })

  sendSupportReplyToInbox({
    ticketId: ticket.id,
    subject: ticket.subject,
    body: parsed.data.body,
    customerEmail: session.user.email,
    customerName: user.name,
    staffName: 'Cliente',
    restaurantName: user.restaurant.name,
    attachments: parsed.data.attachments,
  }).catch(() => {})

  return NextResponse.json({ data: message })
}

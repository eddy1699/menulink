import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendSupportReplyToCustomer } from '@/lib/email'

const attachmentSchema = z.object({
  fileUrl: z.string().url(),
  fileName: z.string().min(1).max(200),
  fileSize: z.number().int().nonnegative(),
  mimeType: z.string().min(1).max(120),
})

const schema = z.object({
  body: z.string().min(1, 'El mensaje no puede estar vacío').max(5000),
  attachments: z.array(attachmentSchema).max(5).default([]),
  setStatus: z.enum(['open', 'in_progress', 'resolved']).optional(),
})

async function requireSuperadmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPERADMIN') return null
  return session
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSuperadmin()
  if (!session) {
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

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      messages: {
        where: { senderType: 'customer' },
        orderBy: { createdAt: 'asc' },
        take: 1,
        select: { senderName: true },
      },
    },
  })
  if (!ticket) {
    return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 })
  }

  const customerName = ticket.messages[0]?.senderName ?? 'cliente'
  const staffName = session.user?.name ?? 'Equipo Karta'
  const staffEmail = session.user?.email ?? 'soporte@karta.pe'
  const now = new Date()

  // After staff reply, default to "in_progress" if not specified
  const inferredStatus =
    parsed.data.setStatus ?? (ticket.status === 'open' ? 'in_progress' : ticket.status)
  const statusChanged = inferredStatus !== ticket.status

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.supportTicketMessage.create({
      data: {
        ticketId: ticket.id,
        senderType: 'staff',
        senderName: staffName,
        senderEmail: staffEmail,
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
        ...(statusChanged
          ? {
              status: inferredStatus,
              resolvedAt: inferredStatus === 'resolved' ? now : null,
            }
          : {}),
      },
    })
    return created
  })

  sendSupportReplyToCustomer({
    ticketId: ticket.id,
    subject: ticket.subject,
    body: parsed.data.body,
    customerEmail: ticket.email,
    customerName,
    staffName,
    attachments: parsed.data.attachments,
  }).catch(() => {})

  return NextResponse.json({ data: message, status: inferredStatus })
}

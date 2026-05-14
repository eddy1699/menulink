import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendSupportStatusChangeEmail } from '@/lib/email'

async function requireSuperadmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPERADMIN') return null
  return session
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireSuperadmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      restaurant: { select: { name: true, slug: true } },
      messages: {
        include: { attachments: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!ticket) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }
  return NextResponse.json({ data: ticket })
}

const patchSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved']).optional(),
  internalNote: z.string().max(2000).nullable().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireSuperadmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const parsed = patchSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const before = await prisma.supportTicket.findUnique({
    where: { id },
    select: {
      status: true,
      subject: true,
      email: true,
      messages: {
        where: { senderType: 'customer' },
        orderBy: { createdAt: 'asc' },
        take: 1,
        select: { senderName: true },
      },
    },
  })
  if (!before) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }

  const { status, internalNote } = parsed.data
  const ticket = await prisma.supportTicket.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(status === 'resolved' ? { resolvedAt: new Date() } : {}),
      ...(status && status !== 'resolved' ? { resolvedAt: null } : {}),
      ...(internalNote !== undefined ? { internalNote } : {}),
    },
  })

  // Notify on status transition (not on internalNote-only edits)
  if (status && status !== before.status && (status === 'in_progress' || status === 'resolved')) {
    const customerName = before.messages[0]?.senderName ?? 'cliente'
    sendSupportStatusChangeEmail({
      ticketId: id,
      subject: before.subject,
      customerEmail: before.email,
      customerName,
      newStatus: status,
    }).catch(() => {})
  }

  return NextResponse.json({ data: ticket })
}

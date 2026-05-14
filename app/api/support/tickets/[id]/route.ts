import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const ticket = await prisma.supportTicket.findFirst({
    where: {
      id,
      restaurant: { owner: { email: session.user.email } },
    },
    include: {
      messages: {
        include: { attachments: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!ticket) {
    return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 })
  }

  return NextResponse.json({ data: ticket })
}

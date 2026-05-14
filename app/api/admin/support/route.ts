import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireSuperadmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPERADMIN') return null
  return session
}

export async function GET() {
  if (!(await requireSuperadmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const tickets = await prisma.supportTicket.findMany({
    orderBy: [{ priority: 'desc' }, { lastMessageAt: 'desc' }],
    take: 200,
    include: {
      restaurant: { select: { name: true, slug: true } },
      _count: { select: { messages: true } },
    },
  })
  return NextResponse.json({ data: tickets })
}

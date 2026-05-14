import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

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
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    take: 200,
    include: {
      restaurant: { select: { name: true, slug: true } },
    },
  })
  return NextResponse.json({ data: tickets })
}

const patchSchema = z.object({
  id: z.string(),
  status: z.enum(['open', 'in_progress', 'resolved']).optional(),
  internalNote: z.string().max(2000).nullable().optional(),
})

export async function PATCH(req: NextRequest) {
  if (!(await requireSuperadmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const { id, status, internalNote } = parsed.data
  const ticket = await prisma.supportTicket.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(status === 'resolved' ? { resolvedAt: new Date() } : {}),
      ...(internalNote !== undefined ? { internalNote } : {}),
    },
  })
  return NextResponse.json({ data: ticket })
}

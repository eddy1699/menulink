import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { status } = await req.json()

  const validStatuses = ['pending', 'verified', 'active', 'failed']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  const updated = await prisma.customDomain.update({
    where: { id },
    data: {
      status,
      ...(status === 'verified' && { verifiedAt: new Date() }),
    },
    include: { restaurant: { select: { name: true, slug: true } } },
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  await prisma.customDomain.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

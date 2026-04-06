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
  const body = await req.json()
  const { status, assignedTo, notes } = body

  const updated = await prisma.onboardingRequest.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(assignedTo !== undefined && { assignedTo }),
      ...(notes !== undefined && { notes }),
    },
  })

  return NextResponse.json(updated)
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const requests = await prisma.onboardingRequest.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(requests)
}

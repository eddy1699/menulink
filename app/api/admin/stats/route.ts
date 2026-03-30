import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [totalRestaurants, totalUsers, totalVisits, planDistribution] = await Promise.all([
      prisma.restaurant.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.visit.count(),
      prisma.restaurant.groupBy({
        by: ['plan'],
        _count: { plan: true },
      }),
    ])

    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const newThisMonth = await prisma.restaurant.count({
      where: { createdAt: { gte: thisMonth } },
    })

    return NextResponse.json({
      totalRestaurants,
      totalUsers,
      totalVisits,
      newThisMonth,
      planDistribution,
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const VALID_PLACEMENTS = [
  'BETWEEN_CATEGORIES',
  'MENU_FOOTER',
  'DASHBOARD_BANNER',
] as const
type Placement = (typeof VALID_PLACEMENTS)[number]

function isPlacement(value: string | null): value is Placement {
  return value !== null && (VALID_PLACEMENTS as readonly string[]).includes(value)
}

export async function GET(req: NextRequest) {
  try {
    const placement = req.nextUrl.searchParams.get('placement')
    if (!isPlacement(placement)) {
      return NextResponse.json({ error: 'Invalid placement' }, { status: 400 })
    }

    const now = new Date()
    const ads = await prisma.ad.findMany({
      where: {
        placement,
        isActive: true,
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      select: {
        id: true,
        imageUrl: true,
        linkUrl: true,
        altText: true,
        advertiser: true,
      },
    })

    if (ads.length === 0) {
      return NextResponse.json({ data: null })
    }

    const ad = ads[Math.floor(Math.random() * ads.length)]
    return NextResponse.json({ data: ad })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

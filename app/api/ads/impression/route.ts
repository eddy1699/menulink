import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  adId: z.string(),
  restaurantId: z.string(),
  source: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const { adId, restaurantId, source, language } = parsed.data

    await prisma.$transaction([
      prisma.adImpression.create({
        data: {
          adId,
          restaurantId,
          source: source ?? null,
          language: language ?? null,
          kind: 'impression',
        },
      }),
      prisma.ad.update({
        where: { id: adId },
        data: { impressions: { increment: 1 } },
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

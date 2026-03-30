import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const visitSchema = z.object({
  restaurantId: z.string(),
  source: z.string().optional(),
  language: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = visitSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    await prisma.visit.create({
      data: {
        restaurantId: parsed.data.restaurantId,
        source: parsed.data.source,
        language: parsed.data.language,
      },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

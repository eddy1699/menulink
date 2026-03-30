import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { getPlanLimits } from '@/lib/plan-limits'

const itemSchema = z.object({
  name: z.string().min(1),
  nameEn: z.string().optional(),
  namePt: z.string().optional(),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionPt: z.string().optional(),
  price: z.number().positive(),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean().default(true),
  allergens: z.array(z.string()).default([]),
  categoryId: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { ownerId: session.user.id },
      include: {
        categories: { include: { items: true } },
      },
    })

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    const limits = getPlanLimits(restaurant.plan)
    const totalItems = restaurant.categories.reduce((acc, cat) => acc + cat.items.length, 0)

    if (totalItems >= limits.maxItems) {
      return NextResponse.json(
        { error: 'Plan limit reached', upgrade: true },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = itemSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const category = restaurant.categories.find(c => c.id === parsed.data.categoryId)
    const order = category ? category.items.length : 0

    const item = await prisma.menuItem.create({
      data: { ...parsed.data, order },
    })

    return NextResponse.json(item)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id, ...data } = body

    const item = await prisma.menuItem.update({
      where: { id },
      data,
    })

    return NextResponse.json(item)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    await prisma.menuItem.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

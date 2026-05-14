import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const placementEnum = z.enum([
  'BETWEEN_CATEGORIES',
  'MENU_FOOTER',
  'DASHBOARD_BANNER',
])

const createSchema = z.object({
  advertiser: z.string().min(1),
  imageUrl: z.string().url(),
  linkUrl: z.string().url(),
  altText: z.string().min(1),
  placement: placementEnum,
  isActive: z.boolean().optional(),
  startDate: z.string(),
  endDate: z.string().nullable().optional(),
  cpmRate: z.number().nullable().optional(),
  cpcRate: z.number().nullable().optional(),
})

const updateSchema = createSchema.partial().extend({ id: z.string() })

async function requireSuperadmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPERADMIN') {
    return null
  }
  return session
}

export async function GET() {
  const session = await requireSuperadmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ads = await prisma.ad.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ data: ads })
}

export async function POST(req: NextRequest) {
  const session = await requireSuperadmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.flatten() },
        { status: 400 },
      )
    }
    const { startDate, endDate, ...rest } = parsed.data
    const ad = await prisma.ad.create({
      data: {
        ...rest,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
    })
    return NextResponse.json({ data: ad })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await requireSuperadmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.flatten() },
        { status: 400 },
      )
    }
    const { id, startDate, endDate, ...rest } = parsed.data
    const ad = await prisma.ad.update({
      where: { id },
      data: {
        ...rest,
        ...(startDate ? { startDate: new Date(startDate) } : {}),
        ...(endDate !== undefined
          ? { endDate: endDate ? new Date(endDate) : null }
          : {}),
      },
    })
    return NextResponse.json({ data: ad })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await requireSuperadmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }
    await prisma.ad.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

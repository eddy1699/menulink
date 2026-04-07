import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones').min(2).max(60).optional(),
  description: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  bgColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  fontFamily: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  isActive: z.boolean().optional(),
  onboardingStep: z.number().optional(),
  languages: z.array(z.string()).optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        categories: {
          include: { items: { orderBy: { order: 'asc' } } },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!restaurant) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(restaurant)
  } catch (e) {
    console.error('[GET /restaurants/id]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()

    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', issues: parsed.error.issues }, { status: 400 })
    }

    // Verify ownership
    const existing = await prisma.restaurant.findUnique({ where: { id }, select: { ownerId: true } })
    if (!existing || existing.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    // Check slug uniqueness if changing
    if (parsed.data.slug) {
      const slugTaken = await prisma.restaurant.findFirst({
        where: { slug: parsed.data.slug, NOT: { id } },
      })
      if (slugTaken) {
        return NextResponse.json({ error: 'Ese link ya está en uso. Elige otro.' }, { status: 400 })
      }
    }

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: parsed.data,
    })

    return NextResponse.json(restaurant)
  } catch (e) {
    console.error('[PUT /restaurants/id]', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

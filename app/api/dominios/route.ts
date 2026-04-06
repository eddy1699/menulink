import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const domainSchema = z.object({
  domain: z
    .string()
    .min(4)
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}$/, 'Dominio inválido'),
})

// Restaurant admin: solicita un dominio propio
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const restaurant = await prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
    select: { id: true, plan: true, customDomain: true },
  })

  if (!restaurant) return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 })
  if (restaurant.plan !== 'BUSINESS') {
    return NextResponse.json({ error: 'Los dominios personalizados están disponibles en el Plan Business' }, { status: 403 })
  }
  if (restaurant.customDomain) {
    return NextResponse.json({ error: 'Ya tienes un dominio configurado' }, { status: 409 })
  }

  const body = await req.json()
  const parsed = domainSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dominio inválido' }, { status: 400 })
  }

  const existing = await prisma.customDomain.findUnique({ where: { domain: parsed.data.domain } })
  if (existing) return NextResponse.json({ error: 'Este dominio ya está en uso' }, { status: 409 })

  const domain = await prisma.customDomain.create({
    data: { domain: parsed.data.domain, restaurantId: restaurant.id, status: 'pending' },
  })

  return NextResponse.json(domain, { status: 201 })
}

// Restaurant admin: obtiene su dominio
export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const restaurant = await prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
    include: { customDomain: true },
  })

  return NextResponse.json(restaurant?.customDomain ?? null)
}

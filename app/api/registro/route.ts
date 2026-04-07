import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { generateSlug } from '@/lib/slug'
import { sendWelcomeEmail } from '@/lib/email'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  restaurantName: z.string().min(2),
  slug: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const { name, email, password, restaurantName } = parsed.data

    // Check if email exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate unique slug
    let slug = generateSlug(restaurantName)
    let counter = 2
    while (await prisma.restaurant.findUnique({ where: { slug } })) {
      slug = `${generateSlug(restaurantName)}-${counter}`
      counter++
    }

    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)

    // Create user and restaurant in transaction
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        restaurant: {
          create: {
            name: restaurantName,
            slug,
            trialEndsAt,
          },
        },
      },
    })

    // Fire and forget — no bloquea el registro
    void sendWelcomeEmail(name, email, restaurantName)

    return NextResponse.json({ ok: true, userId: user.id })
  } catch (e) {
    console.error('[registro]', e)
    return NextResponse.json({ error: 'Error al crear cuenta' }, { status: 500 })
  }
}

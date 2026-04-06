import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  name: z.string().min(2, 'Nombre muy corto'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(7, 'Teléfono inválido'),
  restaurantName: z.string().min(2, 'Nombre del restaurante muy corto'),
  message: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const result = schema.safeParse(body)

  if (!result.success) {
    const issues = result.error.issues
    return NextResponse.json(
      { error: issues[0]?.message ?? 'Datos inválidos' },
      { status: 400 }
    )
  }

  const request = await prisma.onboardingRequest.create({
    data: result.data,
  })

  return NextResponse.json(request, { status: 201 })
}

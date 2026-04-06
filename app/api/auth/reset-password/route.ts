import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()

  if (!token || !password || password.length < 6) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!resetToken) {
    return NextResponse.json({ error: 'Enlace inválido o expirado' }, { status: 400 })
  }

  if (resetToken.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { token } })
    return NextResponse.json({ error: 'El enlace ha expirado. Solicita uno nuevo.' }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 12)

  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { password: hashed },
  })

  await prisma.passwordResetToken.delete({ where: { token } })

  return NextResponse.json({ ok: true })
}

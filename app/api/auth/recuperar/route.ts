import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  // Siempre responder OK para no revelar si el email existe
  if (!user) {
    return NextResponse.json({ ok: true })
  }

  // Eliminar tokens anteriores del usuario
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  })

  await sendPasswordResetEmail(email, token)

  return NextResponse.json({ ok: true })
}

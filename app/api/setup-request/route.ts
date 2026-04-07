import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const form = await req.formData()

  const restaurantName = form.get('restaurantName') as string
  const contactEmail   = form.get('contactEmail') as string
  const contactPhone   = form.get('contactPhone') as string
  const colors         = form.get('colors') as string
  const fontStyle      = form.get('fontStyle') as string
  const customFont     = form.get('customFont') as string
  const notes          = form.get('notes') as string
  const plan           = form.get('plan') as string

  const menuFiles  = form.getAll('menuPhotos') as File[]
  const logoFiles  = form.getAll('logo') as File[]

  // Build attachments
  const attachments: { filename: string; content: Buffer }[] = []

  for (const file of menuFiles) {
    if (file.size > 0) {
      const buf = Buffer.from(await file.arrayBuffer())
      attachments.push({ filename: `menu_${file.name}`, content: buf })
    }
  }
  for (const file of logoFiles) {
    if (file.size > 0) {
      const buf = Buffer.from(await file.arrayBuffer())
      attachments.push({ filename: `logo_${file.name}`, content: buf })
    }
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  await transporter.sendMail({
    from: `Karta <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    replyTo: contactEmail,
    subject: `Nueva solicitud de configuración — ${restaurantName} (${plan})`,
    html: `
      <h2>Nueva solicitud de configuración de carta</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f7">Restaurante</td><td style="padding:8px">${restaurantName}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f7">Plan</td><td style="padding:8px">${plan}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f7">Email de contacto</td><td style="padding:8px">${contactEmail}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f7">Teléfono</td><td style="padding:8px">${contactPhone || '—'}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f7">Colores</td><td style="padding:8px">${colors || '—'}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f7">Estilo de fuente</td><td style="padding:8px">${fontStyle || '—'}${customFont ? ` — Nombre: "${customFont}"` : ''}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f5f5f7">Notas adicionales</td><td style="padding:8px">${notes || '—'}</td></tr>
      </table>
      <p style="margin-top:16px;color:#666">Archivos adjuntos: ${attachments.length} archivo(s)</p>
    `,
    attachments,
  })

  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { z } from 'zod'

const schema = z.object({
  name:    z.string().min(1).max(100),
  email:   z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  tipo:    z.enum(['incidencia', 'mejora', 'consulta', 'otro']),
})

const TIPO_LABELS: Record<string, string> = {
  incidencia: '🐛 Problema / Incidencia',
  mejora:     '💡 Sugerencia de mejora',
  consulta:   '❓ Consulta general',
  otro:       '💬 Otro',
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const { name, email, subject, message, tipo } = parsed.data

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  await transporter.sendMail({
    from:    `Karta <${process.env.GMAIL_USER}>`,
    to:      process.env.GMAIL_USER,
    replyTo: email,
    subject: `${TIPO_LABELS[tipo]} — ${subject}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
        <div style="background:#1B4FD8;padding:24px;border-radius:12px 12px 0 0">
          <h2 style="color:#fff;margin:0;font-size:18px">${TIPO_LABELS[tipo]}</h2>
        </div>
        <div style="background:#fff;padding:24px;border:1px solid #E4E4E7;border-top:none;border-radius:0 0 12px 12px">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;background:#F5F5F7;font-weight:bold;width:120px">Nombre</td><td style="padding:8px">${name}</td></tr>
            <tr><td style="padding:8px;background:#F5F5F7;font-weight:bold">Email</td><td style="padding:8px">${email}</td></tr>
            <tr><td style="padding:8px;background:#F5F5F7;font-weight:bold">Tipo</td><td style="padding:8px">${TIPO_LABELS[tipo]}</td></tr>
            <tr><td style="padding:8px;background:#F5F5F7;font-weight:bold">Asunto</td><td style="padding:8px">${subject}</td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#F5F5F7;border-radius:8px;white-space:pre-wrap">${message}</div>
        </div>
      </div>
    `,
  })

  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPlanExpiryEmail } from '@/lib/email'
import { PLAN_NAMES } from '@/lib/plan-limits'

// Llamar desde Vercel Cron: diariamente a las 9:00 AM
// vercel.json: { "crons": [{ "path": "/api/cron/plan-expiry", "schedule": "0 9 * * *" }] }
// Protegido por CRON_SECRET en headers

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const in1day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)

  // Restaurantes que vencen en exactamente 7 días (±12h)
  const expiring7 = await prisma.restaurant.findMany({
    where: {
      planExpiresAt: {
        gte: new Date(in7days.getTime() - 12 * 60 * 60 * 1000),
        lte: new Date(in7days.getTime() + 12 * 60 * 60 * 1000),
      },
    },
    include: { owner: { select: { name: true, email: true } } },
  })

  // Restaurantes que vencen en exactamente 1 día (±12h)
  const expiring1 = await prisma.restaurant.findMany({
    where: {
      planExpiresAt: {
        gte: new Date(in1day.getTime() - 12 * 60 * 60 * 1000),
        lte: new Date(in1day.getTime() + 12 * 60 * 60 * 1000),
      },
    },
    include: { owner: { select: { name: true, email: true } } },
  })

  let sent = 0

  for (const r of expiring7) {
    await sendPlanExpiryEmail(
      r.owner.email,
      r.owner.name,
      PLAN_NAMES[r.plan],
      7
    )
    sent++
  }

  for (const r of expiring1) {
    await sendPlanExpiryEmail(
      r.owner.email,
      r.owner.name,
      PLAN_NAMES[r.plan],
      1
    )
    sent++
  }

  return NextResponse.json({ ok: true, sent, expiring7: expiring7.length, expiring1: expiring1.length })
}

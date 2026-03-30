import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { QRDisplay } from '@/components/dashboard/QRDisplay'

export default async function QRPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const restaurant = await prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
    select: { slug: true, primaryColor: true, name: true },
  })

  if (!restaurant) redirect('/dashboard')

  const menuUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${restaurant.slug}`

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
        >
          Tu QR Code
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--brand-muted)' }}>
          Descarga e imprime tu QR para que tus clientes escaneen la carta
        </p>
      </div>

      <div
        className="rounded-2xl border p-8"
        style={{ backgroundColor: 'white', borderColor: 'var(--brand-border)' }}
      >
        <QRDisplay
          url={menuUrl}
          primaryColor={restaurant.primaryColor}
          restaurantName={restaurant.name}
        />
      </div>

      <div
        className="p-4 rounded-xl border text-sm"
        style={{ backgroundColor: 'var(--brand-warm)', borderColor: 'var(--brand-border)', color: 'var(--brand-muted)' }}
      >
        <strong style={{ color: 'var(--brand-dark)' }}>Consejo:</strong> Imprime tu QR en una tarjeta y colócalo en cada mesa. También puedes compartir el link directamente por WhatsApp.
      </div>
    </div>
  )
}

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { AjustesClient } from './AjustesClient'

export default async function AjustesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const restaurant = await prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
    select: {
      id: true,
      slug: true,
      name: true,
      phone: true,
      address: true,
      district: true,
      city: true,
      isActive: true,
    },
  })

  if (!restaurant) redirect('/dashboard')

  return (
    <AjustesClient
      userName={session.user.name ?? ''}
      userEmail={session.user.email ?? ''}
      restaurant={restaurant}
    />
  )
}

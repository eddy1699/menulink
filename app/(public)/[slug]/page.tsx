import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PublicMenuClient } from '@/components/public-menu/PublicMenuClient'
import { cookies } from 'next/headers'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ lang?: string }>
}

async function registerVisit(restaurantId: string, language: string) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId, language }),
      cache: 'no-store',
    })
  } catch {
    // Fire and forget - don't block render
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    select: { name: true, description: true },
  })

  if (!restaurant) {
    return { title: 'Menú no encontrado' }
  }

  return {
    title: `${restaurant.name} — Menú Digital`,
    description: restaurant.description || `Ver la carta digital de ${restaurant.name}`,
  }
}

export default async function MenuPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { lang: langParam } = await searchParams

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      categories: {
        include: {
          items: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!restaurant) {
    notFound()
  }

  if (!restaurant.isActive) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: restaurant.bgColor }}
      >
        <div className="text-center p-8">
          <div className="text-5xl mb-4">🔒</div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: restaurant.primaryColor, fontFamily: 'var(--font-playfair)' }}
          >
            {restaurant.name}
          </h1>
          <p className="text-gray-500">Este restaurante está temporalmente inactivo.</p>
        </div>
      </div>
    )
  }

  // Determine language
  const cookieStore = await cookies()
  const cookieLang = cookieStore.get('locale')?.value
  const validLangs = ['es', 'en', 'pt']
  const lang = validLangs.includes(langParam || '') ? langParam! :
    validLangs.includes(cookieLang || '') ? cookieLang! : 'es'

  // Register visit (fire and forget)
  void registerVisit(restaurant.id, lang)

  const restaurantData = {
    id: restaurant.id,
    name: restaurant.name,
    description: restaurant.description,
    logoUrl: restaurant.logoUrl,
    primaryColor: restaurant.primaryColor,
    bgColor: restaurant.bgColor,
    district: restaurant.district,
    city: restaurant.city,
    languages: restaurant.languages,
    categories: restaurant.categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      nameEn: cat.nameEn,
      namePt: cat.namePt,
      order: cat.order,
      items: cat.items.map((item) => ({
        id: item.id,
        name: item.name,
        nameEn: item.nameEn,
        namePt: item.namePt,
        description: item.description,
        descriptionEn: item.descriptionEn,
        descriptionPt: item.descriptionPt,
        price: item.price,
        imageUrl: item.imageUrl,
        isAvailable: item.isAvailable,
        allergens: item.allergens,
        order: item.order,
      })),
    })),
  }

  return (
    <PublicMenuClient
      restaurant={restaurantData}
      initialLang={lang}
    />
  )
}

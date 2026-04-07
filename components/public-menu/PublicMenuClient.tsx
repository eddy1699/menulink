'use client'

import { useState } from 'react'
import { MenuHeader } from './MenuHeader'
import { CategoryNav } from './CategoryNav'
import { ItemCard } from './ItemCard'
import { LanguageSelector } from './LanguageSelector'
import Link from 'next/link'

const FONT_STACKS: Record<string, string> = {
  inter:        'Inter, sans-serif',
  playfair:     '"Playfair Display", serif',
  lato:         'Lato, sans-serif',
  merriweather: 'Merriweather, serif',
  poppins:      'Poppins, sans-serif',
  raleway:      'Raleway, sans-serif',
  oswald:       'Oswald, sans-serif',
  dancing:      '"Dancing Script", cursive',
}

const FONT_GOOGLE_URLS: Record<string, string> = {
  inter:        'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
  playfair:     'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap',
  lato:         'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap',
  merriweather: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap',
  poppins:      'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap',
  raleway:      'https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700&display=swap',
  oswald:       'https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&display=swap',
  dancing:      'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap',
}

interface MenuItem {
  id: string
  name: string
  nameEn?: string | null
  namePt?: string | null
  description?: string | null
  descriptionEn?: string | null
  descriptionPt?: string | null
  price: number
  imageUrl?: string | null
  isAvailable: boolean
  allergens: string[]
  order: number
}

interface Category {
  id: string
  name: string
  nameEn?: string | null
  namePt?: string | null
  order: number
  items: MenuItem[]
}

interface Restaurant {
  id: string
  name: string
  description?: string | null
  logoUrl?: string | null
  primaryColor: string
  bgColor: string
  fontFamily?: string
  district?: string | null
  city: string
  languages: string[]
  categories: Category[]
}

interface PublicMenuClientProps {
  restaurant: Restaurant
  initialLang: string
  isDemo?: boolean
}

export function PublicMenuClient({
  restaurant,
  initialLang,
  isDemo = false,
}: PublicMenuClientProps) {
  const [lang, setLang] = useState(initialLang)
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)

  const fontKey = restaurant.fontFamily ?? 'inter'
  const fontStack = FONT_STACKS[fontKey] ?? FONT_STACKS.inter
  const fontUrl = FONT_GOOGLE_URLS[fontKey]

  const sortedCategories = [...restaurant.categories].sort((a, b) => a.order - b.order)

  const filteredCategories = activeCategoryId
    ? sortedCategories.filter((c) => c.id === activeCategoryId)
    : sortedCategories

  const getCategoryName = (cat: Category) => {
    if (lang === 'en' && cat.nameEn) return cat.nameEn
    if (lang === 'pt' && cat.namePt) return cat.namePt
    return cat.name
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: restaurant.bgColor, fontFamily: fontStack }}
    >
      {fontUrl && <link rel="stylesheet" href={fontUrl} />}
      {/* Demo banner */}
      {isDemo && (
        <div
          className="text-center text-sm py-2.5 px-4 font-medium"
          style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
        >
          Estás viendo una demo —{' '}
          <Link href="/registro" className="underline font-semibold">
            Crea tu carta digital →
          </Link>
        </div>
      )}

      {/* Header with language selector */}
      <div className="relative">
        <MenuHeader
          name={restaurant.name}
          description={restaurant.description ?? null}
          logoUrl={restaurant.logoUrl ?? null}
          district={restaurant.district ?? null}
          city={restaurant.city}
          primaryColor={restaurant.primaryColor}
          fontFamily={fontStack}
        />
        {restaurant.languages.length > 1 && (
          <div className="absolute bottom-4 right-4">
            <LanguageSelector
              availableLanguages={restaurant.languages}
              currentLang={lang}
              onChange={setLang}
            />
          </div>
        )}
      </div>

      {/* Category nav */}
      <CategoryNav
        categories={sortedCategories}
        activeId={activeCategoryId}
        onSelect={setActiveCategoryId}
        primaryColor={restaurant.primaryColor}
        lang={lang}
        fontFamily={fontStack}
      />

      {/* Menu items */}
      <div className="px-4 py-6 max-w-2xl mx-auto space-y-8">
        {filteredCategories.map((category) => {
          const sortedItems = [...category.items].sort((a, b) => a.order - b.order)
          return (
            <section key={category.id}>
              <h2
                className="text-lg font-bold mb-4"
                style={{ color: restaurant.primaryColor, fontFamily: fontStack }}
              >
                {getCategoryName(category)}
              </h2>
              <div className="space-y-3">
                {sortedItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    lang={lang}
                    primaryColor={restaurant.primaryColor}
                    fontFamily={fontStack}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-xs" style={{ color: restaurant.primaryColor, opacity: 0.5 }}>
        Powered by Karta
      </div>
    </div>
  )
}

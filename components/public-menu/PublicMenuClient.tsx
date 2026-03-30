'use client'

import { useState } from 'react'
import { MenuHeader } from './MenuHeader'
import { CategoryNav } from './CategoryNav'
import { ItemCard } from './ItemCard'
import { LanguageSelector } from './LanguageSelector'
import Link from 'next/link'

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
      style={{ backgroundColor: restaurant.bgColor }}
    >
      {/* Demo banner */}
      {isDemo && (
        <div
          className="text-center text-sm py-2.5 px-4 font-medium"
          style={{ backgroundColor: 'var(--brand-gold)', color: 'var(--brand-dark)' }}
        >
          Estás viendo una demo —{' '}
          <Link href="/registro" className="underline font-semibold">
            Crea tu carta gratis →
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
      />

      {/* Menu items */}
      <div className="px-4 py-6 max-w-2xl mx-auto space-y-8">
        {filteredCategories.map((category) => {
          const sortedItems = [...category.items].sort((a, b) => a.order - b.order)
          return (
            <section key={category.id}>
              <h2
                className="text-lg font-bold mb-4"
                style={{ fontFamily: 'var(--font-playfair)', color: restaurant.primaryColor }}
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
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-xs" style={{ color: restaurant.primaryColor, opacity: 0.5 }}>
        Powered by MenuQR
      </div>
    </div>
  )
}

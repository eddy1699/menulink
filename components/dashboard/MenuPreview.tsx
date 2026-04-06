'use client'

import { formatCurrency } from '@/lib/utils'

interface MenuItem {
  id: string
  name: string
  description?: string | null
  price: number
  imageUrl?: string | null
  isAvailable: boolean
  allergens: string[]
  order: number
}

interface Category {
  id: string
  name: string
  order: number
  items: MenuItem[]
}

interface Restaurant {
  name: string
  description?: string | null
  logoUrl?: string | null
  primaryColor: string
  bgColor: string
  district?: string | null
  city: string
}

interface MenuPreviewProps {
  restaurant: Restaurant
  categories: Category[]
}

const ALLERGEN_LABELS: Record<string, string> = {
  gluten: 'G',
  lacteos: 'L',
  mariscos: 'M',
  huevo: 'H',
  frutos_secos: 'FS',
  soya: 'S',
}

export function MenuPreview({ restaurant, categories }: MenuPreviewProps) {
  const sorted = [...categories].sort((a, b) => a.order - b.order)

  return (
    <div className="flex flex-col items-center select-none">
      <p className="text-xs mb-3 font-medium" style={{ color: 'var(--brand-muted)' }}>
        Vista previa en tiempo real
      </p>

      {/* Phone frame */}
      <div
        className="relative rounded-[2.5rem] border-[6px] shadow-2xl overflow-hidden"
        style={{
          width: 280,
          height: 560,
          borderColor: '#1A1208',
          backgroundColor: restaurant.bgColor,
        }}
      >
        {/* Notch */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 rounded-b-xl z-10"
          style={{ backgroundColor: '#1A1208' }}
        />

        {/* Scrollable content */}
        <div className="h-full overflow-y-auto pt-6" style={{ backgroundColor: restaurant.bgColor }}>
          {/* Header */}
          <div
            className="px-4 pt-6 pb-4 text-center"
            style={{ backgroundColor: restaurant.primaryColor }}
          >
            {restaurant.logoUrl && (
              <img
                src={restaurant.logoUrl}
                alt="Logo"
                className="w-12 h-12 rounded-full object-cover mx-auto mb-2 border-2 border-white/30"
              />
            )}
            <h1
              className="text-white font-bold text-sm leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {restaurant.name || 'Tu restaurante'}
            </h1>
            {restaurant.description && (
              <p className="text-white/70 text-xs mt-1 line-clamp-2">{restaurant.description}</p>
            )}
            {(restaurant.district || restaurant.city) && (
              <p className="text-white/50 text-xs mt-1">
                {[restaurant.district, restaurant.city].filter(Boolean).join(', ')}
              </p>
            )}
          </div>

          {/* Categories & items */}
          <div className="px-3 py-3 space-y-4">
            {sorted.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs" style={{ color: restaurant.primaryColor, opacity: 0.5 }}>
                  Agrega categorías y platos para verlos aquí
                </p>
              </div>
            ) : (
              sorted.map((cat) => (
                <div key={cat.id}>
                  <h2
                    className="text-xs font-bold mb-2"
                    style={{ fontFamily: 'var(--font-display)', color: restaurant.primaryColor }}
                  >
                    {cat.name}
                  </h2>
                  <div className="space-y-1.5">
                    {[...cat.items]
                      .sort((a, b) => a.order - b.order)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-2 rounded-lg p-2"
                          style={{
                            backgroundColor: 'white',
                            opacity: item.isAvailable ? 1 : 0.5,
                          }}
                        >
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-10 h-10 rounded-md object-cover shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <span
                                className="text-xs font-semibold leading-tight"
                                style={{ color: '#1A1208' }}
                              >
                                {item.name}
                              </span>
                              <span
                                className="text-xs font-bold shrink-0"
                                style={{ color: restaurant.primaryColor }}
                              >
                                {formatCurrency(item.price)}
                              </span>
                            </div>
                            {item.description && (
                              <p
                                className="text-xs mt-0.5 line-clamp-1"
                                style={{ color: '#8B7355' }}
                              >
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center gap-1 mt-1">
                              {!item.isAvailable && (
                                <span className="text-xs px-1 rounded bg-red-100 text-red-600">
                                  Agotado
                                </span>
                              )}
                              {item.allergens.map((a) => (
                                <span
                                  key={a}
                                  className="text-xs px-1 rounded"
                                  style={{
                                    backgroundColor: `${restaurant.primaryColor}20`,
                                    color: restaurant.primaryColor,
                                  }}
                                  title={a}
                                >
                                  {ALLERGEN_LABELS[a] || a}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="text-center py-4 text-xs" style={{ color: restaurant.primaryColor, opacity: 0.3 }}>
            Powered by Karta
          </div>
        </div>
      </div>
    </div>
  )
}

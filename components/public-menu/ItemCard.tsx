import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'

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
}

interface ItemCardProps {
  item: MenuItem
  lang: string
  primaryColor: string
}

const allergenLabels: Record<string, Record<string, string>> = {
  es: { gluten: 'Gluten', lacteos: 'Lácteos', mariscos: 'Mariscos', huevo: 'Huevo', frutos_secos: 'Frutos secos', soya: 'Soya' },
  en: { gluten: 'Gluten', lacteos: 'Dairy', mariscos: 'Seafood', huevo: 'Egg', frutos_secos: 'Tree nuts', soya: 'Soy' },
  pt: { gluten: 'Glúten', lacteos: 'Laticínios', mariscos: 'Frutos do mar', huevo: 'Ovo', frutos_secos: 'Nozes', soya: 'Soja' },
}

export function ItemCard({ item, lang, primaryColor }: ItemCardProps) {
  const getName = () => {
    if (lang === 'en' && item.nameEn) return item.nameEn
    if (lang === 'pt' && item.namePt) return item.namePt
    return item.name
  }

  const getDesc = () => {
    if (lang === 'en' && item.descriptionEn) return item.descriptionEn
    if (lang === 'pt' && item.descriptionPt) return item.descriptionPt
    return item.description
  }

  const soldOutLabel = lang === 'en' ? 'Sold out' : lang === 'pt' ? 'Esgotado' : 'Agotado'

  const labels = allergenLabels[lang] || allergenLabels.es

  return (
    <div
      className={`bg-white rounded-2xl border overflow-hidden ${!item.isAvailable ? 'opacity-60' : ''}`}
      style={{ borderColor: '#f0f0f0' }}
    >
      {item.imageUrl && (
        <div className="relative h-40 overflow-hidden">
          <Image
            src={item.imageUrl}
            alt={getName()}
            fill
            className="object-cover"
          />
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white text-sm font-semibold bg-black/60 px-3 py-1 rounded-full">
                {soldOutLabel}
              </span>
            </div>
          )}
        </div>
      )}
      <div className="p-4">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-gray-900">{getName()}</h3>
            {getDesc() && (
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{getDesc()}</p>
            )}
            {item.allergens.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.allergens.map((allergen) => (
                  <span
                    key={allergen}
                    className="text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100"
                  >
                    {labels[allergen] || allergen}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span
              className="font-bold text-base"
              style={{ color: primaryColor }}
            >
              {formatCurrency(item.price)}
            </span>
            {!item.isAvailable && !item.imageUrl && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
              >
                {soldOutLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

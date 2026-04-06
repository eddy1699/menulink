'use client'

import { useState } from 'react'
import { MenuEditor } from './MenuEditor'
import { MenuPreview } from './MenuPreview'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'

interface MenuItem {
  id: string
  name: string
  nameEn?: string | null
  namePt?: string | null
  description?: string | null
  descriptionEn?: string | null
  descriptionPt?: string | null
  price: number
  isAvailable: boolean
  allergens: string[]
  categoryId: string
  imageUrl?: string | null
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
  name: string
  description?: string | null
  logoUrl?: string | null
  primaryColor: string
  bgColor: string
  district?: string | null
  city: string
}

interface Props {
  categories: Category[]
  plan: string
  restaurant: Restaurant
}

export function MenuEditorWithPreview({ categories: initial, plan, restaurant }: Props) {
  const [categories, setCategories] = useState(initial)
  const [showPreview, setShowPreview] = useState(true)

  return (
    <div>
      {/* Preview toggle */}
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setShowPreview((v) => !v)}
          style={{ borderColor: 'var(--brand-border)' }}
        >
          {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
          {showPreview ? 'Ocultar preview' : 'Mostrar preview'}
        </Button>
      </div>

      <div className={`flex gap-8 items-start ${showPreview ? 'flex-col xl:flex-row' : ''}`}>
        {/* Editor */}
        <div className="flex-1 min-w-0">
          <MenuEditor
            categories={categories}
            plan={plan}
            onCategoriesChange={setCategories}
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="shrink-0 xl:sticky xl:top-6">
            <MenuPreview restaurant={restaurant} categories={categories} />
          </div>
        )}
      </div>
    </div>
  )
}

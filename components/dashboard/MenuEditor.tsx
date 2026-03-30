'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ItemModal } from './ItemModal'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, FolderPlus } from 'lucide-react'

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

interface MenuEditorProps {
  categories: Category[]
}

export function MenuEditor({ categories: initialCategories }: MenuEditorProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)

  const handleAddItem = (categoryId: string) => {
    setEditingItem(null)
    setSelectedCategoryId(categoryId)
    setModalOpen(true)
  }

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item)
    setSelectedCategoryId(item.categoryId)
    setModalOpen(true)
  }

  const handleSaveItem = async (data: Record<string, unknown>) => {
    const isEdit = !!data.id

    const res = await fetch('/api/menu/items', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        categoryId: data.categoryId || selectedCategoryId,
      }),
    })

    if (!res.ok) throw new Error('Error saving item')

    const savedItem = await res.json()

    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== (data.categoryId || selectedCategoryId)) return cat

        if (isEdit) {
          return {
            ...cat,
            items: cat.items.map((i) => (i.id === savedItem.id ? savedItem : i)),
          }
        } else {
          return { ...cat, items: [...cat.items, savedItem] }
        }
      })
    )
  }

  const handleDeleteItem = async (itemId: string, categoryId: string) => {
    if (!confirm('¿Eliminar este plato?')) return

    const res = await fetch(`/api/menu/items?id=${itemId}`, { method: 'DELETE' })
    if (!res.ok) return

    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, items: cat.items.filter((i) => i.id !== itemId) }
          : cat
      )
    )
  }

  const handleToggleAvailability = async (item: MenuItem) => {
    const res = await fetch('/api/menu/items', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, isAvailable: !item.isAvailable }),
    })

    if (!res.ok) return
    const updated = await res.json()

    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === item.categoryId
          ? { ...cat, items: cat.items.map((i) => (i.id === item.id ? updated : i)) }
          : cat
      )
    )
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('¿Eliminar esta categoría y todos sus platos?')) return

    const res = await fetch(`/api/menu/categories?id=${categoryId}`, { method: 'DELETE' })
    if (!res.ok) return

    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return

    const res = await fetch('/api/menu/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategoryName.trim() }),
    })

    if (!res.ok) return
    const cat = await res.json()

    setCategories((prev) => [...prev, { ...cat, items: [] }])
    setNewCategoryName('')
    setAddingCategory(false)
  }

  return (
    <div className="space-y-6">
      {/* Add category */}
      <div className="flex items-center gap-3">
        {addingCategory ? (
          <div className="flex gap-2 flex-1">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nombre de la categoría"
              className="flex-1 px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: 'var(--brand-border)' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCategory()
                if (e.key === 'Escape') setAddingCategory(false)
              }}
              autoFocus
            />
            <Button size="sm" onClick={handleAddCategory} style={{ backgroundColor: 'var(--brand-gold)', color: 'var(--brand-dark)' }}>
              Agregar
            </Button>
            <Button size="sm" variant="outline" onClick={() => setAddingCategory(false)}>
              Cancelar
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setAddingCategory(true)}
            style={{ borderColor: 'var(--brand-border)' }}
          >
            <FolderPlus size={16} />
            Nueva categoría
          </Button>
        )}
      </div>

      {/* Categories */}
      {categories.length === 0 ? (
        <div
          className="text-center py-16 rounded-2xl border-2 border-dashed"
          style={{ borderColor: 'var(--brand-border)' }}
        >
          <p className="text-sm mb-4" style={{ color: 'var(--brand-muted)' }}>
            Aún no tienes categorías. ¡Crea tu primera!
          </p>
          <Button
            onClick={() => setAddingCategory(true)}
            style={{ backgroundColor: 'var(--brand-gold)', color: 'var(--brand-dark)' }}
          >
            Crear primera categoría
          </Button>
        </div>
      ) : (
        categories
          .sort((a, b) => a.order - b.order)
          .map((category) => (
            <div
              key={category.id}
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: 'var(--brand-border)', backgroundColor: 'white' }}
            >
              {/* Category header */}
              <div
                className="flex items-center justify-between p-4 border-b"
                style={{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-warm)' }}
              >
                <div>
                  <span
                    className="font-semibold"
                    style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
                  >
                    {category.name}
                  </span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {category.items.length} platos
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1 text-xs"
                    onClick={() => handleAddItem(category.id)}
                  >
                    <Plus size={14} />
                    Agregar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-600"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

              {/* Items */}
              <div className="divide-y" style={{ borderColor: '#f5f5f5' }}>
                {category.items.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm" style={{ color: 'var(--brand-muted)' }}>
                      Sin platos. Haz clic en &ldquo;Agregar&rdquo; para añadir.
                    </p>
                  </div>
                ) : (
                  category.items
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="font-medium text-sm truncate"
                              style={{
                                color: item.isAvailable ? 'var(--brand-dark)' : '#aaa',
                              }}
                            >
                              {item.name}
                            </span>
                            {!item.isAvailable && (
                              <Badge
                                variant="secondary"
                                className="text-xs shrink-0"
                                style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}
                              >
                                Agotado
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs truncate mt-0.5" style={{ color: 'var(--brand-muted)' }}>
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 ml-4 shrink-0">
                          <span className="font-semibold text-sm" style={{ color: 'var(--brand-dark)' }}>
                            {formatCurrency(item.price)}
                          </span>
                          <button
                            onClick={() => handleToggleAvailability(item)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title={item.isAvailable ? 'Marcar agotado' : 'Marcar disponible'}
                          >
                            {item.isAvailable ? (
                              <ToggleRight size={20} className="text-green-500" />
                            ) : (
                              <ToggleLeft size={20} />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditItem(item)}
                            className="text-gray-400 hover:text-blue-500 transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id, category.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          ))
      )}

      <ItemModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingItem(null)
        }}
        onSave={handleSaveItem}
        item={editingItem}
        categoryId={selectedCategoryId}
      />
    </div>
  )
}

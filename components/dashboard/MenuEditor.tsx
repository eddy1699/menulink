'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ItemModal } from './ItemModal'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, FolderPlus, GripVertical } from 'lucide-react'

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

interface MenuEditorProps {
  categories: Category[]
  plan: string
  onCategoriesChange?: (categories: Category[]) => void
}

// ── Sortable item row ──────────────────────────────────────
function SortableItemRow({
  item,
  onEdit,
  onDelete,
  onToggle,
  plan,
}: {
  item: MenuItem
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
  plan: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors bg-white"
    >
      <button
        {...attributes}
        {...listeners}
        className="mr-2 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 touch-none"
        tabIndex={-1}
        aria-label="Arrastrar para reordenar"
      >
        <GripVertical size={16} />
      </button>

      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-10 h-10 rounded-lg object-cover mr-3 shrink-0"
        />
      ) : (
        <div
          className="w-10 h-10 rounded-lg mr-3 shrink-0 flex items-center justify-center text-xs"
          style={{ backgroundColor: 'var(--brand-warm)', color: 'var(--brand-muted)' }}
        >
          {plan !== 'STARTER' ? '📷' : ''}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="font-medium text-sm truncate"
            style={{ color: item.isAvailable ? 'var(--brand-dark)' : '#aaa' }}
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
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title={item.isAvailable ? 'Marcar agotado' : 'Marcar disponible'}
        >
          {item.isAvailable ? (
            <ToggleRight size={20} className="text-green-500" />
          ) : (
            <ToggleLeft size={20} />
          )}
        </button>
        <button onClick={onEdit} className="text-gray-400 hover:text-blue-500 transition-colors">
          <Pencil size={14} />
        </button>
        <button onClick={onDelete} className="text-gray-400 hover:text-red-500 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

// ── Sortable category card ─────────────────────────────────
function SortableCategoryCard({
  category,
  plan,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onToggleItem,
  onDeleteCategory,
  onItemsReorder,
  onSaveItem,
  onImageSaved,
  modalOpen,
  editingItem,
  onModalClose,
}: {
  category: Category
  plan: string
  onAddItem: () => void
  onEditItem: (item: MenuItem) => void
  onDeleteItem: (itemId: string) => void
  onToggleItem: (item: MenuItem) => void
  onDeleteCategory: () => void
  onItemsReorder: (categoryId: string, newItems: MenuItem[]) => void
  onSaveItem: (data: Record<string, unknown>) => Promise<{ id: string }>
  onImageSaved: (itemId: string, url: string) => void
  modalOpen: boolean
  editingItem: MenuItem | null
  onModalClose: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const sortedItems = [...category.items].sort((a, b) => a.order - b.order)

  const handleItemDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sortedItems.findIndex((i) => i.id === active.id)
    const newIndex = sortedItems.findIndex((i) => i.id === over.id)
    const reordered = arrayMove(sortedItems, oldIndex, newIndex).map((item, idx) => ({
      ...item,
      order: idx,
    }))
    onItemsReorder(category.id, reordered)
    fetch('/api/menu/items', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemIds: reordered.map((i) => i.id) }),
    })
  }

  return (
    <div
      ref={setNodeRef}
      style={{ borderColor: 'var(--brand-border)', backgroundColor: 'white', ...style }}
      className="rounded-2xl border overflow-hidden"
    >
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-warm)' }}
      >
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 touch-none"
            tabIndex={-1}
            aria-label="Arrastrar categoría"
          >
            <GripVertical size={16} />
          </button>
          <span
            className="font-semibold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}
          >
            {category.name}
          </span>
          <Badge variant="secondary" className="text-xs">
            {category.items.length} platos
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="gap-1 text-xs" onClick={onAddItem}>
            <Plus size={14} />
            Agregar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-400 hover:text-red-600"
            onClick={onDeleteCategory}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      <div className="divide-y" style={{ borderColor: '#f5f5f5' }}>
        {sortedItems.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm" style={{ color: 'var(--brand-muted)' }}>
              Sin platos. Haz clic en &ldquo;Agregar&rdquo; para añadir.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleItemDragEnd}
          >
            <SortableContext
              items={sortedItems.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {sortedItems.map((item) => (
                <SortableItemRow
                  key={item.id}
                  item={item}
                  plan={plan}
                  onEdit={() => onEditItem(item)}
                  onDelete={() => onDeleteItem(item.id)}
                  onToggle={() => onToggleItem(item)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      <ItemModal
        open={modalOpen}
        onClose={onModalClose}
        onSave={onSaveItem}
        onImageSaved={onImageSaved}
        item={editingItem}
        categoryId={category.id}
        plan={plan}
      />
    </div>
  )
}

// ── Main MenuEditor ────────────────────────────────────────
export function MenuEditor({ categories: initialCategories, plan, onCategoriesChange }: MenuEditorProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [openModalCategoryId, setOpenModalCategoryId] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const updateCategories = (updated: Category[]) => {
    setCategories(updated)
    onCategoriesChange?.(updated)
  }

  const handleCategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const sorted = [...categories].sort((a, b) => a.order - b.order)
    const oldIndex = sorted.findIndex((c) => c.id === active.id)
    const newIndex = sorted.findIndex((c) => c.id === over.id)
    const reordered = arrayMove(sorted, oldIndex, newIndex).map((cat, idx) => ({
      ...cat,
      order: idx,
    }))
    updateCategories(reordered)
    fetch('/api/menu/categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryIds: reordered.map((c) => c.id) }),
    })
  }

  const handleItemsReorder = (categoryId: string, newItems: MenuItem[]) => {
    updateCategories(
      categories.map((cat) => (cat.id === categoryId ? { ...cat, items: newItems } : cat))
    )
  }

  const handleSaveItem = async (data: Record<string, unknown>): Promise<{ id: string }> => {
    const isEdit = !!data.id
    const catId = (data.categoryId || openModalCategoryId) as string

    const res = await fetch('/api/menu/items', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, categoryId: catId }),
    })
    if (!res.ok) throw new Error('Error saving item')
    const savedItem = await res.json()

    updateCategories(
      categories.map((cat) => {
        if (cat.id !== catId) return cat
        if (isEdit) {
          return { ...cat, items: cat.items.map((i) => (i.id === savedItem.id ? savedItem : i)) }
        }
        return { ...cat, items: [...cat.items, savedItem] }
      })
    )
    return savedItem
  }

  const handleImageSaved = (itemId: string, imageUrl: string) => {
    updateCategories(
      categories.map((cat) => ({
        ...cat,
        items: cat.items.map((i) => (i.id === itemId ? { ...i, imageUrl } : i)),
      }))
    )
  }

  const handleDeleteItem = async (itemId: string, categoryId: string) => {
    if (!confirm('¿Eliminar este plato?')) return
    const res = await fetch(`/api/menu/items?id=${itemId}`, { method: 'DELETE' })
    if (!res.ok) return
    updateCategories(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, items: cat.items.filter((i) => i.id !== itemId) } : cat
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
    updateCategories(
      categories.map((cat) =>
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
    updateCategories(categories.filter((cat) => cat.id !== categoryId))
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
    updateCategories([...categories, { ...cat, items: [] }])
    setNewCategoryName('')
    setAddingCategory(false)
  }

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order)

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
            <Button
              size="sm"
              onClick={handleAddCategory}
              style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
            >
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
            style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
          >
            Crear primera categoría
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleCategoryDragEnd}
        >
          <SortableContext
            items={sortedCategories.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {sortedCategories.map((category) => (
                <SortableCategoryCard
                  key={category.id}
                  category={category}
                  plan={plan}
                  onAddItem={() => {
                    setEditingItem(null)
                    setOpenModalCategoryId(category.id)
                  }}
                  onEditItem={(item) => {
                    setEditingItem(item)
                    setOpenModalCategoryId(category.id)
                  }}
                  onDeleteItem={(itemId) => handleDeleteItem(itemId, category.id)}
                  onToggleItem={handleToggleAvailability}
                  onDeleteCategory={() => handleDeleteCategory(category.id)}
                  onItemsReorder={handleItemsReorder}
                  onSaveItem={handleSaveItem}
                  onImageSaved={handleImageSaved}
                  modalOpen={openModalCategoryId === category.id}
                  editingItem={openModalCategoryId === category.id ? editingItem : null}
                  onModalClose={() => {
                    setOpenModalCategoryId(null)
                    setEditingItem(null)
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

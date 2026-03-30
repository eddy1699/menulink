'use client'

import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

const itemSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  nameEn: z.string().optional(),
  namePt: z.string().optional(),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionPt: z.string().optional(),
  price: z.coerce.number().positive('El precio debe ser mayor a 0'),
  isAvailable: z.boolean(),
})

type ItemFormData = z.infer<typeof itemSchema>

interface MenuItem {
  id?: string
  name: string
  nameEn?: string | null
  namePt?: string | null
  description?: string | null
  descriptionEn?: string | null
  descriptionPt?: string | null
  price: number
  isAvailable: boolean
  allergens?: string[]
  categoryId?: string
}

interface ItemModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: Record<string, unknown>) => Promise<void>
  item?: MenuItem | null
  categoryId?: string
}

const ALLERGENS = [
  { id: 'gluten', label: 'Gluten' },
  { id: 'lacteos', label: 'Lácteos' },
  { id: 'mariscos', label: 'Mariscos' },
  { id: 'huevo', label: 'Huevo' },
  { id: 'frutos_secos', label: 'Frutos secos' },
  { id: 'soya', label: 'Soya' },
]

export function ItemModal({ open, onClose, onSave, item, categoryId }: ItemModalProps) {
  const [saving, setSaving] = useState(false)
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(item?.allergens || [])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ItemFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(itemSchema) as any,
    defaultValues: {
      name: item?.name || '',
      nameEn: item?.nameEn || '',
      namePt: item?.namePt || '',
      description: item?.description || '',
      descriptionEn: item?.descriptionEn || '',
      descriptionPt: item?.descriptionPt || '',
      price: item?.price || 0,
      isAvailable: item?.isAvailable ?? true,
    },
  })

  const isAvailable = watch('isAvailable')

  const toggleAllergen = (allergenId: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergenId)
        ? prev.filter((a) => a !== allergenId)
        : [...prev, allergenId]
    )
  }

  const onSubmit: SubmitHandler<ItemFormData> = async (data) => {
    setSaving(true)
    try {
      await onSave({
        ...data,
        id: item?.id,
        categoryId: item?.categoryId || categoryId,
        allergens: selectedAllergens,
      })
      reset()
      onClose()
    } catch {
      // Handle error
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'var(--font-playfair)' }}>
            {item?.id ? 'Editar plato' : 'Nuevo plato'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Nombre (ES) *</Label>
              <Input {...register('name')} placeholder="Ceviche Clásico" className="mt-1" />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <Label className="text-xs">Name (EN)</Label>
              <Input {...register('nameEn')} placeholder="Classic Ceviche" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Nome (PT)</Label>
              <Input {...register('namePt')} placeholder="Ceviche Clássico" className="mt-1" />
            </div>
          </div>

          {/* Price and availability */}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Label className="text-xs">Precio (S/) *</Label>
              <Input
                type="number"
                step="0.10"
                min="0"
                {...register('price')}
                placeholder="28.00"
                className="mt-1"
              />
              {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
            </div>
            <div className="flex items-center gap-2 mt-5">
              <Switch
                checked={isAvailable}
                onCheckedChange={(v) => setValue('isAvailable', v)}
              />
              <Label className="text-xs cursor-pointer">
                {isAvailable ? 'Disponible' : 'Agotado'}
              </Label>
            </div>
          </div>

          {/* Description */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Descripción (ES)</Label>
              <Textarea
                {...register('description')}
                placeholder="Con leche de tigre..."
                rows={2}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Description (EN)</Label>
              <Textarea
                {...register('descriptionEn')}
                placeholder="With tiger milk..."
                rows={2}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Descrição (PT)</Label>
              <Textarea
                {...register('descriptionPt')}
                placeholder="Com leite de tigre..."
                rows={2}
                className="mt-1 text-sm"
              />
            </div>
          </div>

          {/* Allergens */}
          <div>
            <Label className="text-xs">Alérgenos</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {ALLERGENS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleAllergen(a.id)}
                  className="px-3 py-1 rounded-full text-xs font-medium border transition-all"
                  style={
                    selectedAllergens.includes(a.id)
                      ? {
                          backgroundColor: 'var(--brand-gold)',
                          color: 'var(--brand-dark)',
                          borderColor: 'var(--brand-gold)',
                        }
                      : {
                          backgroundColor: 'transparent',
                          color: 'var(--brand-muted)',
                          borderColor: 'var(--brand-border)',
                        }
                  }
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              style={{ backgroundColor: 'var(--brand-gold)', color: 'var(--brand-dark)' }}
            >
              {saving ? 'Guardando...' : 'Guardar plato'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

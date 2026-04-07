'use client'

import { useState, useRef, useEffect } from 'react'
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
import { ImagePlus, X, Lock } from 'lucide-react'

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
  imageUrl?: string | null
}

interface ItemModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: Record<string, unknown>) => Promise<{ id: string }>
  onImageSaved: (itemId: string, url: string) => void
  item?: MenuItem | null
  categoryId?: string
  plan: string
}

const ALLERGENS = [
  { id: 'gluten', label: 'Gluten' },
  { id: 'lacteos', label: 'Lácteos' },
  { id: 'mariscos', label: 'Mariscos' },
  { id: 'huevo', label: 'Huevo' },
  { id: 'frutos_secos', label: 'Frutos secos' },
  { id: 'soya', label: 'Soya' },
]

function ItemPreview({
  name,
  description,
  price,
  isAvailable,
  imagePreview,
}: {
  name: string
  description?: string
  price: number
  isAvailable: boolean
  imagePreview: string | null
}) {
  const hasContent = name || price > 0

  return (
    <div>
      <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--brand-muted)' }}>
        Vista previa del plato
      </p>
      <div
        className="flex gap-3 p-3 rounded-xl border"
        style={{
          backgroundColor: 'white',
          borderColor: 'var(--brand-border)',
          opacity: hasContent ? 1 : 0.4,
        }}
      >
        {imagePreview ? (
          <img src={imagePreview} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
        ) : (
          <div
            className="w-14 h-14 rounded-lg shrink-0 flex items-center justify-center text-lg"
            style={{ backgroundColor: 'var(--brand-warm)' }}
          >
            🍽️
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <span className="font-semibold text-sm" style={{ color: 'var(--brand-dark)' }}>
              {name || 'Nombre del plato'}
            </span>
            <span className="text-sm font-bold shrink-0" style={{ color: '#C0392B' }}>
              {price > 0
                ? new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(price)
                : 'S/ 0.00'}
            </span>
          </div>
          {description && (
            <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--brand-muted)' }}>
              {description}
            </p>
          )}
          {!isAvailable && (
            <span className="inline-block text-xs mt-1 px-1.5 py-0.5 rounded bg-red-100 text-red-600">
              Agotado
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function ItemModal({ open, onClose, onSave, onImageSaved, item, categoryId, plan }: ItemModalProps) {
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(item?.allergens || [])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(item?.imageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canUploadPhoto = plan !== 'STARTER'

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

  // Reset form with item data when modal opens or item changes
  useEffect(() => {
    if (open) {
      reset({
        name: item?.name || '',
        nameEn: item?.nameEn || '',
        namePt: item?.namePt || '',
        description: item?.description || '',
        descriptionEn: item?.descriptionEn || '',
        descriptionPt: item?.descriptionPt || '',
        price: item?.price || 0,
        isAvailable: item?.isAvailable ?? true,
      })
      setSelectedAllergens(item?.allergens || [])
      setImagePreview(item?.imageUrl || null)
      setImageFile(null)
    }
  }, [open, item, reset])

  const toggleAllergen = (allergenId: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergenId)
        ? prev.filter((a) => a !== allergenId)
        : [...prev, allergenId]
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const onSubmit: SubmitHandler<ItemFormData> = async (data) => {
    setSaving(true)
    try {
      const savedItem = await onSave({
        ...data,
        id: item?.id,
        categoryId: item?.categoryId || categoryId,
        allergens: selectedAllergens,
      })

      // Upload image if selected (Pro/Business only)
      if (imageFile && canUploadPhoto && savedItem?.id) {
        setUploadingImage(true)
        const formData = new FormData()
        formData.append('file', imageFile)
        formData.append('type', 'item')
        formData.append('itemId', savedItem.id)

        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        if (res.ok) {
          const { url } = await res.json()
          onImageSaved(savedItem.id, url)
        }
        setUploadingImage(false)
      }

      reset()
      setImageFile(null)
      setImagePreview(null)
      onClose()
    } catch {
      // Error handled by parent
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    reset()
    setImageFile(null)
    setImagePreview(item?.imageUrl || null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'var(--font-display)' }}>
            {item?.id ? 'Editar plato' : 'Nuevo plato'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Image upload */}
          <div>
            <Label className="text-xs flex items-center gap-1">
              Foto del plato
              {!canUploadPhoto && (
                <span className="ml-1 text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-1"
                  style={{ backgroundColor: 'var(--brand-warm)', color: 'var(--brand-muted)' }}>
                  <Lock size={10} /> Plan Pro
                </span>
              )}
            </Label>

            {canUploadPhoto ? (
              <div className="mt-1">
                {imagePreview ? (
                  <div className="relative w-full h-36 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--brand-border)' }}>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 text-sm transition-colors hover:border-[var(--brand-gold)]"
                    style={{ borderColor: 'var(--brand-border)', color: 'var(--brand-muted)' }}
                  >
                    <ImagePlus size={20} />
                    <span>Subir foto</span>
                    <span className="text-xs">JPG, PNG o WebP · máx. 5MB</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div
                className="mt-1 h-16 rounded-lg border-2 border-dashed flex items-center justify-center text-xs gap-2"
                style={{ borderColor: 'var(--brand-border)', color: 'var(--brand-muted)' }}
              >
                <Lock size={14} />
                Disponible en Plan Pro y Business
              </div>
            )}
          </div>

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

          {/* Live item preview */}
          <ItemPreview
            name={watch('name')}
            description={watch('description')}
            price={watch('price')}
            isAvailable={isAvailable}
            imagePreview={imagePreview}
          />

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
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving || uploadingImage}
              style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
            >
              {uploadingImage ? 'Subiendo foto...' : saving ? 'Guardando...' : 'Guardar plato'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

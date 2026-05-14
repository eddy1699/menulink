'use client'

import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Pencil, Plus, Trash2 } from 'lucide-react'

type Placement = 'BETWEEN_CATEGORIES' | 'MENU_FOOTER' | 'DASHBOARD_BANNER'

interface Ad {
  id: string
  advertiser: string
  imageUrl: string
  linkUrl: string
  altText: string
  placement: Placement
  isActive: boolean
  startDate: string
  endDate: string | null
  impressions: number
  clicks: number
  cpmRate: number | null
  cpcRate: number | null
  createdAt: string
}

const PLACEMENT_LABEL: Record<Placement, string> = {
  BETWEEN_CATEGORIES: 'Entre categorías',
  MENU_FOOTER: 'Pie del menú',
  DASHBOARD_BANNER: 'Dashboard del restaurante',
}

function emptyForm() {
  return {
    advertiser: '',
    imageUrl: '',
    linkUrl: '',
    altText: '',
    placement: 'BETWEEN_CATEGORIES' as Placement,
    isActive: true,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    cpmRate: '',
    cpcRate: '',
  }
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function AdminPublicidadPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/ads')
    if (res.ok) {
      const json = await res.json()
      setAds(json.data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm())
    setOpen(true)
  }

  const openEdit = (ad: Ad) => {
    setEditingId(ad.id)
    setForm({
      advertiser: ad.advertiser,
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
      altText: ad.altText,
      placement: ad.placement,
      isActive: ad.isActive,
      startDate: ad.startDate.slice(0, 10),
      endDate: ad.endDate ? ad.endDate.slice(0, 10) : '',
      cpmRate: ad.cpmRate?.toString() ?? '',
      cpcRate: ad.cpcRate?.toString() ?? '',
    })
    setOpen(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        endDate: form.endDate ? form.endDate : null,
        cpmRate: form.cpmRate ? Number(form.cpmRate) : null,
        cpcRate: form.cpcRate ? Number(form.cpcRate) : null,
      }
      const res = editingId
        ? await fetch('/api/admin/ads', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editingId, ...payload }),
          })
        : await fetch('/api/admin/ads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
      if (res.ok) {
        setOpen(false)
        await load()
      }
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar este anuncio?')) return
    const res = await fetch(`/api/admin/ads?id=${id}`, { method: 'DELETE' })
    if (res.ok) await load()
  }

  const toggleActive = async (ad: Ad) => {
    const res = await fetch('/api/admin/ads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: ad.id, isActive: !ad.isActive }),
    })
    if (res.ok) await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}
          >
            Publicidad
          </h1>
          <p className="text-sm" style={{ color: 'var(--brand-muted)' }}>
            Anuncios servidos en los menús públicos.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> Nuevo anuncio
        </Button>
      </div>

      <div
        className="rounded-lg border overflow-hidden"
        style={{ backgroundColor: '#fff', borderColor: 'var(--brand-border)' }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Anunciante</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Vigencia</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Impresiones</TableHead>
              <TableHead className="text-right">Clics</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8" style={{ color: 'var(--brand-muted)' }}>
                  Cargando…
                </TableCell>
              </TableRow>
            ) : ads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8" style={{ color: 'var(--brand-muted)' }}>
                  No hay anuncios todavía.
                </TableCell>
              </TableRow>
            ) : (
              ads.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell className="font-medium">{ad.advertiser}</TableCell>
                  <TableCell>{PLACEMENT_LABEL[ad.placement]}</TableCell>
                  <TableCell className="text-xs" style={{ color: 'var(--brand-muted)' }}>
                    {formatDate(ad.startDate)} → {formatDate(ad.endDate)}
                  </TableCell>
                  <TableCell>
                    <button onClick={() => toggleActive(ad)}>
                      <Badge
                        style={{
                          backgroundColor: ad.isActive ? '#dcfce7' : '#fee2e2',
                          color: ad.isActive ? '#166534' : '#991b1b',
                        }}
                      >
                        {ad.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{ad.impressions.toLocaleString('es-PE')}</TableCell>
                  <TableCell className="text-right tabular-nums">{ad.clicks.toLocaleString('es-PE')}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(ad)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(ad.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar anuncio' : 'Nuevo anuncio'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Anunciante</Label>
              <Input value={form.advertiser} onChange={(e) => setForm({ ...form, advertiser: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>URL de la imagen</Label>
              <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://…" />
            </div>
            <div className="col-span-2">
              <Label>Link destino</Label>
              <Input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="https://…" />
            </div>
            <div className="col-span-2">
              <Label>Texto alternativo</Label>
              <Input value={form.altText} onChange={(e) => setForm({ ...form, altText: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Ubicación</Label>
              <select
                className="w-full h-9 rounded-md border px-2 text-sm"
                style={{ borderColor: 'var(--brand-border)' }}
                value={form.placement}
                onChange={(e) => setForm({ ...form, placement: e.target.value as Placement })}
              >
                <option value="BETWEEN_CATEGORIES">Entre categorías</option>
                <option value="MENU_FOOTER">Pie del menú</option>
                <option value="DASHBOARD_BANNER">Dashboard del restaurante</option>
              </select>
            </div>
            <div>
              <Label>Inicio</Label>
              <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <Label>Fin (opcional)</Label>
              <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
            <div>
              <Label>CPM (S/ por mil)</Label>
              <Input type="number" step="0.01" value={form.cpmRate} onChange={(e) => setForm({ ...form, cpmRate: e.target.value })} />
            </div>
            <div>
              <Label>CPC (S/ por clic)</Label>
              <Input type="number" step="0.01" value={form.cpcRate} onChange={(e) => setForm({ ...form, cpcRate: e.target.value })} />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input
                id="ad-active"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              <Label htmlFor="ad-active">Activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

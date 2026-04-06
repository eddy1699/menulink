'use client'

import { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Pencil } from 'lucide-react'

interface OnboardingRequest {
  id: string
  name: string
  email: string
  phone: string
  restaurantName: string
  message: string | null
  status: string
  assignedTo: string | null
  notes: string | null
  createdAt: string
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pending:     { bg: '#fef3c7', color: '#92400e', label: 'Pendiente' },
  in_progress: { bg: '#dbeafe', color: '#1e40af', label: 'En progreso' },
  completed:   { bg: '#dcfce7', color: '#166534', label: 'Completado' },
  cancelled:   { bg: '#fee2e2', color: '#991b1b', label: 'Cancelado' },
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminOnboardingPage() {
  const [requests, setRequests] = useState<OnboardingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<OnboardingRequest | null>(null)
  const [formStatus, setFormStatus] = useState('')
  const [formAssigned, setFormAssigned] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/onboarding')
    if (res.ok) setRequests(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openEdit = (req: OnboardingRequest) => {
    setEditing(req)
    setFormStatus(req.status)
    setFormAssigned(req.assignedTo || '')
    setFormNotes(req.notes || '')
  }

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    const res = await fetch(`/api/onboarding/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: formStatus, assignedTo: formAssigned, notes: formNotes }),
    })
    if (res.ok) {
      const updated = await res.json()
      setRequests(prev => prev.map(r => r.id === updated.id ? updated : r))
      setEditing(null)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}>
          Solicitudes de Onboarding
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--brand-muted)' }}>
          {requests.length} solicitudes · {requests.filter(r => r.status === 'pending').length} pendientes
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--brand-border)' }} />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center p-12 rounded-2xl border-2 border-dashed" style={{ borderColor: 'var(--brand-border)' }}>
          <p style={{ color: 'var(--brand-muted)' }}>No hay solicitudes aún.</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--brand-border)' }}>
          <Table>
            <TableHeader>
              <TableRow style={{ backgroundColor: 'var(--brand-warm)' }}>
                <TableHead>Solicitante</TableHead>
                <TableHead>Restaurante</TableHead>
                <TableHead>Asignado a</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map(req => {
                const s = STATUS_STYLES[req.status] ?? STATUS_STYLES.pending
                return (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{req.name}</div>
                        <div className="text-xs" style={{ color: 'var(--brand-muted)' }}>{req.email}</div>
                        <div className="text-xs" style={{ color: 'var(--brand-muted)' }}>{req.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{req.restaurantName}</div>
                      {req.message && (
                        <div className="text-xs mt-0.5 max-w-[200px] truncate" style={{ color: 'var(--brand-muted)' }}>
                          {req.message}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {req.assignedTo ? (
                        <span style={{ color: 'var(--brand-dark)' }}>{req.assignedTo}</span>
                      ) : (
                        <span style={{ color: 'var(--brand-muted)' }}>—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge style={{ backgroundColor: s.bg, color: s.color }}>
                        {s.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm" style={{ color: 'var(--brand-muted)' }}>
                      {formatDate(req.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(req)}>
                        <Pencil size={14} />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit modal */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'var(--font-display)' }}>
              Gestionar solicitud
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 py-2">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--brand-warm)' }}>
                <p className="font-medium text-sm">{editing.restaurantName}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--brand-muted)' }}>
                  {editing.name} · {editing.email} · {editing.phone}
                </p>
                {editing.message && (
                  <p className="text-xs mt-2 italic" style={{ color: 'var(--brand-muted)' }}>
                    &ldquo;{editing.message}&rdquo;
                  </p>
                )}
              </div>

              <div>
                <Label className="text-xs">Estado</Label>
                <select
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--brand-border)' }}
                >
                  <option value="pending">Pendiente</option>
                  <option value="in_progress">En progreso</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              <div>
                <Label className="text-xs">Asignado a</Label>
                <Input
                  value={formAssigned}
                  onChange={e => setFormAssigned(e.target.value)}
                  placeholder="Nombre del asesor"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Notas internas</Label>
                <Textarea
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="Acordamos entregar la carta el viernes..."
                  rows={3}
                  className="mt-1 text-sm"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} style={{ borderColor: 'var(--brand-border)' }}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

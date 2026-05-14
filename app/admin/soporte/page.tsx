'use client'

import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Zap, Eye } from 'lucide-react'

interface Ticket {
  id: string
  email: string
  subject: string
  message: string
  priority: boolean
  status: string
  internalNote: string | null
  createdAt: string
  resolvedAt: string | null
  restaurant: { name: string; slug: string }
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  open:        { bg: '#fef3c7', color: '#92400e', label: 'Abierto' },
  in_progress: { bg: '#dbeafe', color: '#1e40af', label: 'En revisión' },
  resolved:    { bg: '#dcfce7', color: '#166534', label: 'Resuelto' },
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-PE', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminSoportePage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Ticket | null>(null)
  const [formStatus, setFormStatus] = useState('open')
  const [formNote, setFormNote] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/support')
    if (res.ok) {
      const json = await res.json()
      setTickets(json.data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openEdit = (ticket: Ticket) => {
    setEditing(ticket)
    setFormStatus(ticket.status)
    setFormNote(ticket.internalNote ?? '')
  }

  const save = async () => {
    if (!editing) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editing.id,
          status: formStatus,
          internalNote: formNote || null,
        }),
      })
      if (res.ok) {
        setEditing(null)
        await load()
      }
    } finally {
      setSaving(false)
    }
  }

  const openCount = tickets.filter((t) => t.status === 'open').length
  const priorityOpenCount = tickets.filter((t) => t.status === 'open' && t.priority).length

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}
        >
          Soporte
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--brand-muted)' }}>
          {openCount} abiertos · {priorityOpenCount} prioritarios
        </p>
      </div>

      <div
        className="rounded-lg border overflow-hidden"
        style={{ backgroundColor: '#fff', borderColor: 'var(--brand-border)' }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Asunto</TableHead>
              <TableHead>Restaurante</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Recibido</TableHead>
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
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8" style={{ color: 'var(--brand-muted)' }}>
                  No hay tickets todavía.
                </TableCell>
              </TableRow>
            ) : (
              tickets.map((t) => {
                const s = STATUS_STYLES[t.status] ?? STATUS_STYLES.open
                return (
                  <TableRow key={t.id}>
                    <TableCell>
                      {t.priority && (
                        <Zap size={16} className="text-amber-500" aria-label="Prioritario" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium max-w-xs truncate">{t.subject}</TableCell>
                    <TableCell className="text-sm">{t.restaurant.name}</TableCell>
                    <TableCell className="text-xs" style={{ color: 'var(--brand-muted)' }}>
                      {t.email}
                    </TableCell>
                    <TableCell>
                      <Badge style={{ backgroundColor: s.bg, color: s.color }} className="text-xs">
                        {s.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs" style={{ color: 'var(--brand-muted)' }}>
                      {formatDateTime(t.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                {editing?.priority && <Zap size={16} className="text-amber-500" />}
                <span>{editing?.subject}</span>
              </div>
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="text-xs" style={{ color: 'var(--brand-muted)' }}>
                <strong>{editing.restaurant.name}</strong> · {editing.email} ·{' '}
                {formatDateTime(editing.createdAt)}
              </div>

              <div
                className="p-3 rounded-lg text-sm whitespace-pre-wrap"
                style={{ backgroundColor: 'var(--brand-warm)', color: 'var(--brand-dark)' }}
              >
                {editing.message}
              </div>

              <div>
                <Label>Estado</Label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="mt-1 w-full h-9 rounded-md border px-2 text-sm"
                  style={{ borderColor: 'var(--brand-border)' }}
                >
                  <option value="open">Abierto</option>
                  <option value="in_progress">En revisión</option>
                  <option value="resolved">Resuelto</option>
                </select>
              </div>

              <div>
                <Label>Nota interna</Label>
                <Textarea
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  rows={3}
                  className="mt-1 text-sm"
                  placeholder="Notas para el equipo (no visibles al cliente)."
                />
              </div>

              <p className="text-xs" style={{ color: 'var(--brand-muted)' }}>
                Para responderle al cliente, responde directamente a su correo (el email del ticket lo trae con Reply-To).
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

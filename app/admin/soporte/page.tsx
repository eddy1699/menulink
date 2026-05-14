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
import { Zap, Eye, Headset, User, Send } from 'lucide-react'
import { AttachmentPicker, AttachmentList, type Attachment } from '@/components/support/AttachmentPicker'

interface TicketRow {
  id: string
  email: string
  subject: string
  priority: boolean
  status: string
  internalNote: string | null
  createdAt: string
  lastMessageAt: string
  restaurant: { name: string; slug: string }
  _count: { messages: number }
}

interface MessageView {
  id: string
  senderType: string
  senderName: string
  body: string
  createdAt: string
  attachments: Attachment[]
}

interface TicketDetail extends Omit<TicketRow, '_count'> {
  messages: MessageView[]
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
  const [tickets, setTickets] = useState<TicketRow[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<string | null>(null)
  const [detail, setDetail] = useState<TicketDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [formStatus, setFormStatus] = useState('open')
  const [formNote, setFormNote] = useState('')
  const [savingMeta, setSavingMeta] = useState(false)
  const [replyBody, setReplyBody] = useState('')
  const [replyAttachments, setReplyAttachments] = useState<Attachment[]>([])
  const [sendingReply, setSendingReply] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/support')
    if (res.ok) {
      const json = await res.json()
      setTickets(json.data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openTicket = async (id: string) => {
    setOpenId(id)
    setDetail(null)
    setReplyBody('')
    setReplyAttachments([])
    setReplyError(null)
    setLoadingDetail(true)
    const res = await fetch(`/api/admin/support/${id}`)
    if (res.ok) {
      const json = await res.json()
      setDetail(json.data)
      setFormStatus(json.data.status)
      setFormNote(json.data.internalNote ?? '')
    }
    setLoadingDetail(false)
  }

  const closeModal = () => {
    setOpenId(null)
    setDetail(null)
  }

  const saveMeta = async () => {
    if (!detail) return
    setSavingMeta(true)
    try {
      const res = await fetch(`/api/admin/support/${detail.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: formStatus, internalNote: formNote || null }),
      })
      if (res.ok) {
        await load()
        const fresh = await fetch(`/api/admin/support/${detail.id}`)
        if (fresh.ok) setDetail((await fresh.json()).data)
      }
    } finally {
      setSavingMeta(false)
    }
  }

  const sendReply = async () => {
    if (!detail || !replyBody.trim()) return
    setSendingReply(true)
    setReplyError(null)
    try {
      const res = await fetch(`/api/admin/support/${detail.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: replyBody, attachments: replyAttachments }),
      })
      const json = await res.json()
      if (!res.ok) {
        setReplyError(json.error || 'No se pudo enviar')
        return
      }
      setDetail((prev) =>
        prev ? { ...prev, status: json.status, messages: [...prev.messages, json.data] } : prev,
      )
      setReplyBody('')
      setReplyAttachments([])
      setFormStatus(json.status)
      await load()
    } catch {
      setReplyError('Error de conexión')
    } finally {
      setSendingReply(false)
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
              <TableHead>Msgs</TableHead>
              <TableHead>Última actividad</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8" style={{ color: 'var(--brand-muted)' }}>
                  Cargando…
                </TableCell>
              </TableRow>
            ) : tickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8" style={{ color: 'var(--brand-muted)' }}>
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
                    <TableCell className="text-xs tabular-nums">{t._count.messages}</TableCell>
                    <TableCell className="text-xs" style={{ color: 'var(--brand-muted)' }}>
                      {formatDateTime(t.lastMessageAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openTicket(t.id)}>
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

      <Dialog open={!!openId} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                {detail?.priority && <Zap size={16} className="text-amber-500" />}
                <span>{detail?.subject ?? 'Cargando…'}</span>
              </div>
            </DialogTitle>
          </DialogHeader>
          {loadingDetail ? (
            <div className="py-8 text-center text-sm" style={{ color: 'var(--brand-muted)' }}>
              Cargando…
            </div>
          ) : detail ? (
            <div className="space-y-5">
              <div className="text-xs" style={{ color: 'var(--brand-muted)' }}>
                <strong>{detail.restaurant.name}</strong> · {detail.email} ·{' '}
                {formatDateTime(detail.createdAt)}
              </div>

              {/* Thread */}
              <div className="space-y-3">
                {detail.messages.map((m) => {
                  const isStaff = m.senderType === 'staff'
                  return (
                    <div
                      key={m.id}
                      className="rounded-lg border p-3"
                      style={{
                        borderColor: isStaff ? '#dbeafe' : 'var(--brand-border)',
                        backgroundColor: isStaff ? '#eff6ff' : 'white',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1.5 text-xs">
                        {isStaff ? (
                          <Headset size={12} className="text-blue-700" />
                        ) : (
                          <User size={12} style={{ color: 'var(--brand-muted)' }} />
                        )}
                        <strong>{m.senderName}</strong>
                        <span style={{ color: 'var(--brand-muted)' }}>
                          · {formatDateTime(m.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                      <AttachmentList attachments={m.attachments} />
                    </div>
                  )
                })}
              </div>

              {/* Reply box */}
              <div className="space-y-2 border-t pt-4" style={{ borderColor: 'var(--brand-border)' }}>
                <Label>Responder al cliente</Label>
                <Textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  rows={4}
                  className="text-sm"
                  placeholder="Tu respuesta le llegará al correo del cliente y aparecerá en su panel."
                />
                <AttachmentPicker
                  value={replyAttachments}
                  onChange={setReplyAttachments}
                  disabled={sendingReply}
                />
                {replyError && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                    {replyError}
                  </p>
                )}
                <div className="flex justify-end">
                  <Button onClick={sendReply} disabled={sendingReply || !replyBody.trim()} size="sm">
                    <Send size={14} className="mr-1.5" />
                    {sendingReply ? 'Enviando…' : 'Enviar respuesta'}
                  </Button>
                </div>
              </div>

              {/* Meta */}
              <div className="space-y-3 border-t pt-4" style={{ borderColor: 'var(--brand-border)' }}>
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
                    rows={2}
                    className="mt-1 text-sm"
                    placeholder="Notas para el equipo (no visibles al cliente)."
                  />
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="ghost" onClick={closeModal}>Cerrar</Button>
            <Button onClick={saveMeta} disabled={savingMeta || !detail}>
              {savingMeta ? 'Guardando…' : 'Guardar estado/nota'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

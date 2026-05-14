'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Send, Zap, User, Headset } from 'lucide-react'
import { AttachmentPicker, AttachmentList, type Attachment } from '@/components/support/AttachmentPicker'

interface MessageView {
  id: string
  senderType: string
  senderName: string
  body: string
  createdAt: string
  attachments: Attachment[]
}

interface TicketView {
  id: string
  subject: string
  status: string
  priority: boolean
  createdAt: string
  resolvedAt: string | null
  messages: MessageView[]
}

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  open:        { label: 'Abierto',     bg: '#fef3c7', color: '#92400e' },
  in_progress: { label: 'En revisión', bg: '#dbeafe', color: '#1e40af' },
  resolved:    { label: 'Resuelto',    bg: '#dcfce7', color: '#166534' },
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('es-PE', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export function TicketDetailClient({ ticket: initial }: { ticket: TicketView }) {
  const router = useRouter()
  const [ticket, setTicket] = useState(initial)
  const [body, setBody] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const s = STATUS_LABEL[ticket.status] ?? STATUS_LABEL.open

  const send = async () => {
    if (!body.trim()) return
    setSending(true)
    setError(null)
    try {
      const res = await fetch(`/api/support/tickets/${ticket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, attachments }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'No se pudo enviar la respuesta')
        return
      }
      setTicket((prev) => ({
        ...prev,
        status: prev.status === 'resolved' ? 'open' : prev.status,
        messages: [...prev.messages, json.data],
      }))
      setBody('')
      setAttachments([])
      router.refresh()
    } catch {
      setError('Error de conexión. Intenta nuevamente.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href="/dashboard/soporte"
          className="inline-flex items-center gap-1 text-sm hover:underline"
          style={{ color: 'var(--brand-muted)' }}
        >
          <ArrowLeft size={14} /> Volver a tickets
        </Link>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {ticket.priority && (
            <Badge style={{ backgroundColor: '#fef3c7', color: '#92400e' }} className="text-xs">
              <Zap size={10} className="mr-1" /> Prioritario
            </Badge>
          )}
          <Badge className="text-xs" style={{ backgroundColor: s.bg, color: s.color }}>
            {s.label}
          </Badge>
          <span className="text-xs" style={{ color: 'var(--brand-muted)' }}>
            Creado: {formatDateTime(ticket.createdAt)}
          </span>
        </div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}
        >
          {ticket.subject}
        </h1>
      </div>

      <div className="space-y-4">
        {ticket.messages.map((m) => {
          const isStaff = m.senderType === 'staff'
          return (
            <div
              key={m.id}
              className="rounded-2xl border p-4"
              style={{
                borderColor: isStaff ? '#dbeafe' : 'var(--brand-border)',
                backgroundColor: isStaff ? '#eff6ff' : 'white',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: isStaff ? '#1B4FD8' : 'var(--brand-warm)' }}
                >
                  {isStaff ? (
                    <Headset size={14} className="text-white" />
                  ) : (
                    <User size={14} style={{ color: 'var(--brand-dark)' }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--brand-dark)' }}>
                    {isStaff ? `${m.senderName} · Karta` : m.senderName}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--brand-muted)' }}>
                    {formatDateTime(m.createdAt)}
                  </p>
                </div>
              </div>
              <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--brand-dark)' }}>
                {m.body}
              </p>
              <AttachmentList attachments={m.attachments} />
            </div>
          )
        })}
      </div>

      {ticket.status !== 'resolved' ? (
        <div
          className="rounded-2xl border p-4 space-y-3"
          style={{ borderColor: 'var(--brand-border)', backgroundColor: 'white' }}
        >
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Escribe tu respuesta…"
            rows={4}
            className="text-sm"
          />
          <AttachmentPicker value={attachments} onChange={setAttachments} disabled={sending} />
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex justify-end">
            <Button
              onClick={send}
              disabled={sending || !body.trim()}
              className="font-semibold"
              style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
            >
              <Send size={14} className="mr-2" />
              {sending ? 'Enviando…' : 'Responder'}
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="rounded-2xl border p-4 text-sm"
          style={{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-warm)' }}
        >
          <p style={{ color: 'var(--brand-dark)' }}>
            Este ticket está marcado como resuelto. Si necesitas seguir,{' '}
            <Link href="/dashboard/soporte" className="underline font-semibold">
              abre uno nuevo
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  )
}

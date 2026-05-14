'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Zap, CheckCircle2, MailCheck, Send, ChevronRight } from 'lucide-react'
import { AttachmentPicker, type Attachment } from '@/components/support/AttachmentPicker'

const schema = z.object({
  subject: z.string().min(3, 'Escribe un asunto corto').max(200),
  message: z.string().min(10, 'Cuéntanos un poco más').max(5000),
})

type FormData = z.infer<typeof schema>

interface TicketSummary {
  id: string
  subject: string
  status: string
  priority: boolean
  createdAt: string
  resolvedAt: string | null
}

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  open:        { label: 'Abierto',     bg: '#fef3c7', color: '#92400e' },
  in_progress: { label: 'En revisión', bg: '#dbeafe', color: '#1e40af' },
  resolved:    { label: 'Resuelto',    bg: '#dcfce7', color: '#166534' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

interface Props {
  isPriority: boolean
  tickets: TicketSummary[]
}

export function SupportClient({ isPriority, tickets: initialTickets }: Props) {
  const router = useRouter()
  const [tickets, setTickets] = useState(initialTickets)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [sending, setSending] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
  })

  const onSubmit = async (data: FormData) => {
    setSending(true)
    setServerError('')
    setSuccess(false)
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, attachments }),
      })
      const json = await res.json()
      if (!res.ok) {
        setServerError(json.error || 'No se pudo enviar. Intenta nuevamente.')
        return
      }
      setTickets((prev) => [
        {
          id: json.data.id,
          subject: json.data.subject,
          status: json.data.status,
          priority: json.data.priority,
          createdAt: json.data.createdAt,
          resolvedAt: null,
        },
        ...prev,
      ])
      reset()
      setAttachments([])
      setSuccess(true)
      router.refresh()
    } catch {
      setServerError('Error de conexión. Intenta nuevamente.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}
        >
          Soporte
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--brand-muted)' }}>
          Envíanos tu consulta. Te respondemos por correo.
        </p>
      </div>

      {isPriority ? (
        <div
          className="flex items-start gap-3 p-4 rounded-2xl border"
          style={{ borderColor: '#16a34a', backgroundColor: '#dcfce7' }}
        >
          <Zap size={18} className="shrink-0 text-green-700 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-800">
              Soporte Prioritario activo
            </p>
            <p className="text-xs text-green-700 mt-0.5">
              Tus consultas entran a la cola prioritaria. Respuesta garantizada en &lt; 4 horas hábiles.
            </p>
          </div>
        </div>
      ) : (
        <div
          className="flex items-start gap-3 p-4 rounded-2xl border"
          style={{ borderColor: 'var(--brand-border)', backgroundColor: 'var(--brand-warm)' }}
        >
          <MailCheck size={18} className="shrink-0 mt-0.5" style={{ color: 'var(--brand-muted)' }} />
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: 'var(--brand-dark)' }}>
              Respuesta en &lt; 48 horas hábiles
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--brand-muted)' }}>
              ¿Necesitas respuesta más rápida?{' '}
              <Link href="/dashboard/plan" className="underline font-semibold">
                Activa Soporte Prioritario por S/ 19.90/mes
              </Link>
              .
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border p-6 space-y-4"
        style={{ borderColor: 'var(--brand-border)', backgroundColor: 'white' }}
      >
        <div>
          <Label>Asunto</Label>
          <Input
            {...register('subject')}
            placeholder="Ejemplo: No puedo subir la foto de un plato"
            className="mt-1"
          />
          {errors.subject && (
            <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>
          )}
        </div>
        <div>
          <Label>Mensaje</Label>
          <Textarea
            {...register('message')}
            placeholder="Cuéntanos qué necesitas. Si es un error, incluye qué estabas haciendo cuando ocurrió."
            rows={6}
            className="mt-1 text-sm"
          />
          {errors.message && (
            <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>
          )}
        </div>

        <AttachmentPicker
          value={attachments}
          onChange={setAttachments}
          disabled={sending}
        />

        {serverError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {serverError}
          </p>
        )}
        {success && (
          <div className="flex items-center gap-2 text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-green-700">
            <CheckCircle2 size={16} />
            <span>Recibimos tu consulta. Revisa tu correo — te llegará confirmación.</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={sending}
          className="font-semibold"
          style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
        >
          <Send size={14} className="mr-2" />
          {sending ? 'Enviando…' : 'Enviar consulta'}
        </Button>
      </form>

      {tickets.length > 0 && (
        <div>
          <h2 className="font-semibold text-base mb-3" style={{ color: 'var(--brand-dark)' }}>
            Mis tickets
          </h2>
          <div
            className="rounded-xl border overflow-hidden"
            style={{ borderColor: 'var(--brand-border)' }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--brand-warm)' }}>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--brand-muted)' }}>
                    Asunto
                  </th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--brand-muted)' }}>
                    Estado
                  </th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--brand-muted)' }}>
                    Fecha
                  </th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {tickets.map((t, i) => {
                  const s = STATUS_LABEL[t.status] ?? STATUS_LABEL.open
                  return (
                    <tr
                      key={t.id}
                      className="border-t cursor-pointer hover:bg-gray-50"
                      style={{
                        borderColor: 'var(--brand-border)',
                        backgroundColor: i % 2 === 0 ? '#fff' : 'var(--brand-cream)',
                      }}
                      onClick={() => router.push(`/dashboard/soporte/${t.id}`)}
                    >
                      <td className="px-4 py-3" style={{ color: 'var(--brand-dark)' }}>
                        <div className="flex items-center gap-2">
                          {t.priority && (
                            <Zap size={12} className="shrink-0 text-amber-500" aria-label="Prioritario" />
                          )}
                          <span>{t.subject}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className="text-xs"
                          style={{ backgroundColor: s.bg, color: s.color }}
                        >
                          {s.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--brand-muted)' }}>
                        {formatDate(t.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right" style={{ color: 'var(--brand-muted)' }}>
                        <ChevronRight size={14} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

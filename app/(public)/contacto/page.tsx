'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2, MessageSquare, Lightbulb, Bug, HelpCircle } from 'lucide-react'
import Link from 'next/link'

const TIPOS = [
  { value: 'incidencia', label: 'Reportar un problema', icon: Bug, color: '#EF4444' },
  { value: 'mejora',     label: 'Sugerencia de mejora', icon: Lightbulb, color: '#F59E0B' },
  { value: 'consulta',   label: 'Consulta general',     icon: HelpCircle, color: '#1B4FD8' },
  { value: 'otro',       label: 'Otro',                 icon: MessageSquare, color: '#6B7280' },
]

export default function ContactoPage() {
  const [tipo, setTipo] = useState('consulta')
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tipo }),
      })
      if (!res.ok) throw new Error()
      setSent(true)
    } catch {
      setError('Hubo un error al enviar. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F5F5F7' }}>
        <div className="text-center max-w-md">
          <CheckCircle2 size={56} className="mx-auto mb-4 text-green-500" />
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#0D0D0D' }}>¡Mensaje enviado!</h1>
          <p className="text-[#6B7280] mb-6">Gracias por escribirnos. Te responderemos en menos de 24 horas.</p>
          <Link href="/">
            <Button style={{ backgroundColor: '#1B4FD8', color: '#fff' }}>
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-20" style={{ backgroundColor: '#F5F5F7' }}>
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-sm text-[#1B4FD8] hover:underline mb-4 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl font-black mb-2" style={{ color: '#0D0D0D' }}>Contáctanos</h1>
          <p className="text-[#6B7280]">¿Tienes un problema, una idea o una consulta? Escríbenos.</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E4E4E7] p-6 sm:p-8 shadow-sm">

          {/* Tipo */}
          <div className="mb-6">
            <Label className="text-sm font-semibold text-[#0D0D0D] mb-3 block">¿Sobre qué nos escribes?</Label>
            <div className="grid grid-cols-2 gap-2">
              {TIPOS.map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTipo(value)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium text-left transition-all"
                  style={{
                    borderColor: tipo === value ? color : '#E4E4E7',
                    backgroundColor: tipo === value ? `${color}12` : '#fff',
                    color: tipo === value ? color : '#6B7280',
                  }}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-[#0D0D0D] mb-1 block">Nombre</Label>
                <Input
                  required
                  placeholder="Tu nombre"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="rounded-xl border-[#E4E4E7]"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-[#0D0D0D] mb-1 block">Email</Label>
                <Input
                  required
                  type="email"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="rounded-xl border-[#E4E4E7]"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-[#0D0D0D] mb-1 block">Asunto</Label>
              <Input
                required
                placeholder="Resume tu mensaje en una línea"
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                className="rounded-xl border-[#E4E4E7]"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-[#0D0D0D] mb-1 block">Mensaje</Label>
              <Textarea
                required
                rows={5}
                placeholder="Cuéntanos con detalle..."
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="rounded-xl border-[#E4E4E7] resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-5 rounded-xl"
              style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
            >
              {loading ? 'Enviando...' : 'Enviar mensaje →'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-[#9CA3AF] mt-6">
          También puedes escribirnos directo a{' '}
          <a href="mailto:kartaperu@gmail.com" className="text-[#1B4FD8] hover:underline">
            kartaperu@gmail.com
          </a>
        </p>
      </div>
    </div>
  )
}

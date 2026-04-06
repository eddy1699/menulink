'use client'

import { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Globe, Trash2, CheckCircle, XCircle } from 'lucide-react'

interface CustomDomain {
  id: string
  domain: string
  status: string
  verifiedAt: string | null
  createdAt: string
  restaurant: { name: string; slug: string }
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pending:  { bg: '#fef3c7', color: '#92400e', label: 'Pendiente' },
  verified: { bg: '#dbeafe', color: '#1e40af', label: 'Verificado' },
  active:   { bg: '#dcfce7', color: '#166534', label: 'Activo' },
  failed:   { bg: '#fee2e2', color: '#991b1b', label: 'Fallido' },
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminDominiosPage() {
  const [domains, setDomains] = useState<CustomDomain[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/dominios')
    if (res.ok) setDomains(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/dominios/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const updated = await res.json()
      setDomains(prev => prev.map(d => d.id === id ? updated : d))
    }
  }

  const deleteDomain = async (id: string) => {
    if (!confirm('¿Eliminar este dominio?')) return
    const res = await fetch(`/api/admin/dominios/${id}`, { method: 'DELETE' })
    if (res.ok) setDomains(prev => prev.filter(d => d.id !== id))
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}>
            Dominios Personalizados
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--brand-muted)' }}>
            {domains.length} dominios registrados · {domains.filter(d => d.status === 'pending').length} pendientes de verificación
          </p>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="p-4 rounded-xl border text-sm space-y-2" style={{ backgroundColor: 'var(--brand-warm)', borderColor: 'var(--brand-border)' }}>
        <p className="font-semibold" style={{ color: 'var(--brand-dark)' }}>Flujo de verificación DNS:</p>
        <ol className="list-decimal ml-4 space-y-1" style={{ color: 'var(--brand-muted)' }}>
          <li>El restaurante solicita su dominio desde Panel → Dominio personalizado</li>
          <li>Aquí aparece como <strong>Pendiente</strong></li>
          <li>Indicar al cliente que añada un CNAME: <code className="bg-white px-1 rounded">carta → menuqr.pe</code></li>
          <li>Verificar propagación y marcar como <strong>Verificado</strong></li>
          <li>Configurar en Vercel y marcar como <strong>Activo</strong></li>
        </ol>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--brand-border)' }} />)}
        </div>
      ) : domains.length === 0 ? (
        <div className="text-center p-12 rounded-2xl border-2 border-dashed" style={{ borderColor: 'var(--brand-border)' }}>
          <Globe size={32} className="mx-auto mb-3" style={{ color: 'var(--brand-muted)' }} />
          <p style={{ color: 'var(--brand-muted)' }}>No hay dominios registrados aún.</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--brand-border)' }}>
          <Table>
            <TableHeader>
              <TableRow style={{ backgroundColor: 'var(--brand-warm)' }}>
                <TableHead>Dominio</TableHead>
                <TableHead>Restaurante</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Verificado</TableHead>
                <TableHead>Solicitud</TableHead>
                <TableHead className="w-28">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.map(d => {
                const s = STATUS_STYLES[d.status] ?? STATUS_STYLES.pending
                return (
                  <TableRow key={d.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Globe size={14} style={{ color: 'var(--brand-muted)' }} />
                        <span className="font-mono text-sm">{d.domain}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{d.restaurant.name}</div>
                      <div className="text-xs" style={{ color: 'var(--brand-muted)' }}>/{d.restaurant.slug}</div>
                    </TableCell>
                    <TableCell>
                      <Badge style={{ backgroundColor: s.bg, color: s.color }}>{s.label}</Badge>
                    </TableCell>
                    <TableCell className="text-sm" style={{ color: 'var(--brand-muted)' }}>
                      {d.verifiedAt ? formatDate(d.verifiedAt) : '—'}
                    </TableCell>
                    <TableCell className="text-sm" style={{ color: 'var(--brand-muted)' }}>
                      {formatDate(d.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {d.status === 'pending' && (
                          <Button size="sm" variant="ghost" title="Marcar verificado" onClick={() => updateStatus(d.id, 'verified')}>
                            <CheckCircle size={14} className="text-blue-500" />
                          </Button>
                        )}
                        {d.status === 'verified' && (
                          <Button size="sm" variant="ghost" title="Marcar activo" onClick={() => updateStatus(d.id, 'active')}>
                            <CheckCircle size={14} className="text-green-500" />
                          </Button>
                        )}
                        {(d.status === 'pending' || d.status === 'verified') && (
                          <Button size="sm" variant="ghost" title="Marcar fallido" onClick={() => updateStatus(d.id, 'failed')}>
                            <XCircle size={14} className="text-red-400" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" title="Eliminar" onClick={() => deleteDomain(d.id)}>
                          <Trash2 size={14} className="text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

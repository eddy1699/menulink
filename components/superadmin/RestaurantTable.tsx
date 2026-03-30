'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'

interface Restaurant {
  id: string
  name: string
  slug: string
  plan: string
  isActive: boolean
  createdAt: string
  city: string
  district: string | null
  owner: {
    name: string
    email: string
  }
}

interface RestaurantTableProps {
  restaurants: Restaurant[]
}

const planColors: Record<string, { bg: string; color: string }> = {
  STARTER: { bg: '#f5f5f5', color: '#555' },
  PRO: { bg: '#dbeafe', color: '#1d4ed8' },
  BUSINESS: { bg: '#dcfce7', color: '#166534' },
}

export function RestaurantTable({ restaurants }: RestaurantTableProps) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--brand-border)' }}>
      <Table>
        <TableHeader>
          <TableRow style={{ backgroundColor: 'var(--brand-warm)' }}>
            <TableHead>Restaurante</TableHead>
            <TableHead>Propietario</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead>Carta</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {restaurants.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                <div>
                  <div className="font-medium text-sm" style={{ color: 'var(--brand-dark)' }}>
                    {r.name}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--brand-muted)' }}>
                    {r.district ? `${r.district}, ` : ''}{r.city}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="text-sm">{r.owner.name}</div>
                  <div className="text-xs" style={{ color: 'var(--brand-muted)' }}>{r.owner.email}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  style={{
                    backgroundColor: planColors[r.plan]?.bg,
                    color: planColors[r.plan]?.color,
                  }}
                >
                  {r.plan}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  style={{
                    backgroundColor: r.isActive ? '#dcfce7' : '#fee2e2',
                    color: r.isActive ? '#166534' : '#dc2626',
                  }}
                >
                  {r.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell className="text-sm" style={{ color: 'var(--brand-muted)' }}>
                {formatDate(new Date(r.createdAt))}
              </TableCell>
              <TableCell>
                <a
                  href={`/${r.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--brand-gold)' }}
                >
                  <ExternalLink size={12} />
                  Ver
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

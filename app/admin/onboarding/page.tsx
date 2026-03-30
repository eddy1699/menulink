import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils'

export default async function AdminOnboardingPage() {
  const requests = await prisma.onboardingRequest.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
        >
          Solicitudes de Onboarding
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--brand-muted)' }}>
          Clientes que solicitaron que carguemos su carta
        </p>
      </div>

      {requests.length === 0 ? (
        <div
          className="text-center p-12 rounded-2xl border-2 border-dashed"
          style={{ borderColor: 'var(--brand-border)' }}
        >
          <p style={{ color: 'var(--brand-muted)' }}>No hay solicitudes aún.</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--brand-border)' }}>
          <Table>
            <TableHeader>
              <TableRow style={{ backgroundColor: 'var(--brand-warm)' }}>
                <TableHead>Solicitante</TableHead>
                <TableHead>Restaurante</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{req.name}</div>
                      <div className="text-xs" style={{ color: 'var(--brand-muted)' }}>{req.email}</div>
                      <div className="text-xs" style={{ color: 'var(--brand-muted)' }}>{req.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{req.restaurantName}</TableCell>
                  <TableCell>
                    <Badge
                      style={{
                        backgroundColor: req.status === 'completed' ? '#dcfce7' : '#fef3c7',
                        color: req.status === 'completed' ? '#166534' : '#92400e',
                      }}
                    >
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm" style={{ color: 'var(--brand-muted)' }}>
                    {formatDate(req.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

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

export default async function AdminUsuariosPage() {
  const users = await prisma.user.findMany({
    include: {
      restaurant: { select: { name: true, slug: true, plan: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
        >
          Usuarios
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--brand-muted)' }}>
          {users.length} usuarios registrados
        </p>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--brand-border)' }}>
        <Table>
          <TableHeader>
            <TableRow style={{ backgroundColor: 'var(--brand-warm)' }}>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Restaurante</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Registrado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-medium text-sm" style={{ color: 'var(--brand-dark)' }}>
                      {user.name}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--brand-muted)' }}>
                      {user.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    style={{
                      backgroundColor: user.role === 'SUPERADMIN' ? '#fef3c7' : '#f3f4f6',
                      color: user.role === 'SUPERADMIN' ? '#92400e' : '#374151',
                    }}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {user.restaurant ? (
                    <a
                      href={`/${user.restaurant.slug}`}
                      target="_blank"
                      className="hover:underline"
                      style={{ color: 'var(--brand-gold)' }}
                    >
                      {user.restaurant.name}
                    </a>
                  ) : (
                    <span style={{ color: 'var(--brand-muted)' }}>—</span>
                  )}
                </TableCell>
                <TableCell>
                  {user.restaurant ? (
                    <Badge style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}>
                      {user.restaurant.plan}
                    </Badge>
                  ) : (
                    <span style={{ color: 'var(--brand-muted)' }}>—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm" style={{ color: 'var(--brand-muted)' }}>
                  {formatDate(user.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

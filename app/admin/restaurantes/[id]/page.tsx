import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ExternalLink, ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminRestaurantDetailPage({ params }: PageProps) {
  const { id } = await params

  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    include: {
      owner: { select: { name: true, email: true, createdAt: true } },
      categories: {
        include: { items: true },
        orderBy: { order: 'asc' },
      },
      visits: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  })

  if (!restaurant) notFound()

  const totalItems = restaurant.categories.reduce((acc, cat) => acc + cat.items.length, 0)

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/restaurantes">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft size={16} />
            Volver
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}
          >
            {restaurant.name}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--brand-muted)' }}>
            /{restaurant.slug}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge style={{ backgroundColor: restaurant.isActive ? '#dcfce7' : '#fee2e2', color: restaurant.isActive ? '#166534' : '#dc2626' }}>
            {restaurant.isActive ? 'Activo' : 'Inactivo'}
          </Badge>
          <a href={`/${restaurant.slug}`} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="gap-2">
              <ExternalLink size={14} />
              Ver carta
            </Button>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card style={{ borderColor: 'var(--brand-border)' }}>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span style={{ color: 'var(--brand-muted)' }}>Plan:</span>
              <Badge style={{ backgroundColor: '#1B4FD8', color: '#fff' }}>{restaurant.plan}</Badge>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--brand-muted)' }}>Ciudad:</span>
              <span>{restaurant.district ? `${restaurant.district}, ` : ''}{restaurant.city}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--brand-muted)' }}>Idiomas:</span>
              <span>{restaurant.languages.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--brand-muted)' }}>Creado:</span>
              <span>{formatDate(restaurant.createdAt)}</span>
            </div>
            {restaurant.planExpiresAt && (
              <div className="flex justify-between">
                <span style={{ color: 'var(--brand-muted)' }}>Plan expira:</span>
                <span>{formatDate(restaurant.planExpiresAt)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card style={{ borderColor: 'var(--brand-border)' }}>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Propietario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span style={{ color: 'var(--brand-muted)' }}>Nombre:</span>
              <span>{restaurant.owner.name}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--brand-muted)' }}>Email:</span>
              <span className="break-all">{restaurant.owner.email}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--brand-muted)' }}>Registrado:</span>
              <span>{formatDate(restaurant.owner.createdAt)}</span>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: 'var(--brand-border)' }}>
          <CardHeader>
            <CardTitle style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Carta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: 'var(--brand-muted)' }}>Categorías:</span>
              <span>{restaurant.categories.length}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--brand-muted)' }}>Platos totales:</span>
              <span>{totalItems}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: 'var(--brand-muted)' }}>Visitas totales:</span>
              <span>{restaurant.visits.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

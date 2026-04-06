import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPERADMIN') {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen">
      {/* Admin sidebar */}
      <aside
        className="w-56 min-h-screen flex flex-col border-r"
        style={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <span
            className="text-lg font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-gold)' }}
          >
            Karta Admin
          </span>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Superadmin
          </p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {[
            { href: '/admin', label: 'Dashboard' },
            { href: '/admin/restaurantes', label: 'Restaurantes' },
            { href: '/admin/usuarios', label: 'Usuarios' },
            { href: '/admin/onboarding', label: 'Onboarding' },
            { href: '/admin/dominios', label: 'Dominios' },
            { href: '/admin/analitica', label: 'Analítica' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <Link href="/" className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            ← Inicio
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header
          className="h-14 border-b px-6 flex items-center justify-between"
          style={{ backgroundColor: 'var(--brand-cream)', borderColor: 'var(--brand-border)' }}
        >
          <span className="text-sm font-medium" style={{ color: 'var(--brand-dark)' }}>
            Panel de Administración
          </span>
          <span className="text-xs" style={{ color: 'var(--brand-muted)' }}>
            {session.user.email}
          </span>
        </header>
        <main className="flex-1 p-6" style={{ backgroundColor: 'var(--brand-cream)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

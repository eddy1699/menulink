import Link from 'next/link'

export function Footer() {
  return (
    <footer
      className="py-12 px-4 border-t"
      style={{
        backgroundColor: 'var(--brand-dark)',
        borderColor: 'rgba(255,255,255,0.1)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div
              className="text-2xl font-bold mb-3"
              style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-gold)' }}
            >
              MenuQR Perú
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              La carta digital para restaurantes peruanos.
              Simple, rápida y hecha para tu negocio.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm" style={{ color: 'white' }}>
              Producto
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'Funciones', href: '#funciones' },
                { label: 'Precios', href: '#precios' },
                { label: 'Demo', href: '/demo' },
                { label: 'Iniciar sesión', href: '/login' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:opacity-70 transition-opacity"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-sm" style={{ color: 'white' }}>
              Legal
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'Privacidad', href: '#' },
                { label: 'Términos', href: '#' },
                { label: 'Contacto', href: 'mailto:hola@menuqr.pe' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:opacity-70 transition-opacity"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="pt-8 border-t text-center text-sm"
          style={{
            borderColor: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          © 2026 MenuQR Perú. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}

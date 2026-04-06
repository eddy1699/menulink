import Link from 'next/link'

export function Footer() {
  return (
    <footer className="py-12 px-4 bg-[#0D0D0D] border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div
              className="text-2xl font-bold mb-3 text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Karta
            </div>
            <p className="text-sm leading-relaxed text-white/50">
              La carta digital para restaurantes peruanos.
              Simple, rápida y hecha para tu negocio.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm text-white uppercase tracking-widest text-[11px]">Producto</h4>
            <ul className="space-y-2">
              {[
                { label: 'Funciones',      href: '#funciones' },
                { label: 'Precios',        href: '#precios' },
                { label: 'Demo',           href: '/demo' },
                { label: 'Iniciar sesión', href: '/login' },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/50 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm text-white uppercase tracking-widest text-[11px]">Legal</h4>
            <ul className="space-y-2">
              {[
                { label: 'Privacidad', href: '#' },
                { label: 'Términos',   href: '#' },
                { label: 'Contacto',   href: 'mailto:hola@karta.pe' },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/50 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center text-sm text-white/30">
          © 2026 Karta Perú. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}

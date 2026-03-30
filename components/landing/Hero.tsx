import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section
      className="pt-32 pb-20 px-4"
      style={{ backgroundColor: 'var(--brand-cream)' }}
    >
      <div className="max-w-5xl mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 mb-6">
          <span
            className="text-xs font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full border"
            style={{
              color: 'var(--brand-muted)',
              borderColor: 'var(--brand-border)',
              backgroundColor: 'var(--brand-warm)',
            }}
          >
            🇵🇪 Para restaurantes en Perú
          </span>
        </div>

        {/* Title */}
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
          style={{
            fontFamily: 'var(--font-playfair)',
            color: 'var(--brand-dark)',
          }}
        >
          Tu carta digital,
          <br />
          <span style={{ color: 'var(--brand-gold)' }}>lista en 10 minutos</span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: 'var(--brand-muted)' }}
        >
          Digitaliza tu menú, compártelo con un QR y actualiza precios al instante.
          Sin apps, sin complicaciones.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/registro">
            <Button
              size="lg"
              className="text-base font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              style={{
                backgroundColor: 'var(--brand-gold)',
                color: 'var(--brand-dark)',
              }}
            >
              Empieza gratis →
            </Button>
          </Link>
          <Link href="/demo">
            <Button
              variant="outline"
              size="lg"
              className="text-base px-8 py-6 rounded-xl"
              style={{
                borderColor: 'var(--brand-border)',
                color: 'var(--brand-dark)',
              }}
            >
              Ver demo
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 p-6 rounded-2xl border"
          style={{
            backgroundColor: 'var(--brand-warm)',
            borderColor: 'var(--brand-border)',
          }}
        >
          {[
            { value: '+500 restaurantes', label: 'confían en MenuQR' },
            { value: '10 min', label: 'para publicar tu carta' },
            { value: 'Desde S/ 39.90', label: 'por mes' },
          ].map((stat) => (
            <div key={stat.value} className="text-center">
              <div
                className="text-2xl font-bold"
                style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
              >
                {stat.value}
              </div>
              <div className="text-sm" style={{ color: 'var(--brand-muted)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Menu preview mockup */}
        <div className="mt-16 relative">
          <div
            className="mx-auto max-w-sm rounded-3xl shadow-2xl overflow-hidden border"
            style={{ borderColor: 'var(--brand-border)', backgroundColor: '#EAF4FB' }}
          >
            {/* Phone header */}
            <div
              className="p-6 text-white"
              style={{ backgroundColor: '#1B4F72' }}
            >
              <div className="text-lg font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
                La Cevichería Limeña
              </div>
              <div className="text-sm opacity-80">Miraflores, Lima</div>
            </div>
            {/* Menu items */}
            <div className="p-4 space-y-3">
              {[
                { name: 'Ceviche Clásico', price: 'S/ 28.00', desc: 'Con leche de tigre, choclo y cancha' },
                { name: 'Tiradito de Lenguado', price: 'S/ 32.00', desc: 'Salsa amarilla, canchita tostada' },
                { name: 'Arroz con Mariscos', price: 'S/ 42.00', desc: 'Con choros, camarones y conchas' },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex justify-between items-start p-3 rounded-xl bg-white shadow-sm"
                >
                  <div>
                    <div className="font-semibold text-sm" style={{ color: '#1B4F72' }}>
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </div>
                  <div className="font-bold text-sm ml-2" style={{ color: '#1B4F72' }}>
                    {item.price}
                  </div>
                </div>
              ))}
            </div>
            <div
              className="text-center text-xs py-3 opacity-60"
              style={{ color: '#1B4F72' }}
            >
              Powered by MenuQR
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

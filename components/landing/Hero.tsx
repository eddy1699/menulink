import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 bg-[#0D0D0D]">
      <div className="max-w-5xl mx-auto text-center">

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 mb-6">
          <span className="text-xs font-bold tracking-[2px] uppercase px-3 py-1.5 rounded-full bg-[#1B4FD8]/20 text-[#3D6FFF] border border-[#1B4FD8]/30">
            🇵🇪 Para restaurantes en Perú
          </span>
        </div>

        {/* Title */}
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6 text-white"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Tu carta digital,{' '}
          <br />
          <span style={{ color: '#3D6FFF' }}>lista en 10 minutos</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed text-[#6B7280]">
          Digitaliza tu menú, compártelo con un QR y actualiza precios al instante.
          Sin apps, sin complicaciones.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/registro">
            <Button
              size="lg"
              className="text-base font-semibold px-8 py-6 rounded-[10px] shadow-lg transition-all duration-200 bg-[#1B4FD8] hover:bg-[#3D6FFF] text-white"
            >
              Empieza gratis →
            </Button>
          </Link>
          <Link href="/demo">
            <Button
              variant="outline"
              size="lg"
              className="text-base px-8 py-6 rounded-[10px] border-[1.5px] border-[#E4E4E7] text-white hover:border-[#1B4FD8] hover:text-[#3D6FFF] bg-transparent transition-all duration-200"
            >
              Ver demo
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 p-6 rounded-2xl border border-white/10 bg-white/5">
          {[
            { value: '+500 restaurantes', label: 'confían en Karta' },
            { value: '10 min',            label: 'para publicar tu carta' },
            { value: 'Desde S/ 9.90',     label: 'por mes' },
          ].map((stat) => (
            <div key={stat.value} className="text-center">
              <div
                className="text-2xl font-bold text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {stat.value}
              </div>
              <div className="text-sm text-[#6B7280]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Phone mockup */}
        <div className="mt-16">
          <div className="mx-auto max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-white/10">
            <div className="p-6 text-white" style={{ backgroundColor: '#1B4FD8' }}>
              <div className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                La Cevichería Limeña
              </div>
              <div className="text-sm opacity-70">Miraflores, Lima</div>
            </div>
            <div className="p-4 space-y-3 bg-[#F5F5F7]">
              {[
                { name: 'Ceviche Clásico',      price: 'S/ 28.00', desc: 'Con leche de tigre, choclo y cancha' },
                { name: 'Tiradito de Lenguado', price: 'S/ 32.00', desc: 'Salsa amarilla, canchita tostada' },
                { name: 'Arroz con Mariscos',   price: 'S/ 42.00', desc: 'Con choros, camarones y conchas' },
              ].map((item) => (
                <div key={item.name} className="flex justify-between items-start p-3 rounded-xl bg-white shadow-sm border border-[#E4E4E7]">
                  <div>
                    <div className="font-semibold text-sm text-[#1B4FD8]">{item.name}</div>
                    <div className="text-xs text-[#6B7280]">{item.desc}</div>
                  </div>
                  <div className="font-bold text-sm ml-2 text-[#1B4FD8]">{item.price}</div>
                </div>
              ))}
            </div>
            <div className="text-center text-xs py-3 text-[#6B7280] bg-[#F5F5F7]">
              Powered by Karta
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

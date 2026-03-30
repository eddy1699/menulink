import { Palette, QrCode, Globe, AlertCircle, Camera, BarChart2 } from 'lucide-react'

const features = [
  {
    icon: Palette,
    title: 'Carta con tu marca',
    desc: 'Personaliza colores, logo y descripción para reflejar tu identidad',
  },
  {
    icon: QrCode,
    title: 'Link + QR instantáneo',
    desc: 'Comparte tu carta con un link único o imprime tu QR en segundos',
  },
  {
    icon: Globe,
    title: 'Multiidioma ES/EN/PT',
    desc: 'Atiende a turistas y clientes extranjeros en su idioma',
  },
  {
    icon: AlertCircle,
    title: 'Agotado en tiempo real',
    desc: 'Marca platos como agotados al instante desde tu celular',
  },
  {
    icon: Camera,
    title: 'Fotos de tus platos',
    desc: 'Muestra imágenes apetitosas de tu carta (Plan Pro+)',
  },
  {
    icon: BarChart2,
    title: 'Analítica de visitas',
    desc: 'Conoce cuántos clientes visitan tu carta y desde dónde (Plan Pro+)',
  },
]

export function Features() {
  return (
    <section id="funciones" className="py-20 px-4" style={{ backgroundColor: 'var(--brand-warm)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
          >
            Todo lo que necesita tu restaurante
          </h2>
          <p className="text-lg" style={{ color: 'var(--brand-muted)' }}>
            Simple, potente y hecho para el mercado peruano
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl border hover:shadow-md transition-shadow"
              style={{
                backgroundColor: 'var(--brand-cream)',
                borderColor: 'var(--brand-border)',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: 'var(--brand-gold)', opacity: 0.9 }}
              >
                <f.icon size={24} style={{ color: 'var(--brand-dark)' }} />
              </div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
              >
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--brand-muted)' }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

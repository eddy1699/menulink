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
    <section id="funciones" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4 text-[#0D0D0D]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Todo lo que necesita tu restaurante
          </h2>
          <p className="text-lg text-[#6B7280]">
            Simple, potente y hecho para el mercado peruano
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl border border-[#E4E4E7] bg-white hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-[#EEF2FF]">
                <f.icon size={22} style={{ color: '#1B4FD8' }} />
              </div>
              <h3 className="text-lg font-bold mb-2 text-[#0D0D0D]">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#6B7280]">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

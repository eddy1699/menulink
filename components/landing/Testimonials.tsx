const testimonials = [
  {
    name: 'María Quispe',
    restaurant: 'Cevichería El Puerto',
    location: 'Miraflores, Lima',
    text: 'Antes imprimíamos cartas cada semana. Ahora actualizo el menú en segundos desde mi celular. Mis clientes extranjeros aman que esté en inglés.',
    rating: 5,
  },
  {
    name: 'Carlos Mendoza',
    restaurant: 'Pollería Don Pollo',
    location: 'San Isidro, Lima',
    text: 'El QR lo pusimos en las mesas y ya no tenemos cartas sucias. Los precios los actualizo yo mismo, sin depender de nadie. Increíble.',
    rating: 5,
  },
  {
    name: 'Rosa Huanca',
    restaurant: 'Anticuchería La Brasa',
    location: 'Surco, Lima',
    text: 'Simple, bonito y barato. En 20 minutos tuve mi carta lista. El soporte me ayudó con todo. Totalmente recomendado.',
    rating: 5,
  },
  {
    name: 'Jorge Vargas',
    restaurant: 'Chifa Dragón de Oro',
    location: 'Jesús María, Lima',
    text: 'Muchos de nuestros clientes son turistas y la función de idiomas nos ha ayudado muchísimo. El analítico nos muestra cuándo hay más visitas.',
    rating: 5,
  },
  {
    name: 'Ana Flores',
    restaurant: 'Pizzería Napolitana',
    location: 'Barranco, Lima',
    text: 'Migré del plan Starter al Pro y fue un salto enorme. Las fotos hacen que los platos se vean deliciosos y aumentaron mis pedidos.',
    rating: 5,
  },
  {
    name: 'Luis Torres',
    restaurant: 'Restaurante El Señorío',
    location: 'Miraflores, Lima',
    text: 'Tenemos 3 locales y el plan Business nos permite manejar todo desde un solo dashboard. La mejor inversión del año para el negocio.',
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section id="testimonios" className="py-20 px-4" style={{ backgroundColor: 'var(--brand-cream)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
          >
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-lg" style={{ color: 'var(--brand-muted)' }}>
            Restaurantes peruanos que ya digitalizaron su carta
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="p-6 rounded-2xl border hover:shadow-md transition-shadow"
              style={{
                backgroundColor: 'var(--brand-warm)',
                borderColor: 'var(--brand-border)',
              }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--brand-dark)' }}>
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: 'var(--brand-gold)', color: 'var(--brand-dark)' }}
                >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--brand-dark)' }}>
                    {t.name}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--brand-muted)' }}>
                    {t.restaurant} · {t.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

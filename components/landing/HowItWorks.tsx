import Link from 'next/link'

const steps = [
  {
    number: '01',
    title: 'Crea tu cuenta',
    desc: 'Regístrate gratis en menos de 2 minutos',
  },
  {
    number: '02',
    title: 'Personaliza tu marca',
    desc: 'Sube tu logo y elige tus colores',
  },
  {
    number: '03',
    title: 'Carga tu carta',
    desc: 'Agrega categorías y platos con sus precios en S/',
  },
  {
    number: '04',
    title: 'Comparte tu QR',
    desc: 'Descarga tu QR e imprímelo en tus mesas',
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 px-4" style={{ backgroundColor: 'var(--brand-cream)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brand-dark)' }}
          >
            Cómo funciona
          </h2>
          <p className="text-lg" style={{ color: 'var(--brand-muted)' }}>
            Cuatro pasos para tener tu carta digital
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {steps.map((step, idx) => (
            <div key={step.number} className="relative text-center">
              {idx < steps.length - 1 && (
                <div
                  className="hidden lg:block absolute top-8 left-[60%] w-full h-px"
                  style={{ backgroundColor: 'var(--brand-border)' }}
                />
              )}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 relative z-10"
                style={{
                  backgroundColor: 'var(--brand-gold)',
                  color: 'var(--brand-dark)',
                  fontFamily: 'var(--font-playfair)',
                }}
              >
                {step.number}
              </div>
              <h3
                className="font-semibold mb-2"
                style={{ color: 'var(--brand-dark)' }}
              >
                {step.title}
              </h3>
              <p className="text-sm" style={{ color: 'var(--brand-muted)' }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Onboarding banner */}
        <div
          className="text-center p-6 rounded-2xl border"
          style={{
            backgroundColor: 'var(--brand-warm)',
            borderColor: 'var(--brand-border)',
          }}
        >
          <p style={{ color: 'var(--brand-muted)' }}>
            ¿No tienes tiempo?{' '}
            <Link
              href="/registro"
              className="font-semibold underline"
              style={{ color: 'var(--brand-gold)' }}
            >
              Lo hacemos nosotros →
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}

import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Pricing } from '@/components/landing/Pricing'
import { Testimonials } from '@/components/landing/Testimonials'
import { Footer } from '@/components/landing/Footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />

      {/* Final CTA */}
      <section
        className="py-20 px-4 text-center"
        style={{ backgroundColor: 'var(--brand-dark)' }}
      >
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4 text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Tu carta digital,{' '}
            <span style={{ color: '#3D6FFF' }}>lista antes de la cena</span>
          </h2>
          <p className="text-lg mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Sin tarjeta de crédito · Sin permanencia · En 10 minutos
          </p>
          <Link href="/registro">
            <Button
              size="lg"
              className="text-base font-semibold px-10 py-6 rounded-xl shadow-lg transition-all duration-200 bg-[#1B4FD8] hover:bg-[#3D6FFF] text-white"
            >
              Crear mi carta gratis →
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}

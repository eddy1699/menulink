'use client'

import { useEffect, useState } from 'react'

export function SplashScreen() {
  const [phase, setPhase] = useState<'visible' | 'fading' | 'gone'>('visible')

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPhase('fading'), 1000)
    const hideTimer = setTimeout(() => setPhase('gone'), 2500)
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer) }
  }, [])

  if (phase === 'gone') return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        backgroundColor: '#0D0D0D',
        opacity: phase === 'fading' ? 0 : 1,
        transition: 'opacity 1.8s ease-out',
        pointerEvents: phase === 'fading' ? 'none' : 'all',
      }}
    >
      {/* K logo */}
      <div className="splash-logo mb-6">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl"
          style={{ backgroundColor: '#1B4FD8' }}
        >
          <span
            className="text-4xl font-black text-white"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-2px' }}
          >
            K
          </span>
        </div>
      </div>

      {/* Text */}
      <div className="splash-text text-center">
        <p
          className="text-2xl font-bold text-white mb-1"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Bienvenido a Karta
        </p>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Carta digital para restaurantes
        </p>
      </div>

    </div>
  )
}

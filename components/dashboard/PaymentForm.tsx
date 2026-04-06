'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    KR: any
  }
}

interface Props {
  formToken: string
  onSuccess: (plan: string) => void
  onError: (msg: string) => void
}

function waitForKR(maxMs = 15000): Promise<boolean> {
  if (typeof window !== 'undefined' && window.KR) return Promise.resolve(true)
  return new Promise((resolve) => {
    const start = Date.now()
    const id = setInterval(() => {
      if (window.KR) { clearInterval(id); resolve(true) }
      else if (Date.now() - start > maxMs) { clearInterval(id); resolve(false) }
    }, 150)
  })
}

export function PaymentForm({ formToken, onSuccess, onError }: Props) {
  const divRef = useRef<HTMLDivElement>(null)
  const [krReady, setKrReady] = useState(false)

  useEffect(() => {
    let mounted = true

    async function init() {
      const loaded = await waitForKR()
      if (!mounted) return
      if (!loaded) { onError('No se pudo cargar la pasarela de pago'); return }

      try {
        // Set form token via KR API (async — must await)
        await window.KR.setFormConfig({
          formToken,
          'kr-language': 'es-ES',
        })

        // Listen for payment result
        await window.KR.onSubmit(async (event: Record<string, unknown>) => {
          // Log the full event so we can see the real structure
          console.log('[KR onSubmit] full event:', JSON.stringify(event, null, 2))

          const clientAnswer = event.clientAnswer
          const hash = event.hash as string
          const clientAnswerJson =
            typeof clientAnswer === 'string' ? clientAnswer : JSON.stringify(clientAnswer)

          try {
            const res = await fetch('/api/payments/confirm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ clientAnswer: clientAnswerJson, hash }),
            })
            const data = await res.json()
            if (data.ok) {
              onSuccess(data.plan)
            } else {
              onError(data.error || 'El pago no fue aprobado')
            }
          } catch {
            onError('Error de conexión. Intenta nuevamente.')
          }
          return false // prevent default redirect
        })

        await window.KR.onError((err: { errorMessage?: string }) => {
          if (err.errorMessage) onError(err.errorMessage)
        })

        if (mounted) setKrReady(true)
      } catch (e) {
        console.error('[KR]', e)
        if (mounted) onError('Error al inicializar la pasarela de pago')
      }
    }

    init()
    return () => { mounted = false }
  }, [formToken, onSuccess, onError])

  // Set kr-form-token and kr-popin via DOM ref (React strips unknown attributes)
  useEffect(() => {
    if (!divRef.current) return
    divRef.current.setAttribute('kr-form-token', formToken)
    divRef.current.setAttribute('kr-popin', '')
  }, [formToken])

  return (
    <div className="py-2">
      {!krReady && (
        <div className="flex items-center justify-center gap-2 h-16 text-sm" style={{ color: 'var(--brand-muted)' }}>
          <Loader2 size={16} className="animate-spin" />
          Cargando pasarela de pago…
        </div>
      )}
      {/*
        kr-smart-form + kr-popin: Krypton renders its own Pay button.
        Clicking it opens Izipay's modal overlay.
        Attributes set via ref to bypass React's attribute restrictions.
      */}
      <div ref={divRef} className="kr-smart-form" />
    </div>
  )
}

'use client'

import { useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import NProgress from 'nprogress'

// Configurar NProgress una sola vez
NProgress.configure({ showSpinner: false, speed: 300, minimum: 0.1 })

export function NavigationProgress() {
  const pathname = usePathname()

  // Terminar la barra cuando cambia la ruta
  useEffect(() => {
    NProgress.done()
  }, [pathname])

  return null
}

// Hook para disparar la barra al hacer click en links internos
export function useNavProgress() {
  const router = useRouter()

  const navigate = useCallback(
    (href: string) => {
      NProgress.start()
      router.push(href)
    },
    [router]
  )

  return navigate
}

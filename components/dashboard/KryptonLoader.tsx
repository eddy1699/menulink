'use client'

import { useEffect } from 'react'

const MODE = process.env.NEXT_PUBLIC_IZIPAY_MODE || process.env.IZIPAY_MODE || 'TEST'
const PUBLIC_KEY = MODE === 'PROD' || MODE === 'PRODUCTION'
  ? process.env.NEXT_PUBLIC_IZIPAY_PUBLIC_KEY_PROD!
  : process.env.NEXT_PUBLIC_IZIPAY_PUBLIC_KEY_TEST!
const BASE = 'https://static.micuentaweb.pe/static/js/krypton-client/V4.0'

export function KryptonLoader() {
  useEffect(() => {
    if (document.getElementById('kr-script')) return // already loaded

    // 1. Neon theme CSS (from /ext/ as per docs)
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = `${BASE}/ext/neon-reset.min.css`
    document.head.appendChild(css)

    // 2. Neon theme JS
    const neonJs = document.createElement('script')
    neonJs.src = `${BASE}/ext/neon.js`
    document.head.appendChild(neonJs)

    // 3. Main Krypton script — kr-public-key MUST be set as attribute
    const script = document.createElement('script')
    script.id = 'kr-script'
    script.src = `${BASE}/stable/kr-payment-form.min.js`
    script.setAttribute('kr-public-key', PUBLIC_KEY)
    script.setAttribute('kr-language', 'es-ES')
    document.head.appendChild(script)
  }, [])

  return null
}

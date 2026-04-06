'use client'

import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Download, Copy } from 'lucide-react'

interface QRDisplayProps {
  url: string
  primaryColor: string
  restaurantName: string
}

export function QRDisplay({ url, primaryColor, restaurantName }: QRDisplayProps) {
  const qrRef = useRef<HTMLDivElement>(null)

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(url)
    alert('¡Link copiado!')
  }

  const handleDownload = () => {
    const svgEl = qrRef.current?.querySelector('svg')
    if (!svgEl) return

    const svgData = new XMLSerializer().serializeToString(svgEl)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url2 = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url2
    a.download = `qr-${restaurantName.toLowerCase().replace(/\s+/g, '-')}.svg`
    a.click()
    URL.revokeObjectURL(url2)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        ref={qrRef}
        className="p-6 rounded-2xl border shadow-lg"
        style={{ backgroundColor: 'white', borderColor: 'var(--brand-border)' }}
      >
        <QRCodeSVG
          value={url}
          size={220}
          fgColor={primaryColor}
          bgColor="white"
          level="H"
          includeMargin
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Button
          onClick={handleDownload}
          className="flex-1 gap-2 font-semibold"
          style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
        >
          <Download size={16} />
          Descargar QR
        </Button>
        <Button
          variant="outline"
          onClick={handleCopyLink}
          className="flex-1 gap-2"
          style={{ borderColor: 'var(--brand-border)' }}
        >
          <Copy size={16} />
          Copiar link
        </Button>
      </div>

      <div
        className="text-center p-4 rounded-xl border w-full max-w-sm"
        style={{ backgroundColor: 'var(--brand-warm)', borderColor: 'var(--brand-border)' }}
      >
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--brand-muted)' }}>
          URL de tu carta
        </p>
        <p className="text-sm font-mono break-all" style={{ color: 'var(--brand-dark)' }}>
          {url}
        </p>
      </div>
    </div>
  )
}

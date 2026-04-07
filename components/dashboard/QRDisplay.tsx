'use client'

import { useRef } from 'react'
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Download, Copy, Share2 } from 'lucide-react'

interface QRDisplayProps {
  url: string
  primaryColor: string
  bgColor: string
  restaurantName: string
  logoUrl?: string
}

export function QRDisplay({ url, primaryColor, bgColor, restaurantName, logoUrl }: QRDisplayProps) {
  const qrCanvasRef = useRef<HTMLDivElement>(null)

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(url)
    alert('¡Link copiado!')
  }

  const handleShareLink = async () => {
    if (navigator.share) {
      await navigator.share({ title: restaurantName, text: 'Mira nuestra carta digital', url })
    } else {
      await navigator.clipboard.writeText(url)
      alert('¡Link copiado! Compártelo por WhatsApp o donde quieras.')
    }
  }

  const handleDownload = async () => {
    // Card dimensions
    const W = 600
    const H = 780
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!

    // ── Background ──
    ctx.fillStyle = bgColor || '#FFFFFF'
    ctx.fillRect(0, 0, W, H)

    // ── Header band ──
    const headerH = 220
    ctx.fillStyle = primaryColor
    roundRect(ctx, 0, 0, W, headerH, { tl: 0, tr: 0, bl: 0, br: 0 })

    // ── Logo ──
    const logoSize = 80
    const logoY = 30
    if (logoUrl) {
      try {
        const img = await loadImage(logoUrl)
        // White circle behind logo
        ctx.save()
        ctx.fillStyle = 'rgba(255,255,255,0.15)'
        ctx.beginPath()
        ctx.arc(W / 2, logoY + logoSize / 2, logoSize / 2 + 10, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
        // Draw logo clipped to circle
        ctx.save()
        ctx.beginPath()
        ctx.arc(W / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(img, W / 2 - logoSize / 2, logoY, logoSize, logoSize)
        ctx.restore()
      } catch { /* skip logo if fails */ }
    }

    // ── Restaurant name ──
    const nameY = logoUrl ? logoY + logoSize + 20 : 60
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `bold 32px -apple-system, "DM Sans", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    // Truncate if too long
    let name = restaurantName
    while (ctx.measureText(name).width > W - 60 && name.length > 3) {
      name = name.slice(0, -1)
    }
    if (name !== restaurantName) name += '…'
    ctx.fillText(name, W / 2, nameY)

    // ── Tagline ──
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = `16px -apple-system, "DM Sans", sans-serif`
    ctx.fillText('Escanea para ver nuestra carta', W / 2, nameY + 36)

    // ── QR white card ──
    const qrPad = 24
    const qrSize = 280
    const qrCardW = qrSize + qrPad * 2
    const qrCardH = qrSize + qrPad * 2
    const qrCardX = (W - qrCardW) / 2
    const qrCardY = headerH + 40

    ctx.shadowColor = 'rgba(0,0,0,0.08)'
    ctx.shadowBlur = 24
    ctx.shadowOffsetY = 4
    ctx.fillStyle = '#FFFFFF'
    roundRect(ctx, qrCardX, qrCardY, qrCardW, qrCardH, 20)
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0

    // ── Draw QR from hidden canvas ──
    const qrEl = qrCanvasRef.current?.querySelector('canvas')
    if (qrEl) {
      ctx.drawImage(qrEl, qrCardX + qrPad, qrCardY + qrPad, qrSize, qrSize)
    }

    // ── URL text ──
    const urlY = qrCardY + qrCardH + 28
    ctx.fillStyle = primaryColor
    ctx.font = `bold 14px -apple-system, monospace`
    ctx.fillText(url.replace('https://', ''), W / 2, urlY)

    // ── Bottom "Powered by Karta" ──
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.font = `12px -apple-system, "DM Sans", sans-serif`
    ctx.fillText('Powered by Karta', W / 2, H - 24)

    // ── Export ──
    canvas.toBlob((blob) => {
      if (!blob) return
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `qr-${restaurantName.toLowerCase().replace(/\s+/g, '-')}.png`
      a.click()
      URL.revokeObjectURL(a.href)
    }, 'image/png')
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Preview */}
      <div
        className="rounded-2xl overflow-hidden shadow-xl w-full max-w-[300px]"
        style={{ backgroundColor: bgColor }}
      >
        {/* Header */}
        <div
          className="flex flex-col items-center pt-6 pb-5 px-4 gap-2"
          style={{ backgroundColor: primaryColor }}
        >
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="Logo"
              className="w-14 h-14 rounded-full object-cover border-2 border-white/30"
            />
          )}
          <p className="text-white font-bold text-lg text-center leading-tight">{restaurantName}</p>
          <p className="text-white/70 text-xs">Escanea para ver nuestra carta</p>
        </div>

        {/* QR */}
        <div className="flex flex-col items-center py-6 px-4 gap-3">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <QRCodeSVG
              value={url}
              size={180}
              fgColor={primaryColor}
              bgColor="white"
              level="H"
            />
          </div>
          <p className="text-xs font-mono text-center break-all" style={{ color: primaryColor }}>
            {url.replace('https://', '')}
          </p>
        </div>

        <div className="text-center pb-3 text-xs" style={{ color: 'rgba(0,0,0,0.3)' }}>
          Powered by Karta
        </div>
      </div>

      {/* Hidden canvas QR for download */}
      <div ref={qrCanvasRef} style={{ display: 'none' }}>
        <QRCodeCanvas
          value={url}
          size={280}
          fgColor={primaryColor}
          bgColor="white"
          level="H"
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button
          onClick={handleDownload}
          className="w-full gap-2 font-semibold"
          style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
        >
          <Download size={16} />
          Descargar QR
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="flex-1 gap-2"
            style={{ borderColor: 'var(--brand-border)' }}
          >
            <Copy size={16} />
            Copiar link
          </Button>
          <Button
            variant="outline"
            onClick={handleShareLink}
            className="flex-1 gap-2"
            style={{ borderColor: 'var(--brand-border)' }}
          >
            <Share2 size={16} />
            Compartir
          </Button>
        </div>
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

// ── Helpers ──

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  radius: number | { tl?: number; tr?: number; br?: number; bl?: number }
) {
  const r = typeof radius === 'number'
    ? { tl: radius, tr: radius, br: radius, bl: radius }
    : { tl: 0, tr: 0, br: 0, bl: 0, ...radius }
  ctx.beginPath()
  ctx.moveTo(x + r.tl, y)
  ctx.lineTo(x + w - r.tr, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr)
  ctx.lineTo(x + w, y + h - r.br)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h)
  ctx.lineTo(x + r.bl, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl)
  ctx.lineTo(x, y + r.tl)
  ctx.quadraticCurveTo(x, y, x + r.tl, y)
  ctx.closePath()
  ctx.fill()
}

import Link from 'next/link'

interface PoweredByMenuQRProps {
  accentColor?: string
}

export function PoweredByMenuQR({ accentColor }: PoweredByMenuQRProps) {
  return (
    <footer
      className="text-center py-6 px-4 text-sm"
      style={{ color: 'rgba(0,0,0,0.55)' }}
    >
      Carta digital por{' '}
      <Link
        href="https://menuqr.pe"
        className="font-semibold"
        style={{ color: accentColor ?? '#C9A96E' }}
        target="_blank"
        rel="noopener noreferrer"
      >
        MenuQR
      </Link>{' '}
      🍽️ —{' '}
      <Link href="/registro" className="underline">
        Crea la tuya gratis
      </Link>
    </footer>
  )
}

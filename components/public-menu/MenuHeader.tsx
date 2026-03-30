import Image from 'next/image'

interface MenuHeaderProps {
  name: string
  description: string | null
  logoUrl: string | null
  district: string | null
  city: string
  primaryColor: string
}

export function MenuHeader({
  name,
  description,
  logoUrl,
  district,
  city,
  primaryColor,
}: MenuHeaderProps) {
  return (
    <header
      className="px-4 pt-12 pb-8 text-center text-white"
      style={{ backgroundColor: primaryColor }}
    >
      {logoUrl && (
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-white/20 border-2 border-white/40">
            <Image
              src={logoUrl}
              alt={name}
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      )}
      <h1
        className="text-2xl font-bold mb-2"
        style={{ fontFamily: 'var(--font-playfair)' }}
      >
        {name}
      </h1>
      {description && (
        <p className="text-sm opacity-80 mb-2 max-w-sm mx-auto">{description}</p>
      )}
      <div className="text-xs opacity-60">
        {district ? `${district}, ` : ''}{city}
      </div>
    </header>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'

type AdPlacement = 'BETWEEN_CATEGORIES' | 'MENU_FOOTER' | 'DASHBOARD_BANNER'

interface AdPayload {
  id: string
  imageUrl: string
  linkUrl: string
  altText: string
  advertiser: string
}

interface AdBannerProps {
  placement: AdPlacement
  restaurantId: string
  source?: string | null
  language?: string | null
}

export function AdBanner({
  placement,
  restaurantId,
  source,
  language,
}: AdBannerProps) {
  const [ad, setAd] = useState<AdPayload | null>(null)
  const impressionFired = useRef(false)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/ads?placement=${encodeURIComponent(placement)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled) return
        const payload: AdPayload | null = json?.data ?? null
        setAd(payload)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [placement])

  useEffect(() => {
    if (!ad || impressionFired.current) return
    impressionFired.current = true
    fetch('/api/ads/impression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adId: ad.id,
        restaurantId,
        source: source ?? null,
        language: language ?? null,
      }),
      keepalive: true,
    }).catch(() => {})
  }, [ad, restaurantId, source, language])

  if (!ad) return null

  const handleClick = () => {
    fetch('/api/ads/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adId: ad.id,
        restaurantId,
        source: source ?? null,
        language: language ?? null,
      }),
      keepalive: true,
    }).catch(() => {})
  }

  return (
    <a
      href={ad.linkUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      className="block my-4 rounded-lg overflow-hidden shadow-sm"
      aria-label={`Anuncio: ${ad.advertiser}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ad.imageUrl}
        alt={ad.altText}
        className="w-full h-auto block"
        loading="lazy"
      />
      <div className="text-[10px] uppercase tracking-wide text-right px-2 py-1 bg-black/5 text-black/50">
        Publicidad
      </div>
    </a>
  )
}

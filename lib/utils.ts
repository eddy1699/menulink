import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { headers } from 'next/headers'

export async function getAppUrl(): Promise<string> {
  const hdrs = await headers()
  const host = hdrs.get('host') || 'localhost:3000'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  return `${proto}://${host}`
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

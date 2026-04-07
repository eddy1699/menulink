import { headers } from 'next/headers'

export async function getAppUrl(): Promise<string> {
  const hdrs = await headers()
  const host = hdrs.get('host') || 'localhost:3000'
  const proto = host.startsWith('localhost') ? 'http' : 'https'
  return `${proto}://${host}`
}

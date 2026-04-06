import { createClient, SupabaseClient } from '@supabase/supabase-js'

export const STORAGE_BUCKET = 'restaurantes'

// Lazy singletons — se crean solo cuando se llama, no en el import
let _supabaseAdmin: SupabaseClient | null = null
let _supabase: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Supabase admin env vars missing')
    _supabaseAdmin = createClient(url, key)
  }
  return _supabaseAdmin
}

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('Supabase public env vars missing')
    _supabase = createClient(url, key)
  }
  return _supabase
}

// Backward-compat exports so existing imports still work
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return getSupabaseAdmin()[prop as keyof SupabaseClient]
  },
})

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return getSupabase()[prop as keyof SupabaseClient]
  },
})

export function getPublicUrl(path: string): string {
  const { data } = getSupabaseAdmin().storage.from(STORAGE_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

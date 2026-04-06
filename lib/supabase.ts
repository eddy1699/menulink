import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente server-side con service role (para uploads desde API routes)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Cliente público (para uso en componentes client-side si fuera necesario)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const STORAGE_BUCKET = 'restaurantes'

export function getPublicUrl(path: string): string {
  const { data } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

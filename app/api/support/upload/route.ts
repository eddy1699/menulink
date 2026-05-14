import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseAdmin, STORAGE_BUCKET, getPublicUrl } from '@/lib/supabase'
import { randomUUID } from 'crypto'

const MAX_SIZE_MB = 10
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'application/pdf',
  'text/plain',
  'application/zip',
]

function isStaff(role: string | null | undefined) {
  return role === 'SUPERADMIN'
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 })
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Tipo de archivo no permitido. Acepta imágenes, PDF, TXT o ZIP.' },
      { status: 400 },
    )
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return NextResponse.json(
      { error: `El archivo no puede superar ${MAX_SIZE_MB} MB` },
      { status: 400 },
    )
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
  const ownerSegment = isStaff(session.user.role) ? 'staff' : session.user.id
  const storagePath = `support/${ownerSegment}/${randomUUID()}-${safeName}.${ext}`

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const { error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    console.error('[support/upload]', error)
    return NextResponse.json({ error: 'Error al subir el archivo' }, { status: 500 })
  }

  return NextResponse.json({
    fileUrl: getPublicUrl(storagePath),
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  })
}

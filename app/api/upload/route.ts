import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { supabaseAdmin, STORAGE_BUCKET, getPublicUrl } from '@/lib/supabase'

const MAX_SIZE_MB = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { ownerId: session.user.id },
    select: { id: true, plan: true },
  })

  if (!restaurant) {
    return NextResponse.json({ error: 'Restaurante no encontrado' }, { status: 404 })
  }

  // Solo planes PRO y BUSINESS pueden subir fotos de items
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const type = formData.get('type') as string | null // 'item' | 'logo'
  const itemId = formData.get('itemId') as string | null

  if (!file || !type) {
    return NextResponse.json({ error: 'Archivo y tipo requeridos' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo de archivo no permitido. Usa JPG, PNG o WebP.' }, { status: 400 })
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return NextResponse.json({ error: `El archivo no puede superar ${MAX_SIZE_MB}MB` }, { status: 400 })
  }

  // Solo Pro/Business pueden subir fotos de platos
  if (type === 'item' && restaurant.plan === 'STARTER') {
    return NextResponse.json({ error: 'Las fotos de platos están disponibles desde el plan Pro' }, { status: 403 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  let storagePath: string
  if (type === 'logo') {
    storagePath = `${restaurant.id}/logo.webp`
  } else if (type === 'item' && itemId) {
    storagePath = `${restaurant.id}/items/${itemId}.webp`
  } else {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, buffer, {
      contentType: 'image/webp',
      upsert: true,
    })

  if (error) {
    console.error('Supabase storage error:', error)
    return NextResponse.json({ error: 'Error al subir la imagen' }, { status: 500 })
  }

  const publicUrl = getPublicUrl(storagePath)

  // Actualizar URL en la base de datos
  if (type === 'logo') {
    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: { logoUrl: publicUrl },
    })
  } else if (type === 'item' && itemId) {
    // Verificar que el item pertenece al restaurante
    const item = await prisma.menuItem.findFirst({
      where: { id: itemId, category: { restaurantId: restaurant.id } },
    })
    if (!item) {
      return NextResponse.json({ error: 'Plato no encontrado' }, { status: 404 })
    }
    await prisma.menuItem.update({
      where: { id: itemId },
      data: { imageUrl: publicUrl },
    })
  }

  return NextResponse.json({ url: publicUrl })
}

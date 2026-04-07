'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { generateSlug } from '@/lib/slug'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  restaurantName: z.string().min(2, 'Mínimo 2 caracteres'),
})

type FormData = z.infer<typeof schema>

export default function RegistroPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError('')

    try {
      // Create user and restaurant via API
      const res = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          restaurantName: data.restaurantName,
          slug: generateSlug(data.restaurantName),
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error || 'Error al crear cuenta')
        setLoading(false)
        return
      }

      // Auto sign in
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        router.push('/login')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Error al crear cuenta')
      setLoading(false)
    }
  }

  return (
    <div
      className="w-full max-w-sm p-5 sm:p-8 rounded-2xl shadow-lg border"
      style={{
        backgroundColor: 'white',
        borderColor: 'var(--brand-border)',
      }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/">
          <span
            className="text-2xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}
          >
            Karta
          </span>
        </Link>
        <h1
          className="text-xl font-semibold mt-4 mb-1"
          style={{ color: 'var(--brand-dark)' }}
        >
          Crear cuenta
        </h1>
        <p className="text-sm" style={{ color: 'var(--brand-muted)' }}>
          Tu carta digital en 10 minutos
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name" style={{ color: 'var(--brand-dark)' }}>Tu nombre</Label>
          <Input id="name" placeholder="Juan Pérez" className="mt-1" {...register('name')} />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="restaurantName" style={{ color: 'var(--brand-dark)' }}>Nombre del restaurante</Label>
          <Input id="restaurantName" placeholder="La Cevichería Limeña" className="mt-1" {...register('restaurantName')} />
          {errors.restaurantName && <p className="text-xs text-red-500 mt-1">{errors.restaurantName.message}</p>}
        </div>

        <div>
          <Label htmlFor="email" style={{ color: 'var(--brand-dark)' }}>Email</Label>
          <Input id="email" type="email" placeholder="tu@restaurante.pe" className="mt-1" {...register('email')} />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="password" style={{ color: 'var(--brand-dark)' }}>Contraseña</Label>
          <Input id="password" type="password" placeholder="••••••••" className="mt-1" {...register('password')} />
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full font-semibold"
          disabled={loading}
          style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta →'}
        </Button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: 'var(--brand-muted)' }}>
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-semibold underline" style={{ color: 'var(--brand-gold)' }}>
          Iniciar sesión
        </Link>
      </p>
    </div>
  )
}

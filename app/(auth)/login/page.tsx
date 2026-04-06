'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
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
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email o contraseña incorrectos')
        setLoading(false)
        return
      }

      // Redirect based on role (middleware will handle)
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Error al iniciar sesión')
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
          Iniciar sesión
        </h1>
        <p className="text-sm" style={{ color: 'var(--brand-muted)' }}>
          Accede a tu panel de control
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email" style={{ color: 'var(--brand-dark)' }}>
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@restaurante.pe"
            className="mt-1"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password" style={{ color: 'var(--brand-dark)' }}>
            Contraseña
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="mt-1"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
          )}
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
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Button>
      </form>

      <div className="text-center mt-4">
        <Link href="/recuperar" className="text-sm" style={{ color: 'var(--brand-muted)' }}>
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <p className="text-center text-sm mt-4" style={{ color: 'var(--brand-muted)' }}>
        ¿No tienes cuenta?{' '}
        <Link
          href="/registro"
          className="font-semibold underline"
          style={{ color: 'var(--brand-gold)' }}
        >
          Regístrate gratis
        </Link>
      </p>
    </div>
  )
}

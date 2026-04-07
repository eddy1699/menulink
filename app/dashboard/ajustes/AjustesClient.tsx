'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { signOut } from 'next-auth/react'
import { User, Building2, Lock, LogOut, Check, Link } from 'lucide-react'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

function useSave() {
  const [state, setState] = useState<SaveState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const save = async (fn: () => Promise<Response>) => {
    setState('saving')
    setErrorMsg('')
    try {
      const res = await fn()
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Error al guardar')
        setState('error')
      } else {
        setState('saved')
        setTimeout(() => setState('idle'), 3000)
      }
    } catch {
      setErrorMsg('Error de conexión')
      setState('error')
    }
  }

  return { state, errorMsg, save }
}

interface Restaurant {
  id: string
  slug: string
  name: string
  phone: string | null
  address: string | null
  district: string | null
  city: string
  isActive: boolean
}

interface Props {
  userName: string
  userEmail: string
  restaurant: Restaurant
}

export function AjustesClient({ userName: initialName, userEmail, restaurant }: Props) {
  // Negocio
  const [restaurantName, setRestaurantName] = useState(restaurant.name)
  const [slug, setSlug] = useState(restaurant.slug)
  const [phone, setPhone] = useState(restaurant.phone || '')
  const [address, setAddress] = useState(restaurant.address || '')
  const [district, setDistrict] = useState(restaurant.district || '')
  const [city, setCity] = useState(restaurant.city)
  const [isActive, setIsActive] = useState(restaurant.isActive)
  const negocioSave = useSave()

  const cleanSlug = (val: string) =>
    val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')

  // Usuario
  const [userName, setUserName] = useState(initialName)
  const usuarioSave = useSave()

  // Contraseña
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const passwordSave = useSave()

  const handleNegocio = () => {
    negocioSave.save(() =>
      fetch(`/api/restaurants/${restaurant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: restaurantName, slug, phone, address, district, city, isActive }),
      })
    )
  }

  const handleUsuario = () => {
    usuarioSave.save(() =>
      fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userName }),
      })
    )
  }

  const handlePassword = () => {
    if (newPassword !== confirmPassword) return
    passwordSave.save(() =>
      fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}>
        Mi perfil
      </h1>

      {/* Datos del negocio */}
      <Card style={{ borderColor: 'var(--brand-border)' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}>
            <Building2 size={18} style={{ color: '#1B4FD8' }} />
            Datos del negocio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nombre del restaurante</Label>
              <Input value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} placeholder="Mi restaurante" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="flex items-center gap-1.5"><Link size={13} /> URL de tu carta</Label>
              <div className="flex items-center rounded-lg border overflow-hidden" style={{ borderColor: 'var(--brand-border)' }}>
                <span className="px-3 py-2 text-sm bg-[#F5F5F7] text-[#6B7280] border-r whitespace-nowrap" style={{ borderColor: 'var(--brand-border)' }}>
                  kartape.com/
                </span>
                <input
                  className="flex-1 px-3 py-2 text-sm outline-none bg-white"
                  value={slug}
                  onChange={(e) => setSlug(cleanSlug(e.target.value))}
                  placeholder="mi-restaurante"
                  style={{ color: '#1B4FD8', fontWeight: 600 }}
                />
              </div>
              <p className="text-xs" style={{ color: 'var(--brand-muted)' }}>
                Solo letras minúsculas, números y guiones. Sin espacios.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Teléfono</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+51 999 999 999" />
            </div>
            <div className="space-y-1.5">
              <Label>Dirección</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Av. Principal 123" />
            </div>
            <div className="space-y-1.5">
              <Label>Distrito</Label>
              <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Miraflores" />
            </div>
            <div className="space-y-1.5">
              <Label>Ciudad</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Lima" />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--brand-warm)' }}>
            <div>
              <Label className="font-medium">Carta pública activa</Label>
              <p className="text-xs mt-0.5" style={{ color: 'var(--brand-muted)' }}>
                Los clientes pueden ver tu carta cuando está activa.
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          {negocioSave.errorMsg && <p className="text-sm text-red-500">{negocioSave.errorMsg}</p>}
          <Button
            onClick={handleNegocio}
            disabled={negocioSave.state === 'saving'}
            className="font-semibold"
            style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
          >
            {negocioSave.state === 'saving' ? 'Guardando...' : negocioSave.state === 'saved' ? <><Check size={14} className="mr-1.5 inline" />Guardado</> : 'Guardar cambios'}
          </Button>
        </CardContent>
      </Card>

      {/* Datos del usuario */}
      <Card style={{ borderColor: 'var(--brand-border)' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}>
            <User size={18} style={{ color: '#1B4FD8' }} />
            Mi usuario
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Tu nombre" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={userEmail} disabled className="opacity-60 cursor-not-allowed" />
            </div>
          </div>

          {usuarioSave.errorMsg && <p className="text-sm text-red-500">{usuarioSave.errorMsg}</p>}
          <Button
            onClick={handleUsuario}
            disabled={usuarioSave.state === 'saving'}
            className="font-semibold"
            style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
          >
            {usuarioSave.state === 'saving' ? 'Guardando...' : usuarioSave.state === 'saved' ? <><Check size={14} className="mr-1.5 inline" />Guardado</> : 'Guardar cambios'}
          </Button>
        </CardContent>
      </Card>

      {/* Cambiar contraseña */}
      <Card style={{ borderColor: 'var(--brand-border)' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base" style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-dark)' }}>
            <Lock size={18} style={{ color: '#1B4FD8' }} />
            Cambiar contraseña
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Contraseña actual</Label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nueva contraseña</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
            </div>
            <div className="space-y-1.5">
              <Label>Confirmar contraseña</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
                style={{ borderColor: confirmPassword && confirmPassword !== newPassword ? '#ef4444' : undefined }}
              />
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-xs text-red-500">Las contraseñas no coinciden</p>
              )}
            </div>
          </div>

          {passwordSave.errorMsg && <p className="text-sm text-red-500">{passwordSave.errorMsg}</p>}
          {passwordSave.state === 'saved' && (
            <p className="text-sm text-green-600 flex items-center gap-1"><Check size={14} />Contraseña actualizada correctamente</p>
          )}
          <Button
            onClick={handlePassword}
            disabled={passwordSave.state === 'saving' || !currentPassword || !newPassword || newPassword !== confirmPassword}
            className="font-semibold"
            style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
          >
            {passwordSave.state === 'saving' ? 'Guardando...' : 'Cambiar contraseña'}
          </Button>
        </CardContent>
      </Card>

      {/* Sesión */}
      <Card style={{ borderColor: '#fecaca' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-red-600" style={{ fontFamily: 'var(--font-display)' }}>
            <LogOut size={18} />
            Sesión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="border-red-200 text-red-500 hover:bg-red-50 w-full sm:w-auto"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

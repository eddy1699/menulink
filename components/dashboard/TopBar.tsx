'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User, ExternalLink, Menu } from 'lucide-react'

interface TopBarProps {
  userName?: string | null
  restaurantSlug?: string
  onMenuOpen?: () => void
}

export function TopBar({ userName, restaurantSlug, onMenuOpen }: TopBarProps) {
  const router = useRouter()
  const initials = userName
    ? userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <header
      className="h-14 sm:h-16 border-b px-4 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-30"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E4E4E7' }}
    >
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuOpen}
        className="md:hidden p-2 -ml-1 rounded-lg transition-opacity hover:opacity-70"
        style={{ color: 'var(--brand-dark)' }}
        aria-label="Abrir menú"
      >
        <Menu size={22} />
      </button>

      {/* Spacer on desktop */}
      <div className="hidden md:block flex-1" />

      <div className="flex items-center gap-3 ml-auto">
        {restaurantSlug && (
          <a
            href={`/${restaurantSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: 'var(--brand-muted)' }}
          >
            <ExternalLink size={14} />
            Ver carta
          </a>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
            <Avatar className="w-8 h-8">
              <AvatarFallback
                className="text-xs font-semibold"
                style={{ backgroundColor: '#1B4FD8', color: '#fff' }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--brand-dark)' }}>
              {userName}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {restaurantSlug && (
              <DropdownMenuItem asChild className="sm:hidden gap-2">
                <a href={`/${restaurantSlug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={14} />
                  Ver carta
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="gap-2" onClick={() => router.push('/dashboard/ajustes')}>
              <User size={14} />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-red-500"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut size={14} />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

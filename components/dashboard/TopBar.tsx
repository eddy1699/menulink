'use client'

import { signOut } from 'next-auth/react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User, ExternalLink } from 'lucide-react'

interface TopBarProps {
  userName?: string | null
  restaurantSlug?: string
}

export function TopBar({ userName, restaurantSlug }: TopBarProps) {
  const initials = userName
    ? userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <header
      className="h-16 border-b px-6 flex items-center justify-between"
      style={{
        backgroundColor: 'var(--brand-cream)',
        borderColor: 'var(--brand-border)',
      }}
    >
      <div />

      <div className="flex items-center gap-3">
        {restaurantSlug && (
          <a
            href={`/${restaurantSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm font-medium hover:opacity-70 transition-opacity"
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
                style={{ backgroundColor: 'var(--brand-gold)', color: 'var(--brand-dark)' }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--brand-dark)' }}>
              {userName}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2">
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

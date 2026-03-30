import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const session = req.auth
  const isLoggedIn = !!session?.user

  const isDashboard = nextUrl.pathname.startsWith('/dashboard')
  const isAdmin = nextUrl.pathname.startsWith('/admin')
  const isAuthPage = nextUrl.pathname.startsWith('/login') || nextUrl.pathname.startsWith('/registro')

  if (isDashboard) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl))
    }
    const role = session?.user?.role
    if (role !== 'RESTAURANT_ADMIN' && role !== 'SUPERADMIN') {
      return NextResponse.redirect(new URL('/login', nextUrl))
    }
  }

  if (isAdmin) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl))
    }
    if (session?.user?.role !== 'SUPERADMIN') {
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }
  }

  if (isAuthPage && isLoggedIn) {
    const role = session?.user?.role
    if (role === 'SUPERADMIN') {
      return NextResponse.redirect(new URL('/admin', nextUrl))
    }
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/registro'],
}

import type { NextAuthConfig } from 'next-auth'

// Configuración mínima compatible con Edge Runtime (sin pg, sin prisma, sin bcrypt)
// Usada exclusivamente por middleware.ts
export const authConfig: NextAuthConfig = {
  providers: [], // los providers reales se definen en auth.ts
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isAdmin = nextUrl.pathname.startsWith('/admin')

      if (isDashboard || isAdmin) return isLoggedIn
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
  },
  session: { strategy: 'jwt' },
}

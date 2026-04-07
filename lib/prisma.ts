import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    // In build time or test environments without DB, return client that will fail on actual queries
    // This is OK since Next.js build doesn't actually run DB queries
    const adapter = new PrismaPg(new Pool({ connectionString: 'postgresql://localhost/dummy' }))
    return new PrismaClient({ adapter })
  }

  const pool = new Pool({ connectionString, max: 1 })
  const adapter = new PrismaPg(pool, { schema: 'public' })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

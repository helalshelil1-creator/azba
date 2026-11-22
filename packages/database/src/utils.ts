import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper functions
export async function withTransaction<T>(
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(callback, { maxWait: 10000, timeout: 30000 })
}

export async function generateUniqueCode(
  prefix: string,
  model: keyof PrismaClient,
  field: string = 'code'
): Promise<string> {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export function calculatePagination(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit
  const take = Math.min(limit, 100)
  return { skip, take }
}

export function buildFilterQuery(filters: Record<string, any>) {
  const where: Record<string, any> = {}
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      where[key] = value
    }
  }
  return where
}

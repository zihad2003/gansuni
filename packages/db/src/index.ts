import { PrismaClient } from '@prisma/client'

declare global {
  var prismaGlobal: PrismaClient | undefined
}

const prismaOptions = {
  log: (process.env.NODE_ENV === 'development'
    ? ['error', 'warn']
    : ['error']) as ['error'] | ['error', 'warn'],
  errorFormat: 'pretty' as const,
}

export const prisma: PrismaClient =
  globalThis.prismaGlobal ??
  new PrismaClient(prismaOptions)

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}

export default prisma

export * from '@prisma/client'

export async function testDbConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

export async function healthCheck() {
  const isConnected = await testDbConnection()
  return {
    status: isConnected ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    database: isConnected ? 'connected' : 'disconnected',
  }
}

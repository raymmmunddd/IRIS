import { PrismaClient } from "@/generated/prisma/client"
import { createPrismaAdapter } from "@/lib/database"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

function createPrismaClient() {
  return new PrismaClient({
    adapter: createPrismaAdapter(),
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const transientDatabaseCodes = new Set([
  "P1001",
  "P1002",
  "P1017",
  "P2024",
  "ECONNRESET",
  "ETIMEDOUT",
  "EPIPE",
  "57P01",
  "57P03",
  "53300",
  "40001",
  "40P01",
])

const retryableReadOperations = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
])

function databaseErrorCode(error: unknown): string | undefined {
  let current: unknown = error
  for (let depth = 0; depth < 4 && current && typeof current === "object"; depth += 1) {
    const candidate = current as { code?: unknown; cause?: unknown }
    if (typeof candidate.code === "string") return candidate.code
    current = candidate.cause
  }
  return undefined
}

async function retryTransientRead<T>(run: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await run()
    } catch (error) {
      if (attempt >= 2 || !transientDatabaseCodes.has(databaseErrorCode(error) ?? "")) {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, 150 * 2 ** attempt))
    }
  }
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured")
  }

  return new PrismaClient({
    adapter: new PrismaPg(
      {
        connectionString,
        max: 5,
        idleTimeoutMillis: 10_000,
        connectionTimeoutMillis: 5_000,
        statement_timeout: 15_000,
        query_timeout: 17_000,
        lock_timeout: 5_000,
      },
      {
        onPoolError: (error) => console.error("PostgreSQL connection pool error:", error),
      },
    ),
  }).$extends({
    query: {
      $allModels: {
        $allOperations: async ({ operation, args, query }) => {
          if (!retryableReadOperations.has(operation)) return query(args)
          return retryTransientRead(() => query(args))
        },
      },
    },
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

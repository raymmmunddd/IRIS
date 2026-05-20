import { PrismaPg } from "@prisma/adapter-pg"

type DatabaseEnv = NodeJS.ProcessEnv

const DEFAULT_POOL_MAX = 3
const DEFAULT_IDLE_TIMEOUT_MS = 30_000
const DEFAULT_CONNECTION_TIMEOUT_MS = 5_000
const DEFAULT_MAX_LIFETIME_SECONDS = 300

function readPositiveInteger(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback
  }

  const parsed = Number.parseInt(value, 10)

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export function getDatabaseUrl(env: DatabaseEnv = process.env) {
  const databaseUrl = env.DATABASE_URL?.trim()

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured")
  }

  return databaseUrl
}

export function getDatabasePoolConfig(env: DatabaseEnv = process.env) {
  return {
    connectionString: getDatabaseUrl(env),
    max: readPositiveInteger(env.DATABASE_POOL_MAX, DEFAULT_POOL_MAX),
    min: 0,
    idleTimeoutMillis: readPositiveInteger(
      env.DATABASE_POOL_IDLE_TIMEOUT_MS,
      DEFAULT_IDLE_TIMEOUT_MS
    ),
    connectionTimeoutMillis: readPositiveInteger(
      env.DATABASE_POOL_CONNECTION_TIMEOUT_MS,
      DEFAULT_CONNECTION_TIMEOUT_MS
    ),
    maxLifetimeSeconds: readPositiveInteger(
      env.DATABASE_POOL_MAX_LIFETIME_SECONDS,
      DEFAULT_MAX_LIFETIME_SECONDS
    ),
    keepAlive: true,
    allowExitOnIdle: env.NODE_ENV !== "production",
  }
}

export function createPrismaAdapter(env: DatabaseEnv = process.env) {
  return new PrismaPg(getDatabasePoolConfig(env), {
    onPoolError(error) {
      console.error("[database] Unexpected PostgreSQL pool error", error)
    },
    onConnectionError(error) {
      console.error("[database] PostgreSQL connection error", error)
    },
  })
}

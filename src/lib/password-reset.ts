import { createHmac, randomInt, timingSafeEqual } from "node:crypto"

function resetCodeSecret() {
  const secret = process.env.AUTH_SECRET ?? process.env.DATABASE_URL
  if (!secret) throw new Error("Password reset signing secret is not configured")
  return secret
}

export function createPasswordResetCode() {
  return String(randomInt(100_000, 1_000_000))
}

export function hashPasswordResetCode(email: string, code: string) {
  return createHmac("sha256", resetCodeSecret())
    .update(`${email.trim().toLowerCase()}\n${code}`)
    .digest("hex")
}

export function matchesPasswordResetCode(expectedHash: string, email: string, code: string) {
  const expected = Buffer.from(expectedHash, "hex")
  const actual = Buffer.from(hashPasswordResetCode(email, code), "hex")
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

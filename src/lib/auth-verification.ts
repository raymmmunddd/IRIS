import type { SignupInput } from "@/lib/auth-data"

type PendingSignup = {
  code: string
  expiresAt: number
  input: SignupInput
}

const globalForVerification = globalThis as unknown as {
  irisSignupCodes?: Map<string, PendingSignup>
}

const signupCodes = globalForVerification.irisSignupCodes ?? new Map<string, PendingSignup>()

if (process.env.NODE_ENV !== "production") {
  globalForVerification.irisSignupCodes = signupCodes
}

function keyForEmail(email: string) {
  return email.trim().toLowerCase()
}

export function createVerificationCode(input: SignupInput) {
  const code = String(Math.floor(100000 + Math.random() * 900000))
  const email = keyForEmail(input.email)

  signupCodes.set(email, {
    code,
    input: { ...input, email },
    expiresAt: Date.now() + 10 * 60 * 1000,
  })

  return code
}

export function getPendingSignup(email: string, code: string) {
  const pending = signupCodes.get(keyForEmail(email))

  if (!pending) return null
  if (pending.expiresAt < Date.now()) {
    signupCodes.delete(keyForEmail(email))
    return null
  }
  if (pending.code !== code) return null

  return pending.input
}

export function clearPendingSignup(email: string) {
  signupCodes.delete(keyForEmail(email))
}

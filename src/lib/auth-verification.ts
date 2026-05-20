import type { SignupInput } from "@/lib/auth-data"

type PendingSignup = {
  code: string
  expiresAt: number
  input: SignupInput
}

type PendingPasswordReset = {
  code: string
  expiresAt: number
  email: string
}

const globalForVerification = globalThis as unknown as {
  irisSignupCodes?: Map<string, PendingSignup>
  irisPasswordResetCodes?: Map<string, PendingPasswordReset>
}

const signupCodes = globalForVerification.irisSignupCodes ?? new Map<string, PendingSignup>()
const passwordResetCodes = globalForVerification.irisPasswordResetCodes ?? new Map<string, PendingPasswordReset>()

if (process.env.NODE_ENV !== "production") {
  globalForVerification.irisSignupCodes = signupCodes
  globalForVerification.irisPasswordResetCodes = passwordResetCodes
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

export function createPasswordResetCode(emailValue: string) {
  const code = String(Math.floor(100000 + Math.random() * 900000))
  const email = keyForEmail(emailValue)

  passwordResetCodes.set(email, {
    code,
    email,
    expiresAt: Date.now() + 10 * 60 * 1000,
  })

  return code
}

export function getPendingPasswordReset(email: string, code: string) {
  const key = keyForEmail(email)
  const pending = passwordResetCodes.get(key)

  if (!pending) return null
  if (pending.expiresAt < Date.now()) {
    passwordResetCodes.delete(key)
    return null
  }
  if (pending.code !== code) return null

  return pending
}

export function clearPendingPasswordReset(email: string) {
  passwordResetCodes.delete(keyForEmail(email))
}

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

type PendingLogin = {
  code: string
  expiresAt: number
  email: string
}

type PendingEmailChange = {
  code: string
  expiresAt: number
  currentEmail: string
  nextEmail: string
}

const globalForVerification = globalThis as unknown as {
  irisSignupCodes?: Map<string, PendingSignup>
  irisPasswordResetCodes?: Map<string, PendingPasswordReset>
  irisLoginCodes?: Map<string, PendingLogin>
  irisEmailChangeCodes?: Map<string, PendingEmailChange>
}

const signupCodes = globalForVerification.irisSignupCodes ?? new Map<string, PendingSignup>()
const passwordResetCodes = globalForVerification.irisPasswordResetCodes ?? new Map<string, PendingPasswordReset>()
const loginCodes = globalForVerification.irisLoginCodes ?? new Map<string, PendingLogin>()
const emailChangeCodes = globalForVerification.irisEmailChangeCodes ?? new Map<string, PendingEmailChange>()

if (process.env.NODE_ENV !== "production") {
  globalForVerification.irisSignupCodes = signupCodes
  globalForVerification.irisPasswordResetCodes = passwordResetCodes
  globalForVerification.irisLoginCodes = loginCodes
  globalForVerification.irisEmailChangeCodes = emailChangeCodes
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

export function createLoginVerificationCode(emailValue: string) {
  const code = String(Math.floor(100000 + Math.random() * 900000))
  const email = keyForEmail(emailValue)

  loginCodes.set(email, {
    code,
    email,
    expiresAt: Date.now() + 10 * 60 * 1000,
  })

  return code
}

export function verifyLoginCode(email: string, code: string) {
  const key = keyForEmail(email)
  const pending = loginCodes.get(key)

  if (!pending) return false
  if (pending.expiresAt < Date.now()) {
    loginCodes.delete(key)
    return false
  }
  if (pending.code !== code) return false

  loginCodes.delete(key)
  return true
}

export function createEmailChangeCode(currentEmailValue: string, nextEmailValue: string) {
  const code = String(Math.floor(100000 + Math.random() * 900000))
  const currentEmail = keyForEmail(currentEmailValue)
  const nextEmail = keyForEmail(nextEmailValue)

  emailChangeCodes.set(currentEmail, {
    code,
    currentEmail,
    nextEmail,
    expiresAt: Date.now() + 10 * 60 * 1000,
  })

  return code
}

export function getPendingEmailChange(currentEmail: string, code: string) {
  const key = keyForEmail(currentEmail)
  const pending = emailChangeCodes.get(key)

  if (!pending) return null
  if (pending.expiresAt < Date.now()) {
    emailChangeCodes.delete(key)
    return null
  }
  if (pending.code !== code) return null

  return pending
}

export function clearPendingEmailChange(currentEmail: string) {
  emailChangeCodes.delete(keyForEmail(currentEmail))
}

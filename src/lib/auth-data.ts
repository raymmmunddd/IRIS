import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto"
import { Gender, OfficerRoleTitle, UserRole as DbUserRole, UserStatus } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import type { AuthUser, UserRole } from "@/lib/auth"

export type SignupInput = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  role: UserRole
  street: string
  contact: string
  gender: Gender
}

const PASSWORD_ITERATIONS = 120000
const PASSWORD_KEY_LENGTH = 64
const PASSWORD_DIGEST = "sha512"

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const hash = pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, PASSWORD_KEY_LENGTH, PASSWORD_DIGEST).toString("hex")
  return `${PASSWORD_ITERATIONS}:${salt}:${hash}`
}

export function verifyPassword(password: string, storedPassword?: string | null) {
  if (!storedPassword) return false

  const [iterationsValue, salt, hash] = storedPassword.split(":")
  const iterations = Number(iterationsValue)
  if (!iterations || !salt || !hash) return false

  const expected = Buffer.from(hash, "hex")
  const actual = pbkdf2Sync(password, salt, iterations, expected.length, PASSWORD_DIGEST)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

export function toDbRole(role: UserRole) {
  if (role === "resident") return DbUserRole.RESIDENT
  if (role === "bpat") return DbUserRole.BPAT_OFFICER
  return DbUserRole.ADMIN
}

export function toClientRole(role: DbUserRole): UserRole {
  if (role === DbUserRole.RESIDENT) return "resident"
  if (role === DbUserRole.BPAT_OFFICER) return "bpat"
  return "official"
}

export function validateSignupInput(input: SignupInput) {
  if (!input.fullName || !input.email || !input.password || !input.confirmPassword || !input.street || !input.contact || !input.gender) {
    return "Please fill in all required fields."
  }

  if (input.password !== input.confirmPassword) {
    return "Passwords do not match."
  }

  if (input.password.length < 8 || !/[A-Z]/.test(input.password) || !/\d/.test(input.password)) {
    return "Password must be at least 8 characters with one uppercase letter and one number."
  }

  return null
}

export async function loginUserData(input: { email: string; password: string; role?: UserRole }) {
  if (!input.email || !input.password) return null

  const roleFilter = input.role ? { role: toDbRole(input.role) } : {}
  const user = await prisma.user.findFirst({
    where: {
      email: input.email.trim().toLowerCase(),
      status: UserStatus.ACTIVE,
      isArchived: false,
      ...roleFilter,
    },
  })

  if (!user) return null
  if (!verifyPassword(input.password, user.password)) return null

  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    role: toClientRole(user.role),
  } satisfies AuthUser
}

export async function emailExists(email: string) {
  const existing = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true },
  })

  return Boolean(existing)
}

export async function createVerifiedUserData(input: SignupInput) {
  const role = toDbRole(input.role)
  const email = input.email.trim().toLowerCase()

  const user = await prisma.user.create({
    data: {
      fullName: input.fullName.trim(),
      email,
      password: hashPassword(input.password),
      contact: input.contact.trim(),
      street: input.street.trim(),
      gender: input.gender,
      role,
      status: UserStatus.ACTIVE,
    },
  })

  if (input.role === "bpat") {
    await prisma.officer.create({
      data: {
        userId: user.id,
        fullName: user.fullName,
        roleTitle: OfficerRoleTitle.BPAT_OFFICER,
      },
    })
  }

  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    role: toClientRole(user.role),
  } satisfies AuthUser
}

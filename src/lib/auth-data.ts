import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto"
import { Gender, OfficerRoleTitle, UserRole as DbUserRole, UserStatus } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { normalizeAddress, normalizeContact, normalizePersonName } from "@/lib/personal-info"
import type { AuthUser, UserRole } from "@/lib/auth"

export type SignupInput = {
  fullName: string
  email: string
  password: string
  role: UserRole
  street: string
  contact: string
  gender: Gender
  genderOther?: string
  dateOfBirth: string
  governmentIdImage: string
  governmentIdMimeType: string
  locationLatitude?: number | null
  locationLongitude?: number | null
  locationAccuracy?: number | null
  locationAddress?: string | null
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
  if (!input.fullName || !input.email || !input.password || !input.street || !input.contact || !input.gender) {
    return "Please fill in all required fields."
  }

  if (input.gender === Gender.OTHER && !input.genderOther?.trim()) {
    return "Please describe your gender."
  }

  const hasCoordinates = input.locationLatitude != null || input.locationLongitude != null
  const latitude = input.locationLatitude
  const longitude = input.locationLongitude
  if (hasCoordinates && (latitude == null || longitude == null
    || !Number.isFinite(latitude) || !Number.isFinite(longitude)
    || latitude < -90 || latitude > 90
    || longitude < -180 || longitude > 180)) {
    return "The optional location coordinates are invalid. You can remove them or enter your address manually."
  }
  if (input.locationAccuracy != null && (!Number.isFinite(input.locationAccuracy) || input.locationAccuracy < 0)) {
    return "The optional location accuracy is invalid. You can remove it or enter your address manually."
  }

  if (!isValidAdultDateOfBirth(input.dateOfBirth)) {
    return "You must be at least 18 years old to create an account."
  }

  if (!input.governmentIdImage || !["image/png", "image/jpeg"].includes(input.governmentIdMimeType)) {
    return "Upload a PNG or JPEG government ID to continue."
  }

  const idBytes = decodeGovernmentIdImage(input.governmentIdImage, input.governmentIdMimeType)
  if (!idBytes) return "The government ID image is invalid or exceeds the 4 MB limit."

  if (!isValidPassword(input.password)) {
    return "Password must be at least 8 characters with uppercase and lowercase letters, a number, and a symbol."
  }

  return null
}

export function isValidPassword(password: string) {
  return password.length >= 8
    && /[A-Z]/.test(password)
    && /[a-z]/.test(password)
    && /\d/.test(password)
    && /[^A-Za-z0-9]/.test(password)
}

export function isValidAdultDateOfBirth(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return false

  const today = new Date()
  let age = today.getFullYear() - year
  if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age--
  return age >= 18
}

export function decodeGovernmentIdImage(value: string, mimeType: string) {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value) || value.length > 5_592_408) return null
  const bytes = Buffer.from(value, "base64")
  if (bytes.length === 0 || bytes.length > 4 * 1024 * 1024) return null

  const isPng = mimeType === "image/png" && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  const isJpeg = mimeType === "image/jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  return isPng || isJpeg ? bytes : null
}

export async function loginUserData(input: { email: string; password: string; role?: UserRole }) {
  if (!input.email || !input.password) return null

  const roleFilter = input.role ? { role: toDbRole(input.role) } : {}
  const user = await prisma.user.findFirst({
    where: { email: input.email.trim().toLowerCase(), isArchived: false, ...roleFilter },
  })

  if (!user) return null
  if (!verifyPassword(input.password, user.password)) return null
  if (user.status === UserStatus.INACTIVE) return { accountStatus: "Pending" as const }
  if (user.status === UserStatus.SUSPENDED) return { accountStatus: "Suspended" as const }

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
      fullName: normalizePersonName(input.fullName),
      email,
      password: hashPassword(input.password),
      contact: normalizeContact(input.contact),
      street: normalizeAddress(input.street),
      locationLatitude: input.locationLatitude ?? null,
      locationLongitude: input.locationLongitude ?? null,
      locationAccuracy: input.locationAccuracy ?? null,
      locationAddress: input.locationAddress?.trim() || null,
      locationCapturedAt: input.locationLatitude != null ? new Date() : null,
      gender: input.gender,
      genderDetails: input.gender === Gender.OTHER ? input.genderOther?.trim() : null,
      identity: {
        create: {
          dateOfBirth: new Date(`${input.dateOfBirth}T00:00:00.000Z`),
          governmentIdImage: decodeGovernmentIdImage(input.governmentIdImage, input.governmentIdMimeType)!,
          governmentIdMimeType: input.governmentIdMimeType,
        },
      },
      role,
      status: UserStatus.INACTIVE,
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

  return { email: user.email, status: "Pending" as const }
}

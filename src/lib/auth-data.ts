import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto"
import { Gender, OfficerRoleTitle, UserRole as DbUserRole, UserStatus } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import {
  describeEastTapinacLocation,
  findEastTapinacStreet,
  getNearestEastTapinacStreet,
  parseGeoCoordinate,
  type GeoPoint,
} from "@/lib/east-tapinac-geo"
import type { AuthUser, UserRole } from "@/lib/auth"

export type SignupInput = {
  fullName?: string
  firstName?: string
  middleName?: string
  lastName?: string
  suffix?: string
  email: string
  password: string
  confirmPassword: string
  role: UserRole
  street?: string
  contact: string
  gender: Gender
  termsAccepted?: boolean
  privacyAccepted?: boolean
  locationLatitude?: number | string | null
  locationLongitude?: number | string | null
  locationAccuracy?: number | string | null
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

function cleanNamePart(value: string | null | undefined) {
  return value?.trim().replace(/\s+/g, " ") || null
}

export function buildFullName(input: {
  firstName?: string | null
  middleName?: string | null
  lastName?: string | null
  suffix?: string | null
  fullName?: string | null
}) {
  const nameParts = [
    cleanNamePart(input.firstName),
    cleanNamePart(input.middleName),
    cleanNamePart(input.lastName),
    cleanNamePart(input.suffix),
  ].filter(Boolean)

  return nameParts.join(" ") || cleanNamePart(input.fullName) || ""
}

export function validateSignupInput(input: SignupInput) {
  const latitude = parseGeoCoordinate(input.locationLatitude)
  const longitude = parseGeoCoordinate(input.locationLongitude)
  const fullName = buildFullName(input)

  if (!fullName || !cleanNamePart(input.firstName) || !cleanNamePart(input.lastName) || !input.email || !input.password || !input.confirmPassword || !input.contact || !input.gender) {
    return "Please fill in all required fields."
  }

  if (!input.privacyAccepted || !input.termsAccepted) {
    return "Please accept the Privacy Policy and Terms before creating an account."
  }

  if (latitude === null || longitude === null) {
    return "Please capture your location before creating an account."
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
  const firstName = cleanNamePart(input.firstName)
  const middleName = cleanNamePart(input.middleName)
  const lastName = cleanNamePart(input.lastName)
  const suffix = cleanNamePart(input.suffix)
  const fullName = buildFullName({ firstName, middleName, lastName, suffix, fullName: input.fullName })
  const latitude = parseGeoCoordinate(input.locationLatitude)
  const longitude = parseGeoCoordinate(input.locationLongitude)
  const accuracy = parseGeoCoordinate(input.locationAccuracy)
  const locationPoint = latitude !== null && longitude !== null
    ? ({ latitude, longitude, accuracy } satisfies GeoPoint)
    : null
  const nearestStreet = locationPoint ? getNearestEastTapinacStreet(locationPoint) : null
  const locationAddress = input.locationAddress?.trim() || describeEastTapinacLocation(nearestStreet)
  const addressStreet = findEastTapinacStreet(locationAddress)
  const inputStreet = findEastTapinacStreet(input.street)
  const resolvedStreet = addressStreet ?? inputStreet ?? nearestStreet

  const user = await prisma.user.create({
    data: {
      fullName,
      firstName,
      middleName,
      lastName,
      suffix,
      email,
      password: hashPassword(input.password),
      contact: input.contact.trim(),
      street: resolvedStreet?.name || input.street?.trim() || locationAddress,
      locationLatitude: latitude,
      locationLongitude: longitude,
      locationAccuracy: accuracy,
      locationAddress,
      locationCapturedAt: locationPoint ? new Date() : null,
      gender: input.gender,
      termsAcceptedAt: input.termsAccepted ? new Date() : null,
      privacyAcceptedAt: input.privacyAccepted ? new Date() : null,
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

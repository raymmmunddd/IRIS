import { getAuthUser } from "@/lib/auth"

export type UserProfile = {
  fullName: string
  email: string
  phone: string
  address: string
  bio: string
  photoUrl: string
}

export type ProfileSecurity = {
  passwordLastUpdated: string
  twoFactorEnabled: boolean
}

const PROFILE_STORAGE_KEY = "iris_user_profile"
const SECURITY_STORAGE_KEY = "iris_user_security"

function buildDefaultProfile(): UserProfile {
  const authUser = getAuthUser()
  return {
    fullName: "Admin User",
    email: authUser?.email ?? "admin@iris.local",
    phone: "+63 912 345 6789",
    address: "Barangay East Tapinac, Olongapo City",
    bio: "Supervises case workflows, public announcements, and operations oversight.",
    photoUrl: "",
  }
}

export function getUserProfile(): UserProfile {
  if (typeof window === "undefined") return buildDefaultProfile()

  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!raw) {
      const defaultProfile = buildDefaultProfile()
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(defaultProfile))
      return defaultProfile
    }

    const parsed = JSON.parse(raw) as UserProfile
    return {
      ...buildDefaultProfile(),
      ...parsed,
    }
  } catch {
    return buildDefaultProfile()
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
}

export function getProfileSecurity(): ProfileSecurity {
  if (typeof window === "undefined") {
    return { passwordLastUpdated: "Never", twoFactorEnabled: false }
  }

  try {
    const raw = localStorage.getItem(SECURITY_STORAGE_KEY)
    if (!raw) {
      const defaults: ProfileSecurity = { passwordLastUpdated: "Never", twoFactorEnabled: false }
      localStorage.setItem(SECURITY_STORAGE_KEY, JSON.stringify(defaults))
      return defaults
    }

    const parsed = JSON.parse(raw) as Partial<ProfileSecurity>
    return {
      passwordLastUpdated: parsed.passwordLastUpdated ?? "Never",
      twoFactorEnabled: parsed.twoFactorEnabled ?? false,
    }
  } catch {
    return { passwordLastUpdated: "Never", twoFactorEnabled: false }
  }
}

export function updatePasswordTimestamp(): void {
  if (typeof window === "undefined") return
  const existing = getProfileSecurity()
  const payload: ProfileSecurity = {
    passwordLastUpdated: new Date().toISOString(),
    twoFactorEnabled: existing.twoFactorEnabled,
  }
  localStorage.setItem(SECURITY_STORAGE_KEY, JSON.stringify(payload))
}

export function updateTwoFactorEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return

  const existing = getProfileSecurity()
  const payload: ProfileSecurity = {
    passwordLastUpdated: existing.passwordLastUpdated,
    twoFactorEnabled: enabled,
  }

  localStorage.setItem(SECURITY_STORAGE_KEY, JSON.stringify(payload))
}

import { prisma } from "@/lib/prisma"
import { hashPassword, verifyPassword } from "@/lib/auth-data"

type ActivityCategory = "profile" | "security" | "cases" | "system"
type ActivityStatus = "Verified" | "Info"

function formatActivityTime(timestamp: Date | string) {
  const date = new Date(timestamp)
  const now = new Date()

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()

  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })

  if (isToday) return `Today, ${time}`
  if (isYesterday) return `Yesterday, ${time}`

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  })
}

export async function createUserActivityData(input: {
  email: string
  label: string
  detail: string
  category?: ActivityCategory
  status?: ActivityStatus
}) {
  const user = await findUserByEmail(input.email)
  if (!user) return null

  return prisma.userActivity.create({
    data: {
      userId: user.id,
      label: input.label,
      detail: input.detail,
      category: input.category ?? "system",
      status: input.status ?? "Verified",
    },
  })
}

export async function getAdminProfileData(email: string) {
  const user = await findUserByEmail(email)
  if (!user) return null

  return {
    fullName: user.fullName,
    email: user.email,
    phone: user.contact ?? "",
    address: user.street ?? "",
    bio: user.bio ?? "",
    photoUrl: user.photoUrl ?? "",
  }
}

export async function updateAdminProfileData(
  email: string,
  input: { fullName?: string; phone?: string; address?: string; bio?: string; photoUrl?: string; email?: string }
) {
  const user = await findUserByEmail(email)
  if (!user) return null

  const nextEmail = input.email?.trim().toLowerCase() || user.email

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      fullName: input.fullName,
      contact: input.phone,
      street: input.address,
      bio: input.bio,
      photoUrl: input.photoUrl,
      email: nextEmail,
    },
  })

  if (input.fullName && input.fullName !== user.fullName) {
    await createUserActivityData({
      email: nextEmail,
      label: "Profile name updated",
      detail: `Display name changed to ${input.fullName}.`,
      category: "profile",
    })
  }

  if (
    (input.phone !== undefined && input.phone !== (user.contact ?? "")) ||
    (input.address !== undefined && input.address !== (user.street ?? "")) ||
    (input.bio !== undefined && input.bio !== (user.bio ?? ""))
  ) {
    await createUserActivityData({
      email: nextEmail,
      label: "Account details updated",
      detail: "Phone number, address, or bio information was updated.",
      category: "profile",
    })
  }

  if (input.photoUrl && input.photoUrl !== user.photoUrl) {
    await createUserActivityData({
      email: nextEmail,
      label: "Profile picture updated",
      detail: "Profile photo was uploaded and cropped.",
      category: "profile",
    })
  }

  if (nextEmail !== user.email) {
    await createUserActivityData({
      email: nextEmail,
      label: "Email changed",
      detail: `Primary email changed to ${nextEmail}.`,
      category: "security",
    })
  }

  return {
    fullName: updated.fullName,
    email: updated.email,
    phone: updated.contact ?? "",
    address: updated.street ?? "",
    bio: updated.bio ?? "",
    photoUrl: updated.photoUrl ?? "",
  }
}

export async function getAdminSecurityData(email: string) {
  const user = await findUserByEmail(email)
  if (!user) return null

  return {
    passwordLastUpdated: user.passwordLastUpdated?.toISOString() ?? "Never",
    twoFactorEnabled: user.twoFactorEnabled,
  }
}

export async function updateAdminPasswordData(email: string, input: { currentPassword: string; newPassword: string }) {
  const user = await findUserByEmail(email)
  if (!user || !user.password) return { ok: false as const, message: "Account not found." }

  if (!verifyPassword(input.currentPassword, user.password)) {
    return { ok: false as const, message: "Current password is incorrect." }
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashPassword(input.newPassword),
      passwordLastUpdated: new Date(),
    },
  })

  await createUserActivityData({
    email: updated.email,
    label: "Password changed",
    detail: "Your account password was updated successfully.",
    category: "security",
  })

  return {
    ok: true as const,
    data: {
      passwordLastUpdated: updated.passwordLastUpdated?.toISOString() ?? "Never",
      twoFactorEnabled: updated.twoFactorEnabled,
    },
  }
}

export async function updateAdminTwoFactorData(email: string, enabled: boolean) {
  const user = await findUserByEmail(email)
  if (!user) return null

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: enabled },
  })

  await createUserActivityData({
    email: updated.email,
    label: enabled ? "Two-factor enabled" : "Two-factor disabled",
    detail: enabled
      ? "Two-factor authentication was configured for your account."
      : "Two-factor authentication was turned off.",
    category: "security",
    status: enabled ? "Verified" : "Info",
  })

  return {
    passwordLastUpdated: updated.passwordLastUpdated?.toISOString() ?? "Never",
    twoFactorEnabled: updated.twoFactorEnabled,
  }
}

export async function getAdminActivityData(email: string) {
  const user = await findUserByEmail(email)
  if (!user) return []

  const items = await prisma.userActivity.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return items.map((item) => ({
    id: item.id,
    label: item.label,
    detail: item.detail,
    category: item.category as ActivityCategory,
    status: item.status as ActivityStatus,
    timestamp: item.createdAt.toISOString(),
    timeLabel: formatActivityTime(item.createdAt),
  }))
}

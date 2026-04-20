export type ActivityCategory = "profile" | "security" | "cases" | "system"

export type ActivityLogItem = {
  id: string
  label: string
  detail: string
  category: ActivityCategory
  status: "Verified" | "Info"
  timestamp: string
}

type CreateActivityLogInput = {
  label: string
  detail: string
  category?: ActivityCategory
  status?: "Verified" | "Info"
  timestamp?: string
}

const ACTIVITY_LOGS_STORAGE_KEY = "iris_profile_activity_logs"
const MAX_LOG_ITEMS = 100

function buildDefaultLogs(): ActivityLogItem[] {
  const now = new Date()

  return [
    {
      id: `${now.getTime()}-1`,
      label: "Two-factor disabled",
      detail: "Two-factor authentication was turned off.",
      category: "security",
      status: "Info",
      timestamp: new Date(now.getTime() - 3 * 60 * 1000).toISOString(),
    },
    {
      id: `${now.getTime()}-2`,
      label: "Two-factor enabled",
      detail: "Two-factor authentication was configured for your account.",
      category: "security",
      status: "Verified",
      timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: `${now.getTime()}-3`,
      label: "Profile picture updated",
      detail: "Profile photo was uploaded and cropped.",
      category: "profile",
      status: "Verified",
      timestamp: new Date(now.getTime() - 7 * 60 * 1000).toISOString(),
    },
    {
      id: `${now.getTime()}-4`,
      label: "Admin login",
      detail: "Signed in with roselynong0@gmail.com (official).",
      category: "security",
      status: "Verified",
      timestamp: new Date(now.getTime() - 12 * 60 * 1000).toISOString(),
    },
    {
      id: `${now.getTime()}-5`,
      label: "Session ended",
      detail: "You signed out from the current browser session.",
      category: "security",
      status: "Info",
      timestamp: new Date(now.getTime() - 22 * 60 * 1000).toISOString(),
    },
    {
      id: `${now.getTime()}-6`,
      label: "Admin login",
      detail: "Signed in from trusted desktop device.",
      category: "security",
      status: "Verified",
      timestamp: new Date(now.getTime() - 70 * 60 * 1000).toISOString(),
    },
    {
      id: `${now.getTime()}-7`,
      label: "Password changed",
      detail: "Your account password was updated successfully.",
      category: "security",
      status: "Verified",
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: `${now.getTime()}-8`,
      label: "Profile name updated",
      detail: "You changed your display name.",
      category: "profile",
      status: "Verified",
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
    },
  ]
}

export function getActivityLogs(): ActivityLogItem[] {
  if (typeof window === "undefined") return buildDefaultLogs()

  try {
    const raw = localStorage.getItem(ACTIVITY_LOGS_STORAGE_KEY)

    if (!raw) {
      const defaults = buildDefaultLogs()
      localStorage.setItem(ACTIVITY_LOGS_STORAGE_KEY, JSON.stringify(defaults))
      return defaults
    }

    const parsed = JSON.parse(raw) as ActivityLogItem[]
    if (!Array.isArray(parsed)) {
      const defaults = buildDefaultLogs()
      localStorage.setItem(ACTIVITY_LOGS_STORAGE_KEY, JSON.stringify(defaults))
      return defaults
    }

    return parsed
  } catch {
    return buildDefaultLogs()
  }
}

export function saveActivityLogs(logs: ActivityLogItem[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(ACTIVITY_LOGS_STORAGE_KEY, JSON.stringify(logs.slice(0, MAX_LOG_ITEMS)))
}

export function addActivityLog(input: CreateActivityLogInput): ActivityLogItem {
  const entry: ActivityLogItem = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    label: input.label,
    detail: input.detail,
    category: input.category ?? "system",
    status: input.status ?? "Verified",
    timestamp: input.timestamp ?? new Date().toISOString(),
  }

  const existing = getActivityLogs()
  saveActivityLogs([entry, ...existing])
  return entry
}

export function formatActivityTime(timestamp: string): string {
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

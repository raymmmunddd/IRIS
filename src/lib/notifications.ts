export type NotificationItem = {
  id: number
  title: string
  message: string
  time: string
  date?: string
  read: boolean
  category: "case" | "system" | "report"
}

const STORAGE_KEY = "iris_notifications"

const defaultNotifications: NotificationItem[] = [
  {
    id: 101,
    title: "New Case Escalated",
    message: "Case #C-2045 has been escalated for admin review.",
    time: "5m ago",
    date: "Apr 07, 2026",
    read: false,
    category: "case",
  },
  {
    id: 102,
    title: "Officer Assignment Updated",
    message: "Officer Dela Cruz was assigned to a mediation request.",
    time: "22m ago",
    date: "Apr 07, 2026",
    read: false,
    category: "case",
  },
  {
    id: 103,
    title: "Daily Report Ready",
    message: "The daily incident summary is now available.",
    time: "1h ago",
    date: "Apr 07, 2026",
    read: false,
    category: "report",
  },
  {
    id: 104,
    title: "System Maintenance Reminder",
    message: "Scheduled maintenance starts at 11:00 PM.",
    time: "Yesterday",
    date: "Apr 06, 2026",
    read: true,
    category: "system",
  },
  {
    id: 105,
    title: "Data Export Completed",
    message: "Public data export finished successfully.",
    time: "2 days ago",
    date: "Apr 05, 2026",
    read: true,
    category: "report",
  },
]

export function getNotifications(): NotificationItem[] {
  if (typeof window === "undefined") return defaultNotifications

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultNotifications))
      return defaultNotifications
    }

    const parsed = JSON.parse(raw) as NotificationItem[]
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultNotifications))
      return defaultNotifications
    }

    return parsed
  } catch {
    return defaultNotifications
  }
}

export function saveNotifications(notifications: NotificationItem[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
}

export function markNotificationAsRead(id: number): NotificationItem[] {
  const updated = getNotifications().map((item) =>
    item.id === id ? { ...item, read: true } : item,
  )
  saveNotifications(updated)
  return updated
}

export function markAllNotificationsAsRead(): NotificationItem[] {
  const updated = getNotifications().map((item) => ({ ...item, read: true }))
  saveNotifications(updated)
  return updated
}

export function getRecentNotifications(limit = 3): NotificationItem[] {
  return getNotifications().slice(0, limit)
}

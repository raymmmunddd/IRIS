import {
  AuditAction,
  CaseCategory as DbCaseCategory,
  CasePriority as DbCasePriority,
  CaseStatus as DbCaseStatus,
  NotificationType,
  Prisma,
  UserRole,
} from "@/generated/prisma/client"
import { analyzeResidentReport } from "@/lib/ai-case-analysis"
import { getAdminSettingsData } from "@/lib/admin-settings-data"
import { writeAuditLog } from "@/lib/audit-logs"
import { prisma } from "@/lib/prisma"
import {
  describeEastTapinacLocation,
  findEastTapinacStreet,
  getNearestEastTapinacStreet,
  parseGeoCoordinate,
  type GeoPoint,
} from "@/lib/east-tapinac-geo"
import type { CaseCategory } from "@/lib/types"

const categoryLabels: Record<DbCaseCategory, CaseCategory> = {
  DISPUTE: "Community Dispute",
  INJURY: "Violence or Threats",
  VAWC: "Harassment & Abuse",
  ORDINANCE_VIOLATION: "Public Disturbance",
  OTHER: "Community Dispute",
}

const categoryFromLabel: Partial<Record<CaseCategory, DbCaseCategory>> = {
  "Violence or Threats": DbCaseCategory.INJURY,
  "Harassment & Abuse": DbCaseCategory.VAWC,
  "Fraud & Scams": DbCaseCategory.OTHER,
  "Public Disturbance": DbCaseCategory.ORDINANCE_VIOLATION,
  "Property & Theft": DbCaseCategory.OTHER,
  "Community Dispute": DbCaseCategory.DISPUTE,
  "Child & Vulnerable Protection": DbCaseCategory.VAWC,
}

const statusLabels: Record<DbCaseStatus, string> = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  ACCEPTED: "Under Review",
  REJECTED: "Closed",
  REFERRED: "Closed",
  ASSIGNED: "In Progress",
  SCHEDULED: "Scheduled",
  ONGOING: "In Progress",
  RESOLVED: "Resolved",
  UNRESOLVED: "Closed",
  DISMISSED: "Dismissed",
  ARCHIVED: "Closed",
}

const priorityFromCategory: Record<CaseCategory, DbCasePriority> = {
  "Violence or Threats": DbCasePriority.HIGH,
  "Harassment & Abuse": DbCasePriority.HIGH,
  "Fraud & Scams": DbCasePriority.MEDIUM,
  "Public Disturbance": DbCasePriority.LOW,
  "Property & Theft": DbCasePriority.MEDIUM,
  "Community Dispute": DbCasePriority.LOW,
  "Child & Vulnerable Protection": DbCasePriority.HIGH,
}

const notificationCategory: Record<NotificationType, "case" | "system" | "report"> = {
  CASE_UPDATE: "case",
  HEARING_SCHEDULED: "case",
  SETTLEMENT: "case",
  ANNOUNCEMENT: "report",
  SYSTEM: "system",
}

const caseInclude = {
  complainant: true,
  assignedOfficer: true,
  hearings: { orderBy: { scheduledDate: "desc" as const }, take: 1 },
} satisfies Prisma.CaseInclude

type ResidentCaseWithRelations = Prisma.CaseGetPayload<{ include: typeof caseInclude }>

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "Not set"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

function formatDateTime(date: Date | string | null | undefined) {
  if (!date) return "Not set"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date))
}

function relativeTime(date: Date | string | null | undefined) {
  if (!date) return "Not set"
  const diffMs = Date.now() - new Date(date).getTime()
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))
  if (diffMinutes < 1) return "Just now"
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 14) return `${diffDays} days ago`
  return formatDate(date)
}

function caseNumber(id: string, date: Date) {
  return `IRIS-${date.getFullYear()}-${id.slice(0, 8).toUpperCase()}`
}

function notificationTitle(type: NotificationType) {
  return type.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
}

function mapResidentCase(item: ResidentCaseWithRelations) {
  const status = statusLabels[item.status]
  const latestHearing = item.hearings[0]
  const detail = latestHearing
    ? `Hearing ${latestHearing.status.toLowerCase()} at ${latestHearing.location}`
    : item.assignedOfficer
      ? `Assigned to ${item.assignedOfficer.fullName}`
      : status === "Pending"
        ? "Submitted for barangay review"
        : item.details

  return {
    id: caseNumber(item.id, item.dateSubmitted),
    dbId: item.id,
    title: item.type,
    category: categoryLabels[item.category],
    status,
    lastUpdate: relativeTime(item.updatedAt),
    submittedOn: formatDate(item.dateSubmitted),
    detail,
    assignedOfficer: item.assignedOfficer?.fullName ?? null,
    canChat: Boolean(item.assignedOfficerId),
  }
}

async function findResidentByEmail(email: string) {
  return prisma.user.findFirst({
    where: { email, role: UserRole.RESIDENT, isArchived: false },
  })
}

function parseIncidentDate(value: string) {
  const incidentDate = new Date(`${value}T00:00:00`)
  if (Number.isNaN(incidentDate.getTime())) {
    throw new Error("Invalid incident date")
  }

  const today = new Date()
  today.setHours(23, 59, 59, 999)
  if (incidentDate > today) {
    throw new Error("Incident date cannot be in the future")
  }

  return incidentDate
}

export async function getResidentCasesData(email: string) {
  const resident = await findResidentByEmail(email)
  if (!resident) return []

  const cases = await prisma.case.findMany({
    where: { complainantId: resident.id, isArchived: false },
    include: caseInclude,
    orderBy: { dateSubmitted: "desc" },
  })

  return cases.map(mapResidentCase)
}

export async function getResidentDashboardData(email: string) {
  const [cases, notifications] = await Promise.all([
    getResidentCasesData(email),
    getResidentNotificationsData(email, 3),
  ])

  return {
    recentUpdates: cases.slice(0, 3).map((item) => ({
      title: `${item.title} #${item.id}`,
      detail: item.detail,
      status: item.status,
      when: item.lastUpdate,
    })),
    notifications,
  }
}

export async function createResidentCaseData(input: {
  fullName: string
  category: CaseCategory
  incidentDate: string
  contact: string
  email: string
  street?: string
  incidentLatitude?: number | string | null
  incidentLongitude?: number | string | null
  incidentAccuracy?: number | string | null
  incidentLocation?: string | null
  details: string
}) {
  const email = input.email.trim().toLowerCase()
  const latitude = parseGeoCoordinate(input.incidentLatitude)
  const longitude = parseGeoCoordinate(input.incidentLongitude)
  const accuracy = parseGeoCoordinate(input.incidentAccuracy)
  const incidentPoint = latitude !== null && longitude !== null
    ? ({ latitude, longitude, accuracy } satisfies GeoPoint)
    : null
  const nearestStreet = incidentPoint ? getNearestEastTapinacStreet(incidentPoint) : null
  const incidentLocation = input.incidentLocation?.trim() || describeEastTapinacLocation(nearestStreet)
  const addressStreet = findEastTapinacStreet(incidentLocation)
  const inputStreet = findEastTapinacStreet(input.street)
  const resolvedStreet = addressStreet ?? inputStreet ?? nearestStreet
  const incidentStreet = resolvedStreet?.name || input.street?.trim() || ""
  const incidentDate = parseIncidentDate(input.incidentDate)

  if (!input.contact || !email || !incidentStreet || !input.details) {
    throw new Error("Missing required report details")
  }

  const settings = await getAdminSettingsData()
  const analysis = await analyzeResidentReport({
    selectedCategory: input.category,
    details: input.details,
    contact: input.contact,
    incidentLocation,
  }, settings.aiConfig)
  const minimumConfidence = Number(settings.aiConfig.autoConfidence) || 85
  const finalCategory = analysis.confidence >= minimumConfidence ? analysis.category : input.category

  const resident = await prisma.user.upsert({
    where: { email },
    update: {
      contact: input.contact,
      street: incidentStreet,
      locationLatitude: latitude,
      locationLongitude: longitude,
      locationAccuracy: accuracy,
      locationAddress: incidentLocation,
      locationCapturedAt: incidentPoint ? new Date() : undefined,
      role: UserRole.RESIDENT,
    },
    create: {
      fullName: input.fullName || email,
      email,
      contact: input.contact,
      street: incidentStreet,
      locationLatitude: latitude,
      locationLongitude: longitude,
      locationAccuracy: accuracy,
      locationAddress: incidentLocation,
      locationCapturedAt: incidentPoint ? new Date() : undefined,
      role: UserRole.RESIDENT,
    },
  })

  const created = await prisma.case.create({
    data: {
      complainantId: resident.id,
      category: categoryFromLabel[finalCategory] ?? DbCaseCategory.OTHER,
      type: `${finalCategory} Report`,
      details: input.details,
      priority: analysis.dbPriority ?? priorityFromCategory[finalCategory] ?? DbCasePriority.MEDIUM,
      status: DbCaseStatus.PENDING,
      incidentStreet,
      incidentPurok: resolvedStreet?.purok,
      incidentLatitude: latitude,
      incidentLongitude: longitude,
      incidentAccuracy: accuracy,
      incidentLocation,
      incidentDate,
    },
    include: caseInclude,
  })

  await prisma.notification.create({
    data: {
      userId: resident.id,
      type: NotificationType.CASE_UPDATE,
      message: `${caseNumber(created.id, created.dateSubmitted)} was submitted for barangay review.`,
    },
  })

  try {
    await writeAuditLog({
      actorId: resident.id,
      action: AuditAction.CREATE,
      target: { table: "cases", id: created.id },
      changes: {
        caseNumber: caseNumber(created.id, created.dateSubmitted),
        category: created.category,
        priority: created.priority,
        status: created.status,
        submittedBy: resident.email,
      },
    })
  } catch (error) {
    console.error("Failed to write resident report audit log:", error)
  }

  return mapResidentCase(created)
}

export async function getResidentAnnouncementsData() {
  const announcements = await prisma.announcement.findMany({
    include: { author: true },
    orderBy: { publishedAt: "desc" },
  })

  return announcements.map((item, index) => ({
    id: item.id,
    title: item.title,
    content: item.content,
    date: formatDate(item.publishedAt),
    tag: "General",
    author: item.author.fullName,
    pinned: index === 0,
  }))
}

export async function getResidentNotificationsData(email: string, limit?: number) {
  const resident = await findResidentByEmail(email)
  if (!resident) return []

  const notifications = await prisma.notification.findMany({
    where: { userId: resident.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return notifications.map((item) => ({
    id: item.id,
    title: notificationTitle(item.type),
    message: item.message,
    time: relativeTime(item.createdAt),
    date: formatDateTime(item.createdAt),
    read: item.isRead,
    category: notificationCategory[item.type],
  }))
}

export async function markResidentNotificationReadData(email: string, id: string) {
  const resident = await findResidentByEmail(email)
  if (!resident) return null

  return prisma.notification.updateMany({
    where: { id, userId: resident.id },
    data: { isRead: true },
  })
}

export async function markResidentNotificationsReadData(email: string) {
  const resident = await findResidentByEmail(email)
  if (!resident) return { count: 0 }

  return prisma.notification.updateMany({
    where: { userId: resident.id },
    data: { isRead: true },
  })
}

export async function getResidentProfileData(email: string) {
  const resident = await findResidentByEmail(email)
  if (!resident) {
    return {
      fullName: "",
      email,
      phone: "",
      street: "",
      photoUrl: "",
    }
  }

  return {
    fullName: resident.fullName,
    email: resident.email,
    phone: resident.contact ?? "",
    street: resident.street ?? "",
    photoUrl: "",
  }
}

export async function updateResidentProfileData(
  email: string,
  input: { fullName?: string; phone?: string; street?: string }
) {
  const resident = await findResidentByEmail(email)
  if (!resident) return null

  return prisma.user.update({
    where: { id: resident.id },
    data: {
      fullName: input.fullName,
      contact: input.phone,
      street: input.street,
    },
  })
}

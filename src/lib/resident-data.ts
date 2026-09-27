import {
  CasePriority as DbCasePriority,
  CaseStatus as DbCaseProcessStatus,
  HearingStatus,
  NotificationType,
  Prisma,
  UserRole,
} from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { normalizeAddress, normalizeContact, normalizePersonName } from "@/lib/personal-info"
import { createCase } from "@/lib/case-process"
import { todayInManila, toDateOnlyString } from "@/lib/business-days"
import { recalculateDayTracking } from "@/lib/case-process"

const processStatusLabels: Record<DbCaseProcessStatus, "Scheduled" | "In Progress" | "Resolved" | "Closed" | "Dismissed"> = {
  SCHEDULED: "Scheduled",
  MEDIATION: "In Progress",
  CONCILIATION: "In Progress",
  ARBITRATION: "In Progress",
  RESOLVED: "Resolved",
  REPUDIATION: "In Progress",
  DISMISSED: "Dismissed",
  WITHDRAWN: "Closed",
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

function notificationTitle(type: NotificationType) {
  return type.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
}

function mapResidentCase(item: ResidentCaseWithRelations) {
  const status = item.currentStatus === DbCaseProcessStatus.RESOLVED && item.closedDate
    ? "Closed"
    : processStatusLabels[item.currentStatus]
  const dayTracking = recalculateDayTracking(item)
  const latestHearing = item.hearings[0]
  const detail = latestHearing
    ? `Hearing ${latestHearing.status.toLowerCase()} at ${latestHearing.location}`
    : item.assignedOfficer
      ? `Assigned to ${item.assignedOfficer.fullName}`
      : status === "Scheduled"
        ? "Submitted for barangay review"
        : item.details

  return {
    id: item.caseNumber,
    dbId: item.id,
    title: item.type,
    category: item.category,
    status,
    currentStatus: item.currentStatus,
    statusEnteredDate: toDateOnlyString(item.statusEnteredDate),
    statusDaysAllotted: item.statusDaysAllotted,
    ...dayTracking,
    mediationAttemptCount: item.mediationAttemptCount,
    conciliationAttemptCount: item.conciliationAttemptCount,
    absenceCount: item.absenceCount,
    respondentName: item.respondentName,
    respondentAddress: item.respondentAddress,
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

async function getResidentCasesForUser(residentId: string) {
  const cases = await prisma.case.findMany({
    where: { complainantId: residentId, isArchived: false },
    include: caseInclude,
    orderBy: { dateSubmitted: "desc" },
  })

  return cases.map(mapResidentCase)
}

export async function getResidentCasesData(email: string) {
  const resident = await findResidentByEmail(email)
  return resident ? getResidentCasesForUser(resident.id) : []
}

export async function getResidentDashboardData(email: string) {
  const resident = await findResidentByEmail(email)
  if (!resident) return { recentUpdates: [], notifications: [], scheduledCases: [] }

  const [cases, notifications, scheduledCases] = await Promise.all([
    getResidentCasesForUser(resident.id),
    getResidentNotificationsForUser(resident.id, 3),
    getResidentScheduledCasesForUser(resident.id),
  ])

  return {
    recentUpdates: cases.slice(0, 3).map((item) => ({
      title: `${item.title} #${item.id}`,
      detail: item.detail,
      status: item.status,
      when: item.lastUpdate,
    })),
    notifications,
    scheduledCases,
  }
}

async function getResidentScheduledCasesForUser(residentId: string) {
  const startOfToday = todayInManila()

  const hearings = await prisma.hearing.findMany({
    where: {
      status: HearingStatus.SCHEDULED,
      scheduledDate: { gte: startOfToday },
      case: { complainantId: residentId, isArchived: false },
    },
    select: {
      id: true,
      scheduledDate: true,
      scheduledTime: true,
      location: true,
      case: { select: { id: true, caseNumber: true, dateSubmitted: true, type: true } },
    },
    orderBy: [{ scheduledDate: "asc" }, { scheduledTime: "asc" }],
    take: 100,
  })

  return hearings.map((hearing) => ({
    id: hearing.id,
    caseId: hearing.case.caseNumber,
    title: hearing.case.type,
    date: hearing.scheduledDate.toISOString().slice(0, 10),
    time: hearing.scheduledTime,
    location: hearing.location,
  }))
}

export async function createResidentCaseData(input: {
  fullName: string
  respondentName: string
  respondentAddress: string
  category: string
  type: string
  incidentDate: string
  contact: string
  email: string
  street: string
  incidentLocation?: string
  incidentLatitude?: number | null
  incidentLongitude?: number | null
  incidentAccuracy?: number | null
  details: string
  evidenceFiles?: Array<{ fileName: string; fileType: string; fileData: Uint8Array<ArrayBuffer> }>
}) {
  const email = input.email.trim().toLowerCase()
  const fullName = normalizePersonName(input.fullName)
  const respondentName = normalizePersonName(input.respondentName)
  const respondentAddress = normalizeAddress(input.respondentAddress)
  const contact = normalizeContact(input.contact)
  const street = normalizeAddress(input.street)
  if (!fullName || !respondentName || !respondentAddress || !contact || !email || !street || !input.incidentDate || !input.type.trim() || !input.details) {
    throw new Error("Missing required report details")
  }
  if (input.type.trim().length > 100) throw new Error("Report type must be 100 characters or fewer")

  const hasLatitude = input.incidentLatitude != null
  const hasLongitude = input.incidentLongitude != null
  const latitude = input.incidentLatitude
  const longitude = input.incidentLongitude
  if (hasLatitude !== hasLongitude
    || (hasLatitude && (latitude == null || !Number.isFinite(latitude) || latitude < -90 || latitude > 90))
    || (hasLongitude && (longitude == null || !Number.isFinite(longitude) || longitude < -180 || longitude > 180))
    || (input.incidentAccuracy != null && (!Number.isFinite(input.incidentAccuracy) || input.incidentAccuracy < 0))) {
    throw new Error("Incident coordinates are invalid")
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.incidentDate)) throw new Error("Incident date is invalid")
  const incidentDate = new Date(`${input.incidentDate}T00:00:00.000Z`)
  if (!Number.isFinite(incidentDate.getTime()) || incidentDate.toISOString().slice(0, 10) !== input.incidentDate) {
    throw new Error("Incident date is invalid")
  }
  const today = toDateOnlyString(todayInManila())
  if (input.incidentDate > today) throw new Error("Incident date cannot be in the future")

  const resident = await prisma.user.upsert({
    where: { email },
    update: {
      contact,
      role: UserRole.RESIDENT,
    },
    create: {
      fullName,
      email,
      contact,
      street,
      role: UserRole.RESIDENT,
    },
  })

  const created = await createCase({
    complainantId: resident.id,
    complainantName: fullName,
    respondentName,
    respondentAddress,
    category: input.category,
    type: input.type.trim(),
    details: input.details,
    filingDate: todayInManila(),
    incidentDate,
    incidentAddress: input.incidentLocation?.trim() || street,
    incidentStreet: street,
    incidentLatitude: input.incidentLatitude ?? null,
    incidentLongitude: input.incidentLongitude ?? null,
    incidentAccuracy: input.incidentAccuracy ?? null,
    priority: DbCasePriority.MEDIUM,
    evidenceFiles: input.evidenceFiles,
  })
  const createdWithRelations = await prisma.case.findUniqueOrThrow({
    where: { id: created.id },
    include: caseInclude,
  })

  await prisma.notification.create({
    data: {
      userId: resident.id,
      type: NotificationType.CASE_UPDATE,
      message: `${created.caseNumber} was submitted for barangay review.`,
    },
  })

  return mapResidentCase(createdWithRelations)
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

async function getResidentNotificationsForUser(residentId: string, limit?: number) {
  const notifications = await prisma.notification.findMany({
    where: { userId: residentId },
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

export async function getResidentNotificationsData(email: string, limit?: number) {
  const resident = await findResidentByEmail(email)
  return resident ? getResidentNotificationsForUser(resident.id, limit) : []
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
  input: { phone?: string; street?: string }
) {
  const contact = input.phone === undefined ? undefined : normalizeContact(input.phone)
  const street = input.street === undefined ? undefined : normalizeAddress(input.street)
  const resident = await findResidentByEmail(email)
  if (!resident) return null

  return prisma.user.update({
    where: { id: resident.id },
    data: {
      contact,
      street,
    },
  })
}

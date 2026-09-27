import {
  AuditAction,
  CasePriority as DbCasePriority,
  CaseReviewStatus as DbCaseStatus,
  CaseStatus as DbCaseProcessStatus,
  HearingStage,
  HearingStatus,
  NotificationType,
  OfficerRoleTitle,
  Prisma,
  UserRole,
  UserStatus,
} from "@/generated/prisma/client"
import { revalidateTag, unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import type { CasePriority, CaseProcessStatus, CaseRecord, CaseStatus, EvidenceFile } from "@/lib/types"
import { recalculateDayTracking, transitionStatus } from "@/lib/case-process"
import { toDateOnlyString } from "@/lib/business-days"

const priorityLabels: Record<DbCasePriority, CasePriority> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
}

const statusLabels: Record<DbCaseStatus, CaseStatus> = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  ACCEPTED: "Under Review",
  REJECTED: "Closed",
  REFERRED: "Closed",
  ASSIGNED: "Under Review",
  SCHEDULED: "Mediation",
  ONGOING: "Mediation",
  RESOLVED: "Resolved",
  UNRESOLVED: "Closed",
  DISMISSED: "Closed",
  ARCHIVED: "Closed",
}

const statusFromLabel: Record<CaseStatus, DbCaseStatus> = {
  Pending: DbCaseStatus.PENDING,
  "Under Review": DbCaseStatus.UNDER_REVIEW,
  Mediation: DbCaseStatus.SCHEDULED,
  Resolved: DbCaseStatus.RESOLVED,
  Closed: DbCaseStatus.UNRESOLVED,
  Dismissed: DbCaseStatus.DISMISSED,
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const caseInclude = {
  complainant: true,
  respondent: true,
  assignedOfficer: true,
  evidence: {
    select: {
      id: true,
      fileUrl: true,
      fileType: true,
      fileName: true,
      uploadedAt: true,
    },
  },
  statusHistory: { include: { user: true }, orderBy: { changedAt: "asc" as const } },
  processHistory: { orderBy: { changedAt: "asc" as const } },
  hearings: { include: { officer: true }, orderBy: { scheduledDate: "asc" as const } },
  settlement: true,
  auditLogs: { orderBy: { loggedAt: "asc" as const } },
} satisfies Prisma.CaseInclude

type CaseWithRelations = Prisma.CaseGetPayload<{ include: typeof caseInclude }>

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "Not set"
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(date))
}

function formatDateTime(date: Date | string | null | undefined) {
  if (!date) return "Not set"
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date))
}

function shortName(fullName: string) {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length <= 1) return fullName || "Resident"
  return `${parts[0][0]}. ${parts.at(-1)}`
}

function evidenceType(fileType: string): EvidenceFile["type"] {
  return fileType.toLowerCase().includes("image") ? "image" : "document"
}

export function mapCaseRecord(item: CaseWithRelations): CaseRecord {
  const complainant = item.complainant
  const assignedOfficer = item.assignedOfficer?.fullName ?? "Unassigned"
  const dateSubmitted = formatDate(item.dateSubmitted)
  const auditChanges = (changes: Prisma.JsonValue): Record<string, unknown> =>
    changes && typeof changes === "object" && !Array.isArray(changes)
      ? changes as Record<string, unknown>
      : {}
  const assignmentHistory = item.auditLogs.flatMap((log) => {
    if (log.action !== AuditAction.ASSIGN) return []
    const changes = auditChanges(log.changes)
    if (typeof changes.assignedOfficer !== "string") return []
    return [{
      officer: changes.assignedOfficer,
      assignedAt: log.loggedAt.toISOString(),
      assignedBy: log.actorId,
    }]
  })
  const processHistory = item.processHistory.map((history) => ({
    id: history.id,
    event: history.event,
    fromStatus: history.fromStatus as CaseProcessStatus,
    toStatus: history.toStatus as CaseProcessStatus,
    changedAt: history.changedAt.toISOString(),
    businessDaysSpent: history.businessDaysSpent,
    details: history.details,
  }))
  const dayTracking = recalculateDayTracking(item)

  return {
    id: item.id,
    caseNumber: item.caseNumber,
    fullName: complainant.fullName,
    shortName: shortName(complainant.fullName),
    category: item.category,
    type: item.type,
    priority: priorityLabels[item.priority],
    status: statusLabels[item.status],
    currentStatus: item.currentStatus as CaseProcessStatus,
    previousStatus: item.previousStatus as CaseProcessStatus | null,
    statusEnteredDate: toDateOnlyString(item.statusEnteredDate),
    statusDaysAllotted: item.statusDaysAllotted,
    ...dayTracking,
    mediationAttemptCount: item.mediationAttemptCount,
    conciliationAttemptCount: item.conciliationAttemptCount,
    absenceCount: item.absenceCount,
    arbitrationAgreementSigned: item.arbitrationAgreementSigned,
    arbitrationAgreementDate: item.arbitrationAgreementDate ? toDateOnlyString(item.arbitrationAgreementDate) : null,
    arbitrationAwardDate: item.arbitrationAwardDate ? toDateOnlyString(item.arbitrationAwardDate) : null,
    settlementDate: item.settlementDate ? toDateOnlyString(item.settlementDate) : null,
    settlementSource: item.settlementSource,
    repudiationDate: item.repudiationDate ? toDateOnlyString(item.repudiationDate) : null,
    repudiationDeadline: item.repudiationDeadline ? toDateOnlyString(item.repudiationDeadline) : null,
    repudiationReason: item.repudiationReason,
    repudiatedBy: item.repudiatedBy,
    executionDeadline: item.executionDeadline ? toDateOnlyString(item.executionDeadline) : null,
    executionMethod: item.executionMethod,
    closedDate: item.closedDate ? toDateOnlyString(item.closedDate) : null,
    dismissalReason: item.dismissedReason,
    withdrawalReason: item.withdrawalReason,
    needsCertificateToFileAction: item.needsCertificateToFileAction,
    isArchived: item.isArchived,
    respondentName: item.respondentName,
    respondentAddress: item.respondentAddress,
    hearingDates: item.hearings.map((hearing) => toDateOnlyString(hearing.scheduledDate)),
    assignedOfficer,
    date: dateSubmitted,
    gender: complainant.gender ?? "Not specified",
    contact: complainant.contact ?? "Not provided",
    email: complainant.email,
    street: item.incidentStreet || complainant.street || item.respondentAddress || "Not specified",
    incidentLocation: item.incidentLocation ?? undefined,
    incidentLatitude: item.incidentLatitude?.toNumber() ?? null,
    incidentLongitude: item.incidentLongitude?.toNumber() ?? null,
    incidentAccuracy: item.incidentAccuracy,
    details: item.details,
    dateSubmitted,
    incidentDate: formatDate(item.incidentDate),
    resolution: item.settlement?.agreementText ?? item.dismissedReason ?? "No resolution recorded.",
    evidence: item.evidence.length,
    evidenceFiles: item.evidence.map((file) => ({
      id: file.id,
      name: file.fileName || file.fileUrl.split("/").at(-1) || "Evidence file",
      type: evidenceType(file.fileType),
      url: file.fileUrl,
      thumbnail: file.fileUrl,
      size: "Uploaded file",
      uploadedAt: formatDate(file.uploadedAt),
    })),
    statusHistory: item.statusHistory.map((history) => ({
      status: statusLabels[history.newStatus],
      changedAt: history.changedAt.toISOString(),
      changedBy: history.user.fullName,
    })),
    assignedOfficerHistory: assignmentHistory.length > 0
      ? assignmentHistory
      : item.assignedOfficer
        ? [{ officer: assignedOfficer, assignedAt: item.updatedAt.toISOString(), assignedBy: "System" }]
        : [{ officer: "Unassigned", assignedAt: item.dateSubmitted.toISOString(), assignedBy: "System" }],
    activityHistory: [
      ...item.auditLogs.flatMap((log) => {
      if (log.action === AuditAction.ASSIGN || log.action === AuditAction.STATUS_CHANGE) return []
      const changes = auditChanges(log.changes)
      const note = typeof changes.note === "string" ? changes.note : null
      const requestInfo = typeof changes.requestInfo === "string" ? changes.requestInfo : null
      if (!note && !requestInfo) return []
      return [{
        id: log.id,
        action: note ? "Internal note added" : "Information requested",
        details: note ?? requestInfo ?? "",
        timestamp: log.loggedAt.toISOString(),
        actor: log.actorId,
      }]
      }),
      ...processHistory.map((history) => ({
        id: history.id,
        action: `${history.event.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())} · ${history.toStatus}`,
        details: history.details
          ? `${history.details}${history.event === "created" ? "" : ` ${history.businessDaysSpent} business days elapsed in the prior stage.`}`
          : `${history.fromStatus} → ${history.toStatus}; ${history.businessDaysSpent} business days spent in prior stage.`,
        timestamp: history.changedAt,
        actor: "Case workflow",
      })),
    ],
    processHistory,
    lastUpdated: item.updatedAt.toISOString(),
    version: 1,
  }
}

function startOfWeek(date = new Date()) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  next.setDate(next.getDate() - next.getDay())
  return next
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function startOfYear(date = new Date()) {
  return new Date(date.getFullYear(), 0, 1)
}

function percentChange(current: number, previous: number) {
  if (!previous) return current ? 100 : 0
  return Number((((current - previous) / previous) * 100).toFixed(1))
}

function byMonth(cases: Array<{ dateSubmitted: Date; category: string }>) {
  const currentYear = new Date().getFullYear()
  return months.map((month, index) => {
    const monthCases = cases.filter((item) => item.dateSubmitted.getFullYear() === currentYear && item.dateSubmitted.getMonth() === index)
    const countCategory = (...categories: string[]) => monthCases.filter((item) => categories.includes(item.category)).length
    return {
      month,
      cases: monthCases.length,
      violence: countCategory("Violence or Threats"),
      harassment: countCategory("Harassment & Abuse", "Child & Vulnerable Protection"),
      disturbance: countCategory("Public Disturbance"),
      community: countCategory("Community Dispute"),
      other: countCategory("Fraud & Scams", "Property & Theft"),
    }
  })
}

function categoryPercentages(cases: Array<{ category: string }>) {
  const total = Math.max(cases.length, 1)
  const counts = new Map<string, number>()

  cases.forEach((item) => {
    const label = item.category
    counts.set(label, (counts.get(label) ?? 0) + 1)
  })

  return [...counts.entries()].map(([name, count]) => ({
    name,
    value: Number(((count / total) * 100).toFixed(1)),
  }))
}

function statusCounts(cases: Array<{ currentStatus: DbCaseProcessStatus }>) {
  return Object.fromEntries(Object.values(DbCaseProcessStatus).map((status) => [
    status,
    cases.filter((item) => item.currentStatus === status).length,
  ]))
}

export type CaseListFilters = {
  category?: string
  type?: string
  priority?: CasePriority
  currentStatus?: CaseProcessStatus
  isArchived?: boolean
  includeArchived?: boolean
  filingDateFrom?: string
  filingDateTo?: string
  incidentDateFrom?: string
  incidentDateTo?: string
  minLatitude?: number
  maxLatitude?: number
  minLongitude?: number
  maxLongitude?: number
}

function dateFilter(from?: string, to?: string) {
  if (!from && !to) return undefined
  return {
    ...(from ? { gte: new Date(`${from}T00:00:00.000Z`) } : {}),
    ...(to ? { lte: new Date(`${to}T00:00:00.000Z`) } : {}),
  }
}

export async function listCases(filters: CaseListFilters = {}) {
  const where: Prisma.CaseWhereInput = {}
  if (filters.isArchived !== undefined) where.isArchived = filters.isArchived
  else if (!filters.includeArchived) where.isArchived = false
  if (filters.category) where.category = filters.category
  if (filters.type?.trim()) where.type = { contains: filters.type.trim(), mode: "insensitive" }
  if (filters.priority) {
    const priorityValue: Partial<Record<CasePriority, DbCasePriority>> = {
      Low: DbCasePriority.LOW,
      Medium: DbCasePriority.MEDIUM,
      High: DbCasePriority.HIGH,
      Urgent: DbCasePriority.URGENT,
    }
    const priority = priorityValue[filters.priority]
    if (priority) where.priority = priority
  }
  if (filters.currentStatus && Object.values(DbCaseProcessStatus).includes(filters.currentStatus as DbCaseProcessStatus)) {
    where.currentStatus = filters.currentStatus as DbCaseProcessStatus
  }
  const filingDate = dateFilter(filters.filingDateFrom, filters.filingDateTo)
  const incidentDate = dateFilter(filters.incidentDateFrom, filters.incidentDateTo)
  if (filingDate) where.filingDate = filingDate
  if (incidentDate) where.incidentDate = incidentDate
  if (filters.minLatitude != null || filters.maxLatitude != null) {
    where.incidentLatitude = {
      ...(filters.minLatitude != null ? { gte: filters.minLatitude } : {}),
      ...(filters.maxLatitude != null ? { lte: filters.maxLatitude } : {}),
    }
  }
  if (filters.minLongitude != null || filters.maxLongitude != null) {
    where.incidentLongitude = {
      ...(filters.minLongitude != null ? { gte: filters.minLongitude } : {}),
      ...(filters.maxLongitude != null ? { lte: filters.maxLongitude } : {}),
    }
  }

  const cases = await prisma.case.findMany({
    where,
    include: caseInclude,
    orderBy: { filingDate: "desc" },
  })

  return cases.map(mapCaseRecord)
}

export async function getCasesData(filters: CaseListFilters = {}) {
  return listCases(filters)
}

export async function getCaseData(id: string) {
  const item = await prisma.case.findUnique({
    where: { id },
    include: caseInclude,
  })

  return item ? mapCaseRecord(item) : null
}

export async function updateCaseData(id: string, input: { status?: CaseStatus; assignedOfficer?: string; scheduledAt?: string }) {
  const current = await prisma.case.findUnique({ where: { id }, include: { assignedOfficer: true } })
  if (!current) return null
  if (current.isArchived) throw new Error("Restore the case before updating it.")

  if (input.status === "Resolved" || input.status === "Closed" || input.status === "Dismissed") {
    throw new Error("Use the case workflow actions to resolve, close, or dismiss this case.")
  }
  if (input.status === "Mediation" && !input.scheduledAt) {
    throw new Error("Schedule a mediation hearing before moving the case to mediation.")
  }
  if (input.status === "Mediation" && current.currentStatus !== DbCaseProcessStatus.SCHEDULED) {
    throw new Error("A mediation hearing can only start from the scheduled case stage.")
  }

  if (input.scheduledAt) {
    const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/.exec(input.scheduledAt)
    if (!match || !Number.isFinite(new Date(`${match[1]}T00:00:00.000Z`).getTime())) {
      throw new Error("Scheduled date and time are invalid.")
    }
    const hour24 = Number(match[2])
    const minute = match[3]
    const hour12 = hour24 % 12 || 12
    const amPm = hour24 >= 12 ? "PM" : "AM"
    await createHearingData({
      caseId: id,
      mediator: input.assignedOfficer ?? current.assignedOfficer?.fullName,
      scheduledDate: match[1],
      scheduledTime: `${hour12}:${minute} ${amPm}`,
      location: "Barangay Hall",
    })
  }

  const data: Prisma.CaseUpdateInput = {}

  if (input.status) {
    data.status = statusFromLabel[input.status]
  }

  let nextOfficerName: string | null | undefined
  if (input.assignedOfficer !== undefined) {
    if (input.assignedOfficer === "Unassigned") {
      data.assignedOfficer = { disconnect: true }
      nextOfficerName = "Unassigned"
    } else {
      const officer = await prisma.officer.findFirst({ where: { fullName: input.assignedOfficer } })
      if (officer) {
        data.assignedOfficer = { connect: { id: officer.id } }
        nextOfficerName = officer.fullName
      }
    }
  }

  await prisma.case.update({ where: { id }, data })

  if (input.status && statusFromLabel[input.status] !== current.status) {
    const actor = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } })
    if (actor) {
      await prisma.caseStatusHistory.create({
        data: {
          caseId: id,
          changedBy: actor.id,
          oldStatus: current.status,
          newStatus: statusFromLabel[input.status],
        },
      })
      await prisma.auditLog.create({
        data: {
          actorId: actor.id,
          action: AuditAction.STATUS_CHANGE,
          targetTable: "cases",
          targetId: id,
          caseId: id,
          changes: { previousStatus: current.status, status: statusFromLabel[input.status] },
        },
      })
    }
  }

  if (nextOfficerName !== undefined && nextOfficerName !== (current.assignedOfficer?.fullName ?? "Unassigned")) {
    const actor = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } })
    if (actor) {
      await prisma.auditLog.create({
        data: {
          actorId: actor.id,
          action: AuditAction.ASSIGN,
          targetTable: "cases",
          targetId: id,
          caseId: id,
          changes: { previousOfficer: current.assignedOfficer?.fullName ?? "Unassigned", assignedOfficer: nextOfficerName },
        },
      })
    }
  }

  return getCaseData(id)
}

export async function createCaseNoteData(id: string, note: string) {
  const targetCase = await prisma.case.findUnique({ where: { id } })
  if (!targetCase) return null

  const actor = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } })
  if (!actor) return null

  const created = await prisma.auditLog.create({
    data: {
      actorId: actor.id,
      action: AuditAction.UPDATE,
      targetTable: "cases",
      targetId: id,
      caseId: id,
      changes: { note },
    },
  })
  return { id: created.id, author: actor.fullName, content: note, createdAt: created.loggedAt.toISOString() }
}

export async function getCaseNotesData(id: string) {
  const exists = await prisma.case.findUnique({ where: { id }, select: { id: true } })
  if (!exists) return null

  const entries = await prisma.auditLog.findMany({
    where: { caseId: id, targetTable: "cases", action: AuditAction.UPDATE },
    orderBy: { loggedAt: "desc" },
    select: { id: true, actorId: true, changes: true, loggedAt: true },
  })
  const notes = entries.flatMap((entry) => {
    const changes = entry.changes && typeof entry.changes === "object" && !Array.isArray(entry.changes)
      ? entry.changes as Record<string, unknown>
      : {}
    return typeof changes.note === "string"
      ? [{ id: entry.id, actorId: entry.actorId, content: changes.note, createdAt: entry.loggedAt.toISOString() }]
      : []
  })
  const authors = await prisma.user.findMany({
    where: { id: { in: notes.map((note) => note.actorId) } },
    select: { id: true, fullName: true },
  })
  const authorNames = new Map(authors.map((author) => [author.id, author.fullName]))
  return notes.map(({ actorId, ...note }) => ({ ...note, author: authorNames.get(actorId) ?? "Administrator" }))
}

export async function updateCaseNoteData(id: string, noteId: string, content: string) {
  const entry = await prisma.auditLog.findFirst({
    where: { id: noteId, caseId: id, targetTable: "cases", action: AuditAction.UPDATE },
  })
  if (!entry) return null
  const changes = entry.changes && typeof entry.changes === "object" && !Array.isArray(entry.changes)
    ? entry.changes as Record<string, unknown>
    : {}
  if (typeof changes.note !== "string") return null

  const updated = await prisma.auditLog.update({
    where: { id: entry.id },
    data: { changes: { ...changes, note: content }, loggedAt: new Date() },
  })
  const author = await prisma.user.findUnique({ where: { id: entry.actorId }, select: { fullName: true } })
  return { id: updated.id, author: author?.fullName ?? "Administrator", content, createdAt: updated.loggedAt.toISOString() }
}

export async function requestCaseInfoData(id: string, message: string) {
  const targetCase = await prisma.case.findUnique({
    where: { id },
    include: { complainant: true },
  })
  if (!targetCase) return null

  const actor = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } })

  const notification = await prisma.notification.create({
    data: {
      userId: targetCase.complainantId,
      type: NotificationType.CASE_UPDATE,
      message,
    },
  })

  if (actor) {
    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: AuditAction.UPDATE,
        targetTable: "cases",
        targetId: id,
        caseId: id,
        changes: { requestInfo: message },
      },
    })
  }

  return notification
}

type DashboardCase = {
  status: DbCaseStatus
  currentStatus: DbCaseProcessStatus
  priority: DbCasePriority
  category: string
  dateSubmitted: Date
}

function buildDashboardData(cases: DashboardCase[], officers: number, users: number) {
  const weekStart = startOfWeek()
  const priorWeekStart = new Date(weekStart)
  priorWeekStart.setDate(priorWeekStart.getDate() - 7)
  const thisWeek = cases.filter((item) => item.dateSubmitted >= weekStart)
  const lastWeek = cases.filter((item) => item.dateSubmitted >= priorWeekStart && item.dateSubmitted < weekStart)
  const active = cases.filter((item) => !["RESOLVED", "UNRESOLVED", "DISMISSED", "ARCHIVED", "REJECTED", "REFERRED"].includes(item.status))
  const resolved = cases.filter((item) => item.status === DbCaseStatus.RESOLVED)
  const urgent = cases.filter((item) => item.priority === DbCasePriority.URGENT || item.priority === DbCasePriority.HIGH)

  return {
    stats: [
      { title: "Total Reports", value: cases.length.toLocaleString(), period: "This Week", change: percentChange(thisWeek.length, lastWeek.length), trending: thisWeek.length >= lastWeek.length ? "up" : "down" },
      { title: "Active Cases", value: active.length.toLocaleString(), period: "Current", change: 0, trending: "up" },
      { title: "Resolved Cases", value: resolved.length.toLocaleString(), period: "All Time", change: 0, trending: "up" },
      { title: "Urgent Cases", value: urgent.length.toLocaleString(), period: "Current", change: 0, trending: "down" },
    ],
    priorityDistribution: Object.values(DbCasePriority).map((priority) => ({
      name: priority === DbCasePriority.URGENT ? "Critical" : priorityLabels[priority],
      value: cases.filter((item) => item.priority === priority).length,
    })),
    monthlyTrend: byMonth(cases),
    categoryBreakdown: categoryPercentages(cases),
    resolutionStatus: {
      weekly: statusCounts(thisWeek),
      monthly: statusCounts(cases.filter((item) => item.dateSubmitted >= startOfMonth())),
      yearly: statusCounts(cases.filter((item) => item.dateSubmitted >= startOfYear())),
    },
    sideStats: {
      pending: cases.filter((item) => item.status === DbCaseStatus.PENDING).length,
      underReview: cases.filter((item) => statusLabels[item.status] === "Under Review").length,
      officers,
      users,
    },
  }
}

export async function getOperationsData() {
  const [officers, hearings] = await Promise.all([
    prisma.officer.findMany({
      select: {
        id: true,
        fullName: true,
        roleTitle: true,
        cases: { where: { isArchived: false }, select: { id: true, caseNumber: true, dateSubmitted: true, status: true, type: true, priority: true } },
      },
      orderBy: { fullName: "asc" },
    }),
    prisma.hearing.findMany({
      where: { case: { isArchived: false } },
      select: {
        id: true,
        scheduledDate: true,
        scheduledTime: true,
        location: true,
        status: true,
        officer: { select: { fullName: true } },
        case: {
          select: {
            id: true,
            caseNumber: true,
            dateSubmitted: true,
            respondentName: true,
            complainant: { select: { fullName: true } },
            respondent: { select: { fullName: true } },
          },
        },
      },
      orderBy: { scheduledDate: "desc" },
    }),
  ])

  return {
    officers: officers.map((officer) => {
      const activeCases = officer.cases.filter((item) => statusLabels[item.status] !== "Resolved" && statusLabels[item.status] !== "Closed").length
      const resolvedCases = officer.cases.filter((item) => item.status === DbCaseStatus.RESOLVED).length
      return {
        id: officer.id,
        name: shortName(officer.fullName),
        fullName: officer.fullName,
        position: officer.roleTitle.replaceAll("_", " "),
        activeCases,
        resolvedCases,
        cases: officer.cases.map((item) => ({
          id: item.id,
          caseNumber: item.caseNumber,
          title: item.type,
          status: statusLabels[item.status],
          priority: priorityLabels[item.priority],
        })),
      }
    }),
    mediationSessions: hearings.map((hearing) => ({
      id: hearing.id,
      caseId: hearing.case.caseNumber,
      parties: [hearing.case.complainant.fullName, hearing.case.respondent?.fullName ?? hearing.case.respondentName ?? "Respondent"].filter(Boolean),
      mediator: hearing.officer?.fullName ?? "Unassigned",
      scheduledDate: formatDate(hearing.scheduledDate),
      scheduledTime: hearing.scheduledTime,
      location: hearing.location,
      status: hearing.status === HearingStatus.COMPLETED ? "Completed" : "Scheduled",
    })),
    assignableCases: await prisma.case.findMany({
      where: {
        isArchived: false,
        OR: [{ assignedOfficerId: null }, { status: DbCaseStatus.PENDING }, { status: DbCaseStatus.UNDER_REVIEW }],
      },
      select: { id: true, caseNumber: true, type: true, status: true, dateSubmitted: true },
      orderBy: { dateSubmitted: "desc" },
    }).then((items) => items.map((item) => ({
      id: item.id,
      caseNumber: item.caseNumber,
      title: item.type,
      status: statusLabels[item.status],
    }))),
  }
}

export async function createHearingData(input: {
  caseId: string
  mediator?: string
  scheduledDate: string
  scheduledTime: string
  location: string
}) {
  let targetCase = await prisma.case.findUnique({ where: { id: input.caseId } })

  if (!targetCase) targetCase = await prisma.case.findUnique({ where: { caseNumber: input.caseId } })

  if (!targetCase) return null
  if (targetCase.isArchived) throw new Error("Restore the case before scheduling a hearing.")

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.scheduledDate) || !Number.isFinite(new Date(input.scheduledDate).getTime())) {
    throw new Error("Scheduled date is invalid.")
  }
  const officer = input.mediator ? await prisma.officer.findFirst({ where: { fullName: input.mediator } }) : null
  const stage = targetCase.currentStatus === DbCaseProcessStatus.CONCILIATION
    ? HearingStage.CONCILIATION
    : HearingStage.MEDIATION
  const existingHearings = await prisma.hearing.count({ where: { caseId: targetCase.id, stage } })
  const hearing = await prisma.hearing.create({
    data: {
      caseId: targetCase.id,
      conductedBy: officer?.id,
      hearingNumber: existingHearings + 1,
      stage,
      scheduledDate: new Date(input.scheduledDate),
      scheduledTime: input.scheduledTime,
      location: input.location,
      status: HearingStatus.SCHEDULED,
    },
  })
  if (targetCase.currentStatus === DbCaseProcessStatus.SCHEDULED) {
    await transitionStatus(targetCase.id, "hearing_scheduled")
  }
  return hearing
}

export async function createOfficerData(input: { fullName: string; email: string; roleTitle?: string }) {
  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      role: input.roleTitle?.includes("LUPON") ? UserRole.LUPON : UserRole.BPAT_OFFICER,
      status: UserStatus.ACTIVE,
    },
  })

  const officer = await prisma.officer.create({
    data: {
      userId: user.id,
      fullName: input.fullName,
      roleTitle: input.roleTitle === "LUPON_MEMBER" ? OfficerRoleTitle.LUPON_MEMBER : OfficerRoleTitle.BPAT_OFFICER,
    },
  })
  revalidateTag("officer-names", "max")
  return officer
}

export async function assignCaseData(input: { caseId: string; officerId: string }) {
  const [current, officer, actor] = await Promise.all([
    prisma.case.findUnique({ where: { id: input.caseId }, include: { assignedOfficer: true } }),
    prisma.officer.findUnique({ where: { id: input.officerId } }),
    prisma.user.findFirst({ where: { role: UserRole.ADMIN } }),
  ])
  if (!current || current.isArchived || !officer) return null

  const updated = await prisma.case.update({
    where: { id: input.caseId },
    data: {
      assignedOfficerId: input.officerId,
      status: DbCaseStatus.ASSIGNED,
    },
  })
  if (actor && current.assignedOfficerId !== officer.id) {
    await prisma.auditLog.create({
      data: {
      actorId: actor.id,
      action: AuditAction.ASSIGN,
      targetTable: "cases",
      targetId: input.caseId,
      caseId: input.caseId,
      changes: { previousOfficer: current.assignedOfficer?.fullName ?? "Unassigned", assignedOfficer: officer.fullName },
    },
    })
  }
  return updated
}

export async function getDashboardData() {
  const [cases, recentCases, officers, users, hearings] = await Promise.all([
    prisma.case.findMany({ where: { isArchived: false }, select: { status: true, currentStatus: true, priority: true, category: true, dateSubmitted: true } }),
    prisma.case.findMany({
      where: { isArchived: false },
      select: { id: true, type: true, category: true, status: true, dateSubmitted: true },
      orderBy: { dateSubmitted: "desc" },
      take: 5,
    }),
    prisma.officer.count(),
    prisma.user.count({ where: { isArchived: false } }),
    prisma.hearing.findMany({
      where: {
        status: HearingStatus.SCHEDULED,
        scheduledDate: { gte: new Date(`${toDateOnlyString(new Date())}T00:00:00.000Z`) },
        case: { isArchived: false },
      },
      select: {
        id: true,
        scheduledDate: true,
        scheduledTime: true,
        location: true,
        case: { select: { caseNumber: true, type: true } },
      },
      orderBy: [{ scheduledDate: "asc" }, { scheduledTime: "asc" }],
      take: 200,
    }),
  ])
  return {
    ...buildDashboardData(cases, officers, users),
    recentCases: recentCases.map((item) => ({
      id: item.id,
      title: item.type,
      category: item.category,
      status: item.status === DbCaseStatus.PENDING
        ? "pending"
        : statusLabels[item.status] === "Resolved"
          ? "resolved"
          : statusLabels[item.status] === "Under Review" || statusLabels[item.status] === "Mediation"
            ? "under_review"
            : "closed",
      created_at: item.dateSubmitted.toISOString(),
    })),
    upcomingHearings: hearings.map((hearing) => ({
      id: hearing.id,
      caseId: hearing.case.caseNumber,
      title: hearing.case.type,
      date: toDateOnlyString(hearing.scheduledDate),
      time: hearing.scheduledTime,
      location: hearing.location,
    })),
  }
}

export async function getReportsData() {
  const [cases, operations, users] = await Promise.all([
    prisma.case.findMany({
    where: { isArchived: false },
    select: {
      id: true,
      type: true,
      status: true,
      currentStatus: true,
      category: true,
      priority: true,
      dateSubmitted: true,
      incidentDate: true,
      incidentStreet: true,
      incidentLocation: true,
      incidentLatitude: true,
      incidentLongitude: true,
      incidentAccuracy: true,
      complainant: { select: { street: true } },
    },
    }),
    getOperationsData(),
    prisma.user.count({ where: { isArchived: false } }),
  ])
  const dashboard = buildDashboardData(cases, operations.officers.length, users)
  const resolved = cases.filter((item) => item.status === DbCaseStatus.RESOLVED).length
  const topCategory = categoryPercentages(cases).sort((a, b) => b.value - a.value)[0]
  const streetCounts = new Map<string, number>()
  cases.forEach((item) => {
    const street = item.incidentStreet || item.complainant.street || "Unspecified"
    streetCounts.set(street, (streetCounts.get(street) ?? 0) + 1)
  })
  const topStreet = [...streetCounts.entries()].sort((a, b) => b[1] - a[1])[0] ?? ["Unspecified", 0]
  const mapIncidents = cases.flatMap((item) => {
    const latitude = item.incidentLatitude?.toNumber() ?? null
    const longitude = item.incidentLongitude?.toNumber() ?? null
    if (latitude == null || longitude == null || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return []

    const street = item.incidentStreet || item.complainant.street || "Unspecified"
    return [{
      id: item.id,
      title: item.type || "Incident",
      street,
      address: item.incidentLocation || street,
      latitude,
      longitude,
      accuracy: item.incidentAccuracy,
      priority: priorityLabels[item.priority],
      status: item.status.replaceAll("_", " "),
    }]
  }).slice(0, 500)

  return {
    ...dashboard,
    reportStats: {
      totalCases: cases.length,
      resolutionRate: cases.length ? Math.round((resolved / cases.length) * 100) : 0,
      activeOfficers: operations.officers.length,
    },
    priorityDistribution: Object.values(DbCasePriority).map((priority) => ({
      name: priorityLabels[priority] === "High" && priority === DbCasePriority.URGENT ? "Critical" : priorityLabels[priority],
      value: cases.filter((item) => item.priority === priority).length,
    })),
    keyInsights: {
      topStreet: topStreet[0],
      topStreetCount: topStreet[1],
      topCategory: topCategory?.name ?? "No cases",
      topCategoryCount: Math.round(((topCategory?.value ?? 0) / 100) * cases.length),
    },
    officerPerformance: operations.officers.slice(0, 5),
    mapIncidents,
  }
}

export async function getAdminData() {
  const [users, announcements, auditLogs] = await Promise.all([
    prisma.user.findMany({
      where: { isArchived: false },
      select: {
        id: true,
        fullName: true,
        email: true,
        street: true,
        contact: true,
        bio: true,
        photoUrl: true,
        gender: true,
        genderDetails: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        suspensionReason: true,
        twoFactorEnabled: true,
        locationAddress: true,
        identity: { select: { governmentIdMimeType: true, dateOfBirth: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.announcement.findMany({ include: { author: { select: { fullName: true } } }, orderBy: { publishedAt: "desc" } }),
    prisma.auditLog.findMany({ orderBy: { loggedAt: "desc" }, take: 50 }),
  ])

  const referencedUsers = await prisma.user.findMany({
    where: { id: { in: [...new Set(auditLogs.flatMap((log) => [log.actorId, ...(log.targetTable === "users" ? [log.targetId] : [])]))] } },
    select: { id: true, fullName: true, role: true },
  })
  const referencedCases = await prisma.case.findMany({
    where: { id: { in: auditLogs.filter((log) => log.targetTable === "cases").map((log) => log.targetId) } },
    select: { id: true, caseNumber: true },
  })
  const userLookup = new Map(referencedUsers.map((user) => [user.id, user]))
  const caseLookup = new Map(referencedCases.map((item) => [item.id, item.caseNumber]))
  const roleLabel = (role: UserRole | undefined) => {
    if (role === UserRole.BPAT_OFFICER) return "BPAT Officer"
    if (role === UserRole.LUPON) return "Lupon"
    return role?.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? "Unknown role"
  }
  const auditDescription = (log: (typeof auditLogs)[number]) => {
    const actor = userLookup.get(log.actorId)
    const actorName = actor?.fullName ?? "A system user"
    const targetUser = log.targetTable === "users" ? userLookup.get(log.targetId) : undefined
    const caseNumber = log.targetTable === "cases" ? caseLookup.get(log.targetId) : undefined
    const targetName = targetUser?.fullName ?? (caseNumber ? `case ${caseNumber}` : log.targetTable.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()))
    const changes = log.changes && typeof log.changes === "object" && !Array.isArray(log.changes)
      ? log.changes as Record<string, unknown>
      : {}
    const status = typeof changes.status === "string" ? changes.status.replaceAll("_", " ").toLowerCase() : ""
    const priorStatus = typeof changes.previousStatus === "string" ? changes.previousStatus.replaceAll("_", " ").toLowerCase() : ""
    const reason = typeof changes.remarks === "string" && changes.remarks.trim() ? ` due to ${changes.remarks.trim()}` : ""

    switch (log.action) {
      case AuditAction.LOGIN:
        return `${actorName} logged in as a ${roleLabel(actor?.role)}.`
      case AuditAction.CREATE:
        return `${actorName} created ${targetName}.`
      case AuditAction.DELETE:
        return `${actorName} deleted ${targetName}.`
      case AuditAction.ARCHIVE:
        return `${actorName} archived ${targetName}.`
      case AuditAction.ASSIGN:
        return `${actorName} assigned ${targetName} to ${String(changes.assignedOfficer ?? "an officer")}.`
      case AuditAction.STATUS_CHANGE:
        if (targetUser && status === "suspended") return `${actorName} suspended ${targetUser.fullName}${reason}.`
        if (targetUser && (status === "active" || status === "verified")) return `${actorName} reinstated ${targetUser.fullName}'s account.`
        return `${actorName} changed ${targetName} from ${priorStatus || "an earlier status"} to ${status || "a new status"}.`
      case AuditAction.UPDATE:
        if (typeof changes.requestInfo === "string") return `${actorName} requested more information about ${targetName}.`
        if (typeof changes.note === "string") return `${actorName} added a case note to ${targetName}.`
        return `${actorName} updated ${targetName}.`
      default:
        return `${actorName} performed ${String(log.action).replaceAll("_", " ").toLowerCase()} on ${targetName}.`
    }
  }

  return {
    users: users.map((user) => ({
      id: user.id,
      name: user.fullName,
      email: user.email,
      street: user.street ?? "Not set",
      phone: user.contact ?? "Not provided",
      bio: user.bio ?? "Not provided",
      photoUrl: user.photoUrl ?? "",
      gender: user.genderDetails || user.gender?.toLowerCase() || "Not provided",
      role: roleLabel(user.role),
      registered: formatDate(user.createdAt),
      registeredAt: user.createdAt.toISOString(),
      updatedAt: formatDateTime(user.updatedAt),
      locationAddress: user.locationAddress ?? "Not recorded",
      dateOfBirth: user.identity?.dateOfBirth ? formatDate(user.identity.dateOfBirth) : "Not provided",
      twoFactorEnabled: user.twoFactorEnabled,
      suspensionReason: user.suspensionReason ?? "",
      hasGovernmentId: Boolean(user.identity?.governmentIdMimeType),
      status: user.status === UserStatus.ACTIVE ? "Verified" : user.status === UserStatus.SUSPENDED ? "Suspended" : "Pending",
    })),
    announcements: announcements.map((announcement) => ({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      author: announcement.author.fullName,
      date: formatDate(announcement.publishedAt),
      isPinned: false,
    })),
    auditLogs: auditLogs.map((log) => ({
      id: log.id,
      action: log.action.replaceAll("_", " "),
      user: userLookup.get(log.actorId)?.fullName ?? "Unknown user",
      role: roleLabel(userLookup.get(log.actorId)?.role),
      description: auditDescription(log),
      relatedRecord: log.targetTable === "cases" ? caseLookup.get(log.targetId) ?? "Case record" : log.targetTable === "users" ? userLookup.get(log.targetId)?.fullName ?? "User account" : log.targetTable.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
      targetTable: log.targetTable,
      timestamp: log.loggedAt.toISOString(),
      timestampLabel: new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", dateStyle: "medium", timeStyle: "short" }).format(log.loggedAt),
    })),
  }
}

export async function updateUserStatusData(id: string, status: "Verified" | "Suspended" | "Pending", remarks?: string) {
  const nextStatus = status === "Verified" ? UserStatus.ACTIVE : status === "Suspended" ? UserStatus.SUSPENDED : UserStatus.INACTIVE
  const user = await prisma.user.findUnique({ where: { id }, select: { status: true } })
  if (!user) return null

  const updated = await prisma.user.update({
    where: { id },
    data: {
      status: nextStatus,
      suspensionReason: status === "Suspended" ? remarks?.trim() : null,
    },
  })
  const actor = await prisma.user.findFirst({ where: { role: UserRole.ADMIN }, select: { id: true } })
  if (actor) {
    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: AuditAction.STATUS_CHANGE,
        targetTable: "users",
        targetId: id,
        changes: {
          previousStatus: user.status,
          status: nextStatus,
          ...(status === "Suspended" ? { remarks: remarks?.trim() } : {}),
        },
      },
    })
  }

  return updated
}

export async function createAnnouncementData(input: { title: string; content: string }) {
  const author = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } })
  if (!author) return null
  return prisma.announcement.create({
    data: {
      createdBy: author.id,
      title: input.title,
      content: input.content,
    },
  })
}

export async function updateAnnouncementData(id: string, input: { title: string; content: string }) {
  return prisma.announcement.update({
    where: { id },
    data: {
      title: input.title,
      content: input.content,
    },
  })
}

export async function deleteAnnouncementData(id: string) {
  return prisma.announcement.delete({ where: { id } })
}

const getCachedOfficerNames = unstable_cache(async () => {
  const officers = await prisma.officer.findMany({ select: { fullName: true }, orderBy: { fullName: "asc" } })
  return ["Unassigned", ...officers.map((officer) => officer.fullName)]
}, ["officer-names"], { revalidate: 300, tags: ["officer-names"] })

export async function getOfficerNames() {
  return getCachedOfficerNames()
}

function notificationCategory(type: string): "case" | "system" | "report" {
  if (type.includes("CASE") || type.includes("HEARING") || type.includes("SETTLEMENT")) return "case"
  if (type.includes("ANNOUNCEMENT")) return "report"
  return "system"
}

function notificationTitle(type: string) {
  return type.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
}

export async function getNotificationsData(limit?: number) {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return notifications.map((item) => ({
    id: item.id,
    title: notificationTitle(item.type),
    message: item.message,
    time: formatDateTime(item.createdAt),
    date: formatDate(item.createdAt),
    read: item.isRead,
    category: notificationCategory(item.type),
  }))
}

export async function markNotificationReadData(id: string) {
  return prisma.notification.update({ where: { id }, data: { isRead: true } })
}

export async function markAllNotificationsReadData() {
  return prisma.notification.updateMany({ data: { isRead: true } })
}

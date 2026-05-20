import {
  AuditAction,
  CaseCategory as DbCaseCategory,
  CasePriority as DbCasePriority,
  CaseStatus as DbCaseStatus,
  HearingOutcome,
  HearingStage,
  HearingStatus,
  NotificationType,
  OfficerRoleTitle,
  Prisma,
  UserRole,
  UserStatus,
} from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { getAuditLogsData, getSystemActorId, writeAuditLog } from "@/lib/audit-logs"
import { analyzeStoredCase } from "@/lib/ai-case-analysis"
import { findEastTapinacStreet } from "@/lib/east-tapinac-geo"
import type { CaseCategory, CasePriority, CaseRecord, CaseStatus, EvidenceFile } from "@/lib/types"

const categoryLabels: Record<DbCaseCategory, CaseCategory> = {
  DISPUTE: "Community Dispute",
  INJURY: "Violence or Threats",
  VAWC: "Harassment & Abuse",
  ORDINANCE_VIOLATION: "Public Disturbance",
  OTHER: "Community Dispute",
}

const priorityLabels: Record<DbCasePriority, CasePriority> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "High",
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
  Closed: DbCaseStatus.DISMISSED,
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

const priorityFromLabel: Record<CasePriority, DbCasePriority[]> = {
  High: [DbCasePriority.HIGH, DbCasePriority.URGENT],
  Medium: [DbCasePriority.MEDIUM],
  Low: [DbCasePriority.LOW],
}

const closedStatuses = [
  DbCaseStatus.RESOLVED,
  DbCaseStatus.UNRESOLVED,
  DbCaseStatus.DISMISSED,
  DbCaseStatus.ARCHIVED,
  DbCaseStatus.REJECTED,
  DbCaseStatus.REFERRED,
]

export const agreementTypes = ["partial agreement", "amicable settlement", "non-settlement"] as const
export type AgreementType = (typeof agreementTypes)[number]

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const caseInclude = {
  complainant: true,
  respondent: true,
  assignedOfficer: true,
  evidence: true,
  statusHistory: { include: { user: true }, orderBy: { changedAt: "asc" as const } },
  hearings: { include: { officer: true }, orderBy: { scheduledDate: "asc" as const } },
  settlement: true,
  monitoring: true,
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

function caseNumber(id: string, date: Date) {
  return `IRIS-${date.getFullYear()}-${id.slice(0, 8).toUpperCase()}`
}

function evidenceType(fileType: string): EvidenceFile["type"] {
  return fileType.toLowerCase().includes("image") ? "image" : "document"
}

function evidenceName(fileUrl: string) {
  const raw = fileUrl.split("/").at(-1) || "Evidence file"
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

export function mapCaseRecord(item: CaseWithRelations): CaseRecord {
  const complainant = item.complainant
  const assignedOfficer = item.assignedOfficer?.fullName ?? "Unassigned"
  const dateSubmitted = formatDate(item.dateSubmitted)

  return {
    id: item.id,
    caseNumber: caseNumber(item.id, item.dateSubmitted),
    fullName: complainant.fullName,
    shortName: shortName(complainant.fullName),
    category: categoryLabels[item.category],
    type: item.type,
    priority: priorityLabels[item.priority],
    status: statusLabels[item.status],
    assignedOfficer,
    date: dateSubmitted,
    gender: complainant.gender ?? "Not specified",
    contact: complainant.contact ?? "Not provided",
    email: complainant.email,
    street: item.incidentStreet || complainant.street || item.respondentAddress || "Not specified",
    details: item.details,
    dateSubmitted,
    incidentDate: formatDate(item.incidentDate),
    evidence: item.evidence.length,
    evidenceFiles: item.evidence.map((file) => ({
      id: file.id,
      name: evidenceName(file.fileUrl),
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
    assignedOfficerHistory: item.assignedOfficer
      ? [{ officer: assignedOfficer, assignedAt: item.updatedAt.toISOString(), assignedBy: "System" }]
      : [{ officer: "Unassigned", assignedAt: item.dateSubmitted.toISOString(), assignedBy: "System" }],
    aiAnalysis: analyzeStoredCase({
      selectedCategory: categoryLabels[item.category],
      details: item.details,
      incidentLocation: item.incidentLocation ?? item.incidentStreet,
    }),
    lastUpdated: item.updatedAt.toISOString(),
    version: 1,
    isArchived: item.isArchived,
  }
}

async function getCaseNotesData(id: string) {
  const notes = await prisma.auditLog.findMany({
    where: {
      targetTable: "cases",
      targetId: id,
    },
    orderBy: { loggedAt: "desc" },
  })
  const actorIds = [...new Set(notes.map((note) => note.actorId))]
  const users = await prisma.user.findMany({
    where: { id: { in: actorIds } },
    select: { id: true, fullName: true, email: true },
  })
  const usersById = new Map(users.map((user) => [user.id, user]))

  return notes.map((log) => {
    const changes = log.changes as { note?: unknown }
    const author = usersById.get(log.actorId)

    return {
      id: log.id,
      note: typeof changes.note === "string" ? changes.note : "",
      author: author?.fullName ?? author?.email ?? "Admin",
      createdAt: formatDateTime(log.loggedAt),
    }
  }).filter((note) => note.note)
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

function byMonth(cases: Array<{ dateSubmitted: Date; category: DbCaseCategory }>) {
  return months.map((month, index) => {
    const monthCases = cases.filter((item) => item.dateSubmitted.getMonth() === index)
    return {
      month,
      cases: monthCases.length,
      violence: monthCases.filter((item) => item.category === DbCaseCategory.INJURY).length,
      harassment: monthCases.filter((item) => item.category === DbCaseCategory.VAWC).length,
      fraud: monthCases.filter((item) => item.category === DbCaseCategory.OTHER).length,
      disturbance: monthCases.filter((item) => item.category === DbCaseCategory.ORDINANCE_VIOLATION).length,
      property: monthCases.filter((item) => item.category === DbCaseCategory.OTHER).length,
      community: monthCases.filter((item) => item.category === DbCaseCategory.DISPUTE).length,
      child: monthCases.filter((item) => item.category === DbCaseCategory.VAWC).length,
    }
  })
}

function categoryPercentages(cases: Array<{ category: DbCaseCategory }>) {
  const total = Math.max(cases.length, 1)
  const counts = new Map<string, number>()

  cases.forEach((item) => {
    const label = categoryLabels[item.category]
    counts.set(label, (counts.get(label) ?? 0) + 1)
  })

  return [...counts.entries()].map(([name, count]) => ({
    name,
    value: Number(((count / total) * 100).toFixed(1)),
  }))
}

function statusCounts(cases: Array<{ status: DbCaseStatus }>) {
  return {
    Pending: cases.filter((item) => statusLabels[item.status] === "Pending").length,
    "Under Review": cases.filter((item) => statusLabels[item.status] === "Under Review").length,
    Mediation: cases.filter((item) => statusLabels[item.status] === "Mediation").length,
    Resolved: cases.filter((item) => statusLabels[item.status] === "Resolved").length,
    Closed: cases.filter((item) => statusLabels[item.status] === "Closed").length,
    Submitted: cases.length,
  }
}

function getCaseTabWhere(tab: "pending" | "active" | "archive") {
  if (tab === "pending") {
    return { status: DbCaseStatus.PENDING, isArchived: false } satisfies Prisma.CaseWhereInput
  }

  if (tab === "archive") {
    return {
      OR: [{ isArchived: true }, { status: { in: closedStatuses } }],
    } satisfies Prisma.CaseWhereInput
  }

  return {
    isArchived: false,
    status: { notIn: [DbCaseStatus.PENDING, ...closedStatuses] },
  } satisfies Prisma.CaseWhereInput
}

function getCaseFilterWhere(input?: {
  tab?: "pending" | "active" | "archive"
  status?: CaseStatus | "All"
  category?: CaseCategory | "All"
  priority?: CasePriority | "All"
  search?: string
}) {
  const and: Prisma.CaseWhereInput[] = [getCaseTabWhere(input?.tab ?? "pending")]

  if (input?.status && input.status !== "All") {
    and.push({ status: statusFromLabel[input.status] })
  }

  if (input?.category && input.category !== "All") {
    const category = categoryFromLabel[input.category]
    if (category) and.push({ category })
  }

  if (input?.priority && input.priority !== "All") {
    and.push({ priority: { in: priorityFromLabel[input.priority] } })
  }

  const search = input?.search?.trim()
  if (search) {
    and.push({
      OR: [
        { id: { contains: search, mode: "insensitive" } },
        { type: { contains: search, mode: "insensitive" } },
        { details: { contains: search, mode: "insensitive" } },
        { complainant: { fullName: { contains: search, mode: "insensitive" } } },
        { complainant: { email: { contains: search, mode: "insensitive" } } },
        { assignedOfficer: { fullName: { contains: search, mode: "insensitive" } } },
      ],
    })
  }

  return { AND: and } satisfies Prisma.CaseWhereInput
}

export async function getCasesData(input?: {
  page?: number
  limit?: number
  tab?: "pending" | "active" | "archive"
  status?: CaseStatus | "All"
  category?: CaseCategory | "All"
  priority?: CasePriority | "All"
  search?: string
  sort?: "Newest" | "Oldest" | "Priority"
}) {
  const page = Math.max(1, Math.floor(input?.page ?? 1))
  const limit = Math.min(24, Math.max(1, Math.floor(input?.limit ?? 6)))
  const where = getCaseFilterWhere(input)
  const orderBy: Prisma.CaseOrderByWithRelationInput[] =
    input?.sort === "Oldest"
      ? [{ dateSubmitted: "asc" }]
      : input?.sort === "Priority"
        ? [{ priority: "desc" }, { dateSubmitted: "desc" }]
        : [{ dateSubmitted: "desc" }]

  const cases = await prisma.case.findMany({
    where,
    include: caseInclude,
    orderBy,
    take: limit,
    skip: (page - 1) * limit,
  })
  const total = await prisma.case.count({ where })
  const pending = await prisma.case.count({ where: getCaseTabWhere("pending") })
  const active = await prisma.case.count({ where: getCaseTabWhere("active") })
  const archive = await prisma.case.count({ where: getCaseTabWhere("archive") })

  return {
    items: cases.map(mapCaseRecord),
    pagination: {
      page,
      pageSize: limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
    counts: { pending, active, archive },
  }
}

export async function getCaseData(id: string) {
  const item = await prisma.case.findUnique({
    where: { id },
    include: caseInclude,
  })

  if (!item) return null

  return {
    ...mapCaseRecord(item),
    internalNotes: await getCaseNotesData(id),
  }
}

export async function updateCaseData(id: string, input: { status?: CaseStatus; assignedOfficer?: string; action?: "restore" }) {
  const current = await prisma.case.findUnique({ where: { id } })
  if (!current) return null

  const data: Prisma.CaseUpdateInput = {}

  if (input.action === "restore") {
    data.status = DbCaseStatus.UNDER_REVIEW
    data.isArchived = false
    data.archivedAt = null
    data.archivedReason = null
  }

  if (input.status) {
    data.status = statusFromLabel[input.status]
    if (input.status === "Resolved" || input.status === "Closed") {
      data.isArchived = true
      data.archivedAt = new Date()
      data.archivedReason = input.status === "Resolved" ? "Resolved case" : "Closed case"
    }
  }

  if (input.assignedOfficer) {
    if (input.assignedOfficer === "Unassigned") {
      data.assignedOfficer = { disconnect: true }
    } else {
      const officer = await prisma.officer.findFirst({ where: { fullName: input.assignedOfficer } })
      if (officer) data.assignedOfficer = { connect: { id: officer.id } }
    }
  }

  await prisma.case.update({ where: { id }, data })

  const actorId = await getSystemActorId()

  if (actorId && input.status && statusFromLabel[input.status] !== current.status) {
      await prisma.caseStatusHistory.create({
        data: {
          caseId: id,
          changedBy: actorId,
          oldStatus: current.status,
          newStatus: statusFromLabel[input.status],
        },
      })
  }

  if (input.action === "restore") {
    await writeAuditLog({
      actorId,
      action: AuditAction.UPDATE,
      target: { table: "cases", id },
      changes: {
        restored: true,
        oldStatus: current.status,
        newStatus: DbCaseStatus.UNDER_REVIEW,
      },
    })
  } else if (input.status && statusFromLabel[input.status] !== current.status) {
    await writeAuditLog({
      actorId,
      action: input.status === "Resolved" || input.status === "Closed" ? AuditAction.ARCHIVE : AuditAction.STATUS_CHANGE,
      target: { table: "cases", id },
      changes: {
        oldStatus: current.status,
        newStatus: statusFromLabel[input.status],
      },
    })
  }

  if (input.assignedOfficer) {
    await writeAuditLog({
      actorId,
      action: AuditAction.ASSIGN,
      target: { table: "cases", id },
      changes: {
        oldOfficerId: current.assignedOfficerId,
        assignedOfficer: input.assignedOfficer,
      },
    })
  }

  return getCaseData(id)
}

export async function deleteCaseData(id: string) {
  const current = await prisma.case.findUnique({ where: { id } })
  if (!current) return null

  await writeAuditLog({
    action: AuditAction.DELETE,
    target: { table: "cases", id },
    changes: {
      caseType: current.type,
      status: current.status,
    },
  })

  return prisma.case.delete({ where: { id } })
}

export async function createCaseNoteData(id: string, note: string) {
  const targetCase = await prisma.case.findUnique({ where: { id } })
  if (!targetCase) return null

  const actor = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } })
  if (!actor) return null

  return prisma.auditLog.create({
    data: {
      actorId: actor.id,
      action: AuditAction.UPDATE,
      targetTable: "cases",
      targetId: id,
      changes: { note },
    },
  })
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
        changes: { requestInfo: message },
      },
    })
  }

  return notification
}

export async function getDashboardData() {
  const [cases, officers, users] = await Promise.all([
    prisma.case.findMany({
      select: { id: true, status: true, priority: true, category: true, type: true, dateSubmitted: true },
      orderBy: { dateSubmitted: "desc" },
    }),
    prisma.officer.count(),
    prisma.user.count({ where: { role: UserRole.RESIDENT, isArchived: false } }),
  ])
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
    recentCases: cases.slice(0, 5).map((item) => ({
      id: item.id,
      title: item.type,
      category: categoryLabels[item.category],
      status:
        item.status === DbCaseStatus.RESOLVED
          ? "resolved"
          : statusLabels[item.status] === "Under Review"
            ? "under_review"
            : "pending",
      created_at: item.dateSubmitted.toISOString(),
    })),
  }
}

export async function getOperationsData() {
  const [officers, hearings] = await Promise.all([
    prisma.officer.findMany({ include: { user: true, cases: true, hearings: true }, orderBy: { fullName: "asc" } }),
    prisma.hearing.findMany({
      include: { case: { include: { complainant: true, respondent: true } }, officer: true },
      orderBy: { scheduledDate: "desc" },
    }),
  ])

  return {
    officers: officers.map((officer) => {
      const activeCases = officer.cases.filter((item) => statusLabels[item.status] !== "Resolved" && statusLabels[item.status] !== "Closed").length
      const resolvedCases = officer.cases.filter((item) => item.status === DbCaseStatus.RESOLVED).length
      const totalCases = officer.cases.length || 1
      return {
        id: officer.id,
        name: shortName(officer.fullName),
        fullName: officer.fullName,
        position: officer.roleTitle.replaceAll("_", " "),
        activeCases,
        resolvedCases,
        performance: Math.round((resolvedCases / totalCases) * 100),
        avgResponseTime: "No SLA data",
        cases: officer.cases.map((item) => ({
          id: item.id,
          caseNumber: caseNumber(item.id, item.dateSubmitted),
          title: item.type,
          status: statusLabels[item.status],
          priority: priorityLabels[item.priority],
        })),
      }
    }),
    mediationSessions: hearings.map((hearing) => ({
      id: hearing.id,
      caseId: caseNumber(hearing.case.id, hearing.case.dateSubmitted),
      parties: [hearing.case.complainant.fullName, hearing.case.respondent?.fullName ?? hearing.case.respondentName ?? "Respondent"].filter(Boolean),
      mediator: hearing.officer?.fullName ?? "Unassigned",
      scheduledDate: formatDate(hearing.scheduledDate),
      scheduledTime: hearing.scheduledTime,
      location: hearing.location,
      status: hearing.status === HearingStatus.COMPLETED ? "Completed" : "Scheduled",
      outcomeNotes: hearing.notes ?? "",
      agreementType: hearing.agreementType ?? "",
      followUpDate: formatDate(hearing.followUpDate),
    })),
    assignableCases: await prisma.case.findMany({
      where: {
        OR: [{ assignedOfficerId: null }, { status: DbCaseStatus.PENDING }, { status: DbCaseStatus.UNDER_REVIEW }],
      },
      select: { id: true, type: true, status: true, dateSubmitted: true },
      orderBy: { dateSubmitted: "desc" },
    }).then((items) => items.map((item) => ({
      id: item.id,
      caseNumber: caseNumber(item.id, item.dateSubmitted),
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

  if (!targetCase && input.caseId.startsWith("IRIS-")) {
    const cases = await prisma.case.findMany()
    targetCase = cases.find((item) => caseNumber(item.id, item.dateSubmitted) === input.caseId) ?? null
  }

  if (!targetCase) return null

  const officer = input.mediator ? await prisma.officer.findFirst({ where: { fullName: input.mediator } }) : null
  const hearingCount = await prisma.hearing.count({ where: { caseId: targetCase.id } })
  const actorId = await getSystemActorId()

  const hearing = await prisma.$transaction(async (tx) => {
    const created = await tx.hearing.create({
      data: {
        caseId: targetCase.id,
        conductedBy: officer?.id,
        hearingNumber: hearingCount + 1,
        stage: HearingStage.MEDIATION,
        scheduledDate: new Date(input.scheduledDate),
        scheduledTime: input.scheduledTime,
        location: input.location,
        status: HearingStatus.SCHEDULED,
      },
    })

    await tx.case.update({
      where: { id: targetCase.id },
      data: { status: DbCaseStatus.SCHEDULED },
    })

    if (actorId && targetCase.status !== DbCaseStatus.SCHEDULED) {
      await tx.caseStatusHistory.create({
        data: {
          caseId: targetCase.id,
          changedBy: actorId,
          oldStatus: targetCase.status,
          newStatus: DbCaseStatus.SCHEDULED,
        },
      })
    }

    return created
  })

  await writeAuditLog({
    actorId,
    action: AuditAction.CREATE,
    target: { table: "hearings", id: hearing.id },
    changes: {
      caseId: targetCase.id,
      scheduledDate: input.scheduledDate,
      scheduledTime: input.scheduledTime,
      mediator: input.mediator,
    },
  })

  return hearing
}

function getOutcomeStatus(agreementType: AgreementType) {
  if (agreementType === "amicable settlement") return HearingOutcome.RESOLVED
  if (agreementType === "non-settlement") return HearingOutcome.UNRESOLVED
  return HearingOutcome.ADJOURNED
}

function getCaseStatusAfterOutcome(agreementType: AgreementType, hasFollowUp: boolean) {
  if (hasFollowUp) return DbCaseStatus.SCHEDULED
  if (agreementType === "amicable settlement") return DbCaseStatus.RESOLVED
  if (agreementType === "non-settlement") return DbCaseStatus.UNRESOLVED
  return DbCaseStatus.ONGOING
}

export async function recordHearingOutcomeData(input: {
  hearingId: string
  outcomeNotes: string
  agreementType: AgreementType
  followUpDate?: string
  followUpTime?: string
  followUpLocation?: string
}) {
  const current = await prisma.hearing.findUnique({
    where: { id: input.hearingId },
    include: { case: true },
  })

  if (!current) return null

  const hasFollowUp = Boolean(input.followUpDate && input.followUpTime && input.followUpLocation)
  const nextCaseStatus = getCaseStatusAfterOutcome(input.agreementType, hasFollowUp)
  const actorId = await getSystemActorId()
  const notes = input.outcomeNotes.trim()
  const followUpDate = input.followUpDate ? new Date(input.followUpDate) : null

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.hearing.update({
      where: { id: input.hearingId },
      data: {
        status: HearingStatus.COMPLETED,
        outcome: getOutcomeStatus(input.agreementType),
        notes,
        agreementType: input.agreementType,
        followUpDate,
      },
    })

    if (input.agreementType !== "non-settlement") {
      await tx.settlement.upsert({
        where: { caseId: current.caseId },
        update: { agreementText: notes },
        create: {
          caseId: current.caseId,
          agreementText: notes,
        },
      })
    }

    if (hasFollowUp) {
      const hearingCount = await tx.hearing.count({ where: { caseId: current.caseId } })

      await tx.hearing.create({
        data: {
          caseId: current.caseId,
          conductedBy: current.conductedBy,
          hearingNumber: hearingCount + 1,
          stage: HearingStage.MEDIATION,
          scheduledDate: new Date(input.followUpDate as string),
          scheduledTime: input.followUpTime as string,
          location: input.followUpLocation as string,
          status: HearingStatus.SCHEDULED,
        },
      })
    }

    await tx.case.update({
      where: { id: current.caseId },
      data: {
        status: nextCaseStatus,
        isArchived: nextCaseStatus === DbCaseStatus.RESOLVED || nextCaseStatus === DbCaseStatus.UNRESOLVED,
        archivedAt:
          nextCaseStatus === DbCaseStatus.RESOLVED || nextCaseStatus === DbCaseStatus.UNRESOLVED
            ? new Date()
            : null,
        archivedReason:
          nextCaseStatus === DbCaseStatus.RESOLVED
            ? "Resolved through mediation"
            : nextCaseStatus === DbCaseStatus.UNRESOLVED
              ? "Unresolved mediation"
              : null,
      },
    })

    if (actorId && current.case.status !== nextCaseStatus) {
      await tx.caseStatusHistory.create({
        data: {
          caseId: current.caseId,
          changedBy: actorId,
          oldStatus: current.case.status,
          newStatus: nextCaseStatus,
        },
      })
    }

    return updated
  })

  await writeAuditLog({
    actorId,
    action: AuditAction.UPDATE,
    target: { table: "hearings", id: input.hearingId },
    changes: {
      caseId: current.caseId,
      agreementType: input.agreementType,
      followUpDate: input.followUpDate,
    },
  })

  return result
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

  return prisma.officer.create({
    data: {
      userId: user.id,
      fullName: input.fullName,
      roleTitle: input.roleTitle === "LUPON_MEMBER" ? OfficerRoleTitle.LUPON_MEMBER : OfficerRoleTitle.BPAT_OFFICER,
    },
  })
}

export async function assignCaseData(input: { caseId: string; officerId: string }) {
  return prisma.case.update({
    where: { id: input.caseId },
    data: {
      assignedOfficerId: input.officerId,
      status: DbCaseStatus.ASSIGNED,
    },
  })
}

export async function getReportsData() {
  const [dashboard, operations] = await Promise.all([getDashboardData(), getOperationsData()])
  const cases = await prisma.case.findMany({ include: { complainant: true } })
  const resolved = cases.filter((item) => item.status === DbCaseStatus.RESOLVED).length
  const topCategory = categoryPercentages(cases).sort((a, b) => b.value - a.value)[0]
  const streetCounts = new Map<string, {
    cases: number
    urgent: number
    points: Array<{
      id: string
      label: string
      name: string
      lat: number
      lng: number
      urgent: boolean
      recorded: boolean
      purok?: number | null
    }>
  }>()

  cases.forEach((item) => {
    const street = item.incidentStreet ?? item.complainant.street ?? "Unspecified"
    const current = streetCounts.get(street) ?? { cases: 0, urgent: 0, points: [] }
    const knownStreet = findEastTapinacStreet(street)
    const hasRecordedPoint = item.incidentLatitude !== null && item.incidentLongitude !== null
    const lat = hasRecordedPoint ? item.incidentLatitude : knownStreet?.lat
    const lng = hasRecordedPoint ? item.incidentLongitude : knownStreet?.lng
    const isUrgent = item.priority === DbCasePriority.URGENT || item.priority === DbCasePriority.HIGH

    current.cases += 1
    if (isUrgent) current.urgent += 1

    if (lat !== null && lat !== undefined && lng !== null && lng !== undefined) {
      current.points.push({
        id: item.id,
        label: caseNumber(item.id, item.dateSubmitted),
        name: street,
        lat,
        lng,
        urgent: isUrgent,
        recorded: hasRecordedPoint,
        purok: item.incidentPurok ?? knownStreet?.purok ?? null,
      })
    }

    streetCounts.set(street, current)
  })
  const topStreet = [...streetCounts.entries()].sort((a, b) => b[1].cases - a[1].cases)[0] ?? ["Unspecified", { cases: 0 }]

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
      topStreetCount: topStreet[1].cases,
      topCategory: topCategory?.name ?? "No cases",
      topCategoryCount: Math.round(((topCategory?.value ?? 0) / 100) * cases.length),
    },
    streetStats: [...streetCounts.entries()].map(([name, value]) => {
      const street = findEastTapinacStreet(name)
      return {
        name,
        cases: value.cases,
        urgent: value.urgent,
        lat: street?.lat,
        lng: street?.lng,
        points: value.points,
      }
    }),
    officerPerformance: operations.officers.slice(0, 5),
  }
}

function pageMeta(page: number, pageSize: number, total: number) {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

function normalizePage(value: number | undefined, fallback = 1) {
  return Number.isFinite(value) && value && value > 0 ? Math.floor(value) : fallback
}

function normalizePageSize(value: number | undefined, fallback: number, max = 50) {
  return Number.isFinite(value) && value && value > 0 ? Math.min(Math.floor(value), max) : fallback
}

export async function getAdminData(input?: {
  usersPage?: number
  usersLimit?: number
  announcementsPage?: number
  announcementsLimit?: number
  auditLogsPage?: number
  auditLogsLimit?: number
}) {
  const usersPage = normalizePage(input?.usersPage)
  const usersLimit = normalizePageSize(input?.usersLimit, 10)
  const announcementsPage = normalizePage(input?.announcementsPage)
  const announcementsLimit = normalizePageSize(input?.announcementsLimit, 3)
  const auditLogsPage = normalizePage(input?.auditLogsPage)
  const auditLogsLimit = normalizePageSize(input?.auditLogsLimit, 10)

  const [users, usersTotal, announcements, announcementsTotal, auditLogs, auditLogsTotal] = await Promise.all([
    prisma.user.findMany({
      where: { isArchived: false },
      orderBy: { createdAt: "desc" },
      take: usersLimit,
      skip: (usersPage - 1) * usersLimit,
      select: {
        id: true,
        fullName: true,
        email: true,
        street: true,
        createdAt: true,
        status: true,
      },
    }),
    prisma.user.count({ where: { isArchived: false } }),
    prisma.announcement.findMany({
      include: { author: { select: { fullName: true } } },
      orderBy: { publishedAt: "desc" },
      take: announcementsLimit,
      skip: (announcementsPage - 1) * announcementsLimit,
    }),
    prisma.announcement.count(),
    getAuditLogsData(auditLogsLimit, auditLogsPage),
    prisma.auditLog.count().catch(() => 0),
  ])

  return {
    users: users.map((user) => ({
      id: user.id,
      name: user.fullName,
      email: user.email,
      street: user.street ?? "Not set",
      registered: formatDate(user.createdAt),
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
    auditLogs,
    usersPagination: pageMeta(usersPage, usersLimit, usersTotal),
    announcementsPagination: pageMeta(announcementsPage, announcementsLimit, announcementsTotal),
    auditLogsPagination: pageMeta(auditLogsPage, auditLogsLimit, auditLogsTotal),
  }
}

export async function updateUserStatusData(id: string, status: "Verified" | "Suspended" | "Pending") {
  const nextStatus = status === "Verified" ? UserStatus.ACTIVE : status === "Suspended" ? UserStatus.SUSPENDED : UserStatus.INACTIVE
  const current = await prisma.user.findUnique({ where: { id }, select: { status: true } })
  const user = await prisma.user.update({ where: { id }, data: { status: nextStatus } })

  await writeAuditLog({
    action: AuditAction.UPDATE,
    target: { table: "users", id },
    changes: { oldStatus: current?.status, newStatus: nextStatus },
  })

  return user
}

export async function createAnnouncementData(input: { title: string; content: string }) {
  const author = await prisma.user.findFirst({ where: { role: UserRole.ADMIN } })
  if (!author) return null
  const announcement = await prisma.announcement.create({
    data: {
      createdBy: author.id,
      title: input.title,
      content: input.content,
    },
  })

  await writeAuditLog({
    actorId: author.id,
    action: AuditAction.CREATE,
    target: { table: "announcements", id: announcement.id },
    changes: { title: input.title },
  })

  return announcement
}

export async function updateAnnouncementData(id: string, input: { title: string; content: string }) {
  const current = await prisma.announcement.findUnique({ where: { id } })
  const announcement = await prisma.announcement.update({
    where: { id },
    data: {
      title: input.title,
      content: input.content,
    },
  })

  await writeAuditLog({
    action: AuditAction.UPDATE,
    target: { table: "announcements", id },
    changes: { oldTitle: current?.title, newTitle: input.title },
  })

  return announcement
}

export async function deleteAnnouncementData(id: string) {
  const current = await prisma.announcement.findUnique({ where: { id } })
  await writeAuditLog({
    action: AuditAction.DELETE,
    target: { table: "announcements", id },
    changes: { title: current?.title },
  })

  return prisma.announcement.delete({ where: { id } })
}

export async function getOfficerNames() {
  const officers = await prisma.officer.findMany({ select: { fullName: true }, orderBy: { fullName: "asc" } })
  return ["Unassigned", ...officers.map((officer) => officer.fullName)]
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

import {
  CaseCategory as DbCaseCategory,
  CasePriority as DbCasePriority,
  CaseStatus as DbCaseStatus,
  OfficerRoleTitle,
  Prisma,
  UserRole,
  UserStatus,
} from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { findEastTapinacStreet } from "@/lib/east-tapinac-geo"

type BpatPriority = "Urgent" | "High" | "Medium" | "Low"
type DispatchStatus = "Assigned" | "In Progress" | "Pending Review"

const activeStatuses: DbCaseStatus[] = [
  DbCaseStatus.PENDING,
  DbCaseStatus.UNDER_REVIEW,
  DbCaseStatus.ACCEPTED,
  DbCaseStatus.ASSIGNED,
  DbCaseStatus.SCHEDULED,
  DbCaseStatus.ONGOING,
]

const categoryLabels: Record<DbCaseCategory, string> = {
  DISPUTE: "Community Dispute",
  INJURY: "Violence or Threats",
  VAWC: "Harassment & Abuse",
  ORDINANCE_VIOLATION: "Public Disturbance",
  OTHER: "Other",
}

const priorityLabels: Record<DbCasePriority, BpatPriority> = {
  URGENT: "Urgent",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
}

const dispatchStatusLabels: Partial<Record<DbCaseStatus, DispatchStatus>> = {
  ASSIGNED: "Assigned",
  ONGOING: "In Progress",
  SCHEDULED: "Pending Review",
  ACCEPTED: "Pending Review",
  UNDER_REVIEW: "Pending Review",
  PENDING: "Pending Review",
}

const caseInclude = {
  complainant: true,
  assignedOfficer: true,
} satisfies Prisma.CaseInclude

type BpatCase = Prisma.CaseGetPayload<{ include: typeof caseInclude }>

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "Not set"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

function caseNumber(id: string) {
  return `IR-${id.slice(0, 3).toUpperCase()}`
}

function addressForCase(item: BpatCase) {
  return item.incidentLocation || item.complainant.locationAddress || item.complainant.street || item.respondentAddress || "East Tapinac"
}

function streetForCase(item: BpatCase) {
  return item.incidentStreet || item.complainant.street || "Unspecified"
}

function mapOpenCase(item: BpatCase) {
  return {
    id: item.id,
    caseNumber: caseNumber(item.id),
    title: item.type || item.details,
    street: streetForCase(item),
    address: addressForCase(item),
    category: categoryLabels[item.category],
    priority: priorityLabels[item.priority],
    dateSubmitted: formatDate(item.dateSubmitted),
    incidentDate: formatDate(item.incidentDate),
    status: item.status.replaceAll("_", " "),
    assignedTo: item.assignedOfficer?.fullName ?? null,
    complainant: item.complainant.fullName,
    complainantContact: item.complainant.contact ?? "Not provided",
    details: item.details,
  }
}

function mapAssignedCase(item: BpatCase) {
  const status = dispatchStatusLabels[item.status] ?? "Pending Review"
  return {
    id: item.id,
    caseNumber: caseNumber(item.id),
    title: item.type || item.details,
    street: streetForCase(item),
    address: addressForCase(item),
    category: categoryLabels[item.category],
    priority: priorityLabels[item.priority] === "Urgent" ? "High" : priorityLabels[item.priority],
    status,
    scheduledDate: formatDate(item.deadlineDate ?? item.updatedAt),
    eta: "Not tracked",
    complainant: item.complainant.fullName,
    complainantContact: item.complainant.contact ?? "Not provided",
    dateSubmitted: formatDate(item.dateSubmitted),
    incidentDate: formatDate(item.incidentDate),
    details: item.details,
  }
}

async function findOfficerByEmail(email?: string | null) {
  if (!email) return null

  return prisma.officer.findFirst({
    where: {
      user: {
        email: email.trim().toLowerCase(),
        role: UserRole.BPAT_OFFICER,
        isArchived: false,
      },
    },
  })
}

async function getOrCreateOfficer(email: string) {
  const existing = await findOfficerByEmail(email)
  if (existing) return existing

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: UserRole.BPAT_OFFICER,
      status: UserStatus.ACTIVE,
    },
    create: {
      email,
      fullName: email,
      role: UserRole.BPAT_OFFICER,
      status: UserStatus.ACTIVE,
    },
  })

  return prisma.officer.upsert({
    where: { userId: user.id },
    update: { fullName: user.fullName, roleTitle: OfficerRoleTitle.BPAT_OFFICER },
    create: {
      userId: user.id,
      fullName: user.fullName,
      roleTitle: OfficerRoleTitle.BPAT_OFFICER,
    },
  })
}

export async function getBpatOpenCasesData() {
  const cases = await prisma.case.findMany({
    where: {
      status: { in: activeStatuses },
      isArchived: false,
      assignedOfficerId: null,
    },
    include: caseInclude,
    orderBy: [{ priority: "desc" }, { dateSubmitted: "desc" }],
  })

  return cases.map(mapOpenCase)
}

export async function getBpatAssignedCasesData(email?: string | null) {
  const officer = await findOfficerByEmail(email)
  if (!officer) return []

  const cases = await prisma.case.findMany({
    where: {
      status: { in: activeStatuses },
      isArchived: false,
      assignedOfficerId: officer.id,
    },
    include: caseInclude,
    orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
  })

  return cases.map(mapAssignedCase)
}

export async function claimBpatCaseData(input: { caseId: string; email: string }) {
  if (!input.caseId || !input.email) {
    throw new Error("Case ID and officer email are required")
  }

  const officer = await getOrCreateOfficer(input.email)

  const updated = await prisma.case.update({
    where: { id: input.caseId },
    data: {
      assignedOfficerId: officer.id,
      status: DbCaseStatus.ASSIGNED,
    },
    include: caseInclude,
  })

  return mapOpenCase(updated)
}

export async function getBpatDashboardData(email?: string | null) {
  const [openCases, assignedCases] = await Promise.all([
    getBpatOpenCasesData(),
    getBpatAssignedCasesData(email),
  ])

  return {
    stats: {
      pending: openCases.filter((item) => !item.assignedTo).length,
      active: assignedCases.length,
      urgent: openCases.filter((item) => item.priority === "Urgent" || item.priority === "High").length,
    },
    assignments: assignedCases.slice(0, 3).map((item) => ({
      street: item.street,
      caseId: item.caseNumber,
      issue: item.title,
      priority: item.priority,
      eta: item.eta,
    })),
  }
}

export async function getBpatMapData() {
  const cases = await prisma.case.findMany({
    where: {
      status: { in: activeStatuses },
      isArchived: false,
    },
    include: caseInclude,
  })

  const total = Math.max(cases.length, 1)
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
  const categoryCounts = new Map<string, number>()

  cases.forEach((item) => {
    const street = streetForCase(item)
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
        label: caseNumber(item.id),
        name: street,
        lat,
        lng,
        urgent: isUrgent,
        recorded: hasRecordedPoint,
        purok: item.incidentPurok ?? knownStreet?.purok ?? null,
      })
    }

    streetCounts.set(street, current)

    const category = categoryLabels[item.category]
    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1)
  })

  const maxStreetCases = Math.max(...[...streetCounts.values()].map((item) => item.cases), 1)
  const colorForCount = (count: number) => {
    const pct = count / maxStreetCases
    if (pct >= 0.8) return "bg-red-500"
    if (pct >= 0.55) return "bg-orange-400"
    if (pct >= 0.3) return "bg-amber-400"
    return "bg-green-400"
  }

  const streetStats = [...streetCounts.entries()]
    .map(([name, value]) => ({
      name,
      cases: value.cases,
      urgent: value.urgent,
      trend: "0",
      color: colorForCount(value.cases),
      purok: findEastTapinacStreet(name)?.purok ?? null,
      points: value.points,
    }))
    .sort((a, b) => b.cases - a.cases)

  const categoryBreakdown = [...categoryCounts.entries()]
    .map(([label, count]) => ({
      label,
      count,
      pct: Math.round((count / total) * 100),
      color: label === "Violence or Threats" ? "bg-red-500" : label === "Public Disturbance" ? "bg-[var(--primary)]" : label === "Property & Theft" ? "bg-amber-500" : "bg-blue-400",
    }))
    .sort((a, b) => b.count - a.count)

  const recentHotspots = streetStats
    .filter((item) => item.urgent > 0 || item.cases >= maxStreetCases)
    .slice(0, 3)
    .map((item) => ({
      street: item.name,
      issue: `${item.urgent} urgent case${item.urgent === 1 ? "" : "s"} and ${item.cases} active case${item.cases === 1 ? "" : "s"}`,
      level: item.urgent >= 3 ? "Critical" : item.urgent > 0 ? "High" : "Medium",
    }))

  return {
    streetStats,
    categoryBreakdown,
    recentHotspots,
  }
}

export async function getBpatAdvisoriesData() {
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
    pinned: index < 2,
    forOfficers: false,
  }))
}

export async function getBpatChatThreadsData(email?: string | null) {
  const assignedCases = await getBpatAssignedCasesData(email)

  return assignedCases.map((item) => ({
    caseNumber: item.caseNumber,
    title: item.title,
    complainant: item.complainant,
    street: item.street,
    status: item.status,
    lastMessage: "No chat messages recorded in the database.",
    lastTime: item.scheduledDate,
    unread: 0,
    messages: [
      {
        id: item.id,
        from: "complainant",
        text: "No chat messages recorded in the database.",
        time: item.scheduledDate,
      },
    ],
  }))
}

import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { randomUUID } from "node:crypto"
import { AuditAction, CaseStatus, Prisma, UserRole } from "@/generated/prisma/client"
import { writeAuditLog } from "@/lib/audit-logs"
import { prisma } from "@/lib/prisma"

const activeChatStatuses: CaseStatus[] = [
  CaseStatus.PENDING,
  CaseStatus.UNDER_REVIEW,
  CaseStatus.ACCEPTED,
  CaseStatus.ASSIGNED,
  CaseStatus.SCHEDULED,
  CaseStatus.ONGOING,
]

const closedChatStatuses: CaseStatus[] = [
  CaseStatus.RESOLVED,
  CaseStatus.UNRESOLVED,
  CaseStatus.DISMISSED,
  CaseStatus.ARCHIVED,
  CaseStatus.REJECTED,
  CaseStatus.REFERRED,
]

const threadInclude = {
  complainant: true,
  assignedOfficer: { include: { user: true } },
  chatMessages: { orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.CaseInclude

type ChatCase = Prisma.CaseGetPayload<{ include: typeof threadInclude }>

function caseNumber(id: string, date: Date) {
  return `IRIS-${date.getFullYear()}-${id.slice(0, 8).toUpperCase()}`
}

function formatTime(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date))
}

function relativeTime(date: Date | string | null | undefined) {
  if (!date) return "No messages yet"
  const diffMs = Date.now() - new Date(date).getTime()
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))
  if (diffMinutes < 1) return "Just now"
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return "Yesterday"
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(date))
}

function mapMessage(message: ChatCase["chatMessages"][number]) {
  return {
    id: message.id,
    from: message.senderRole === "complainant" ? "complainant" : "officer",
    text: message.message,
    time: formatTime(message.createdAt),
  }
}

function isProgressQuestion(message: string) {
  return /\b(progress|status|update|what happened|details?|result|resolved|closed)\b/i.test(message)
}

function canDiscussProgress(status: CaseStatus) {
  return closedChatStatuses.includes(status)
}

async function getAdminActorId(email?: string) {
  const admin = await prisma.user.findFirst({
    where: email
      ? { email: email.trim().toLowerCase(), role: UserRole.ADMIN, isArchived: false }
      : { role: UserRole.ADMIN, isArchived: false },
    select: { id: true },
  })

  return admin?.id ?? null
}

function mapThread(item: ChatCase) {
  const latest = item.chatMessages.at(-1)
  return {
    caseId: item.id,
    caseNumber: caseNumber(item.id, item.dateSubmitted),
    title: item.type || item.details,
    complainant: item.complainant.fullName,
    officer: item.assignedOfficer?.fullName ?? "Unassigned",
    street: item.complainant.street ?? "Not specified",
    status: item.status.replaceAll("_", " "),
    lastMessage: latest?.message ?? "No messages yet.",
    lastTime: latest ? relativeTime(latest.createdAt) : "No messages",
    unread: 0,
    messages: item.chatMessages.map(mapMessage),
  }
}

async function findChatCase(caseId: string) {
  return prisma.case.findUnique({
    where: { id: caseId },
    include: threadInclude,
  })
}

export async function getOfficerChatThreadsData(email?: string | null) {
  if (!email) return []

  const officer = await prisma.officer.findFirst({
    where: {
      user: {
        email: email.trim().toLowerCase(),
        role: UserRole.BPAT_OFFICER,
        isArchived: false,
      },
    },
  })

  if (!officer) return []

  const cases = await prisma.case.findMany({
    where: {
      assignedOfficerId: officer.id,
      status: { in: activeChatStatuses },
      isArchived: false,
    },
    include: threadInclude,
    orderBy: { updatedAt: "desc" },
  })

  return cases.map(mapThread)
}

export async function getResidentChatThreadData(input: { caseId: string; email: string }) {
  const item = await findChatCase(input.caseId)
  if (!item || item.complainant.email !== input.email.trim().toLowerCase() || !item.assignedOfficerId) return null
  return mapThread(item)
}

export async function getAdminCaseChatThreadData(caseId: string) {
  const item = await findChatCase(caseId)
  return item ? mapThread(item) : null
}

export async function sendCaseChatMessageData(input: {
  caseId: string
  role: "resident" | "officer" | "admin"
  email?: string
  message: string
}) {
  const item = await findChatCase(input.caseId)
  if (!item || !input.message.trim()) return null

  const email = input.email?.trim().toLowerCase() ?? ""
  const isResident = input.role === "resident" && item.complainant.email === email
  const isOfficer = input.role === "officer" && item.assignedOfficer?.user.email === email
  const adminActorId = input.role === "admin" ? await getAdminActorId(email) : null
  const isAdmin = input.role === "admin" && Boolean(adminActorId)

  if (!isResident && !isOfficer && !isAdmin) return null

  await prisma.caseChatMessage.create({
    data: {
      caseId: item.id,
      senderId: isOfficer ? item.assignedOfficer!.userId : isAdmin ? adminActorId! : item.complainantId,
      senderRole: isResident ? "complainant" : input.role,
      message: input.message.trim(),
    },
  })

  if (isResident && isProgressQuestion(input.message) && !canDiscussProgress(item.status)) {
    await prisma.caseChatMessage.create({
      data: {
        caseId: item.id,
        senderId: item.assignedOfficer?.userId ?? (await getAdminActorId()) ?? item.complainantId,
        senderRole: "officer",
        message: "This case is still in progress, so progress details are not available in chat yet. Once the case is closed, you may ask for the final details or resolution summary.",
      },
    })
  }

  const updated = await findChatCase(item.id)
  return updated ? mapThread(updated) : null
}

export async function attachResidentCaseEvidenceData(input: {
  caseId: string
  email: string
  file: File
}) {
  const item = await findChatCase(input.caseId)
  const email = input.email.trim().toLowerCase()
  if (!item || item.complainant.email !== email || !item.assignedOfficerId) return null

  const originalName = input.file.name || "evidence"
  const extension = path.extname(originalName)
  const safeBase = path.basename(originalName, extension).replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 60) || "evidence"
  const fileName = `${Date.now()}-${randomUUID()}-${safeBase}${extension}`
  const uploadDir = path.join(process.cwd(), "public", "uploads", "evidence")
  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, fileName), Buffer.from(await input.file.arrayBuffer()))

  const fileUrl = `/uploads/evidence/${encodeURIComponent(fileName)}`
  const evidence = await prisma.evidence.create({
    data: {
      caseId: item.id,
      fileUrl,
      fileType: input.file.type || "application/octet-stream",
    },
  })

  await writeAuditLog({
    actorId: item.complainantId,
    action: AuditAction.CREATE,
    target: { table: "evidence", id: evidence.id },
    changes: {
      caseId: item.id,
      fileName: originalName,
      fileType: input.file.type,
    },
  })

  await prisma.caseChatMessage.create({
    data: {
      caseId: item.id,
      senderId: item.complainantId,
      senderRole: "complainant",
      message: `Attached evidence: ${originalName}`,
    },
  })

  const updated = await findChatCase(item.id)
  return updated ? mapThread(updated) : null
}

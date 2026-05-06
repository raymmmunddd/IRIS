import { Prisma, UserRole } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"

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
    from: message.senderRole === "officer" ? "officer" : "complainant",
    text: message.message,
    time: formatTime(message.createdAt),
  }
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

export async function sendCaseChatMessageData(input: {
  caseId: string
  email: string
  role: "resident" | "officer"
  message: string
}) {
  const item = await findChatCase(input.caseId)
  if (!item || !input.message.trim()) return null

  const email = input.email.trim().toLowerCase()
  const isResident = input.role === "resident" && item.complainant.email === email
  const isOfficer = input.role === "officer" && item.assignedOfficer?.user.email === email

  if (!isResident && !isOfficer) return null

  await prisma.caseChatMessage.create({
    data: {
      caseId: item.id,
      senderId: isOfficer ? item.assignedOfficer!.userId : item.complainantId,
      senderRole: isOfficer ? "officer" : "complainant",
      message: input.message.trim(),
    },
  })

  const updated = await findChatCase(item.id)
  return updated ? mapThread(updated) : null
}

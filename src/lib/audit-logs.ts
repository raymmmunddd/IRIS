import { AuditAction, Prisma, UserRole } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { enqueueTask } from "@/lib/task-queue"

type AuditTarget = {
  table: string
  id: string
}

type WriteAuditLogInput = {
  actorId?: string | null
  action: AuditAction
  target: AuditTarget
  changes?: Record<string, unknown>
}

export async function getSystemActorId() {
  const admin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN },
    select: { id: true },
  })

  return admin?.id ?? null
}

export async function writeAuditLog(input: WriteAuditLogInput) {
  const actorId = input.actorId ?? (await getSystemActorId())
  if (!actorId) return null

  return enqueueTask("audit-log", () =>
    prisma.auditLog.create({
      data: {
        actorId,
        action: input.action,
        targetTable: input.target.table,
        targetId: input.target.id,
        changes: (input.changes ?? {}) as Prisma.InputJsonValue,
      },
    }),
  )
}

export async function getAuditLogsData(limit = 50, page = 1) {
  const skip = Math.max(0, page - 1) * limit
  const logs = await prisma.auditLog
    .findMany({
      orderBy: { loggedAt: "desc" },
      take: limit,
      skip,
    })
    .catch((error) => {
      console.warn("Audit logs are unavailable:", error)
      return []
    })

  const actorIds = [...new Set(logs.map((log) => log.actorId))]
  const users = await prisma.user.findMany({
    where: { id: { in: actorIds } },
    select: { id: true, fullName: true, email: true },
  })
  const usersById = new Map(users.map((user) => [user.id, user]))

  return logs.map((log) => {
    const actor = usersById.get(log.actorId)

    return {
      id: log.id,
      action: log.action.replaceAll("_", " "),
      user: actor?.fullName ?? actor?.email ?? "System",
      target: `${log.targetTable}:${log.targetId.slice(0, 8)}`,
      timestamp: new Intl.DateTimeFormat("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(log.loggedAt),
      ip: "Not tracked",
    }
  })
}

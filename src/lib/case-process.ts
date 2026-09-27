import {
  CaseStatus as CaseProcessStatus,
  ExecutionMethod,
  RepudiatedBy,
  SettlementSource,
  CasePriority,
  CaseReviewStatus as DbCaseStatus,
  HearingOutcome,
  HearingStage,
  HearingStatus,
  type Prisma,
} from "@/generated/prisma/client"
import { randomUUID } from "node:crypto"
import {
  addBusinessDays,
  addCalendarMonths,
  businessDaysRemaining,
  countBusinessDaysBetween,
  todayInManila,
} from "@/lib/business-days"

const CASE_MONTHS = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"]

export function formatCaseNumber(year: number, month: number, number: number) {
  return `${CASE_MONTHS[month - 1]}-${number}-${String(year).slice(-2)}`
}

export const STATUS_DAY_ALLOTMENTS: Record<CaseProcessStatus, number | null> = {
  SCHEDULED: null,
  MEDIATION: 15,
  CONCILIATION: 15,
  ARBITRATION: null,
  RESOLVED: 10,
  REPUDIATION: null,
  DISMISSED: null,
  WITHDRAWN: null,
}

export type CaseProcessEvent =
  | "hearing_scheduled"
  | "not_settled"
  | "settled"
  | "absent"
  | "withdrawn"
  | "award_rendered"
  | "repudiated"
  | "resume"
  | "execution_needed"
  | "system_check"

export type CaseProcessPayload = {
  reason?: unknown
  arbitration_agreement_signed?: unknown
  repudiated_by?: unknown
  absent_by?: unknown
}

export type CaseProcessState = {
  id?: string
  currentStatus: CaseProcessStatus
  previousStatus: CaseProcessStatus | null
  statusEnteredDate: Date
  statusDaysAllotted: number | null
  mediationAttemptCount: number
  conciliationAttemptCount: number
  absenceCount: number
  arbitrationAgreementSigned: boolean
  arbitrationAgreementDate: Date | null
  arbitrationAwardDate: Date | null
  settlementDate: Date | null
  settlementSource: SettlementSource | null
  repudiationDate: Date | null
  repudiationDeadline: Date | null
  repudiationReason: string | null
  repudiatedBy: RepudiatedBy | null
  closedDate: Date | null
  executionDeadline: Date | null
  executionMethod: ExecutionMethod | null
  needsCertificateToFileAction: boolean
  withdrawalReason: string | null
  dismissedReason: string | null
}

export class CaseProcessValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "CaseProcessValidationError"
  }
}

async function getDatabase() {
  return (await import("@/lib/prisma")).prisma
}

export function recalculateDayTracking(caseState: Pick<CaseProcessState, "statusEnteredDate" | "statusDaysAllotted"> & Partial<CaseProcessState>, now = new Date()) {
  const statusDaysElapsed = countBusinessDaysBetween(caseState.statusEnteredDate, todayInManila(now))
  const statusDaysRemaining = caseState.statusDaysAllotted == null
    ? null
    : caseState.statusDaysAllotted - statusDaysElapsed

  return {
    statusDaysElapsed,
    statusDaysRemaining,
    statusOverdue: statusDaysRemaining != null && statusDaysRemaining < 0,
  }
}

function requireText(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new CaseProcessValidationError(`${label} is required.`)
  }
  return value.trim()
}

function requireRepudiatedBy(value: unknown): RepudiatedBy {
  if (value === "complainant") return RepudiatedBy.COMPLAINANT
  if (value === "respondent") return RepudiatedBy.RESPONDENT
  throw new CaseProcessValidationError("Choose whether the complainant or respondent repudiated the settlement.")
}

function enteredStage(currentStatus: CaseProcessStatus, today: Date, updates: Partial<CaseProcessState> = {}) {
  return {
    ...updates,
    currentStatus,
    statusEnteredDate: today,
    statusDaysAllotted: STATUS_DAY_ALLOTMENTS[currentStatus],
    absenceCount: 0,
  }
}

export function transitionCaseState(
  current: CaseProcessState,
  event: CaseProcessEvent,
  payload: CaseProcessPayload = {},
  now = new Date(),
) {
  if (!Number.isInteger(current.mediationAttemptCount) || current.mediationAttemptCount < 0 || current.mediationAttemptCount > 3
    || !Number.isInteger(current.conciliationAttemptCount) || current.conciliationAttemptCount < 0 || current.conciliationAttemptCount > 3
    || !Number.isInteger(current.absenceCount) || current.absenceCount < 0) {
    throw new CaseProcessValidationError("Case attempt and absence counts are invalid.")
  }
  const today = todayInManila(now)
  const fromStatus = current.currentStatus
  let updates: Partial<CaseProcessState> = {}
  let details: string | null = null

  if (fromStatus === CaseProcessStatus.SCHEDULED && event === "hearing_scheduled") {
    updates = enteredStage(CaseProcessStatus.MEDIATION, today, { mediationAttemptCount: 1 })
    details = "First mediation hearing scheduled."
  } else if (fromStatus === CaseProcessStatus.MEDIATION && event === "not_settled") {
    if (current.mediationAttemptCount < 1 || current.mediationAttemptCount > 3) {
      throw new CaseProcessValidationError("Mediation attempts are already exhausted or have not started.")
    }
    if (current.mediationAttemptCount < 3) {
      updates = { mediationAttemptCount: current.mediationAttemptCount + 1 }
      details = `Mediation attempt ${current.mediationAttemptCount} was not settled.`
    } else {
      updates = enteredStage(CaseProcessStatus.CONCILIATION, today, { conciliationAttemptCount: 1 })
      details = "Mediation attempts exhausted; case moved to conciliation."
    }
  } else if (fromStatus === CaseProcessStatus.MEDIATION && event === "settled") {
    updates = enteredStage(CaseProcessStatus.RESOLVED, today, {
      previousStatus: fromStatus,
      settlementDate: today,
      settlementSource: SettlementSource.MEDIATION,
      repudiationDeadline: addBusinessDays(today, 10),
      executionDeadline: addCalendarMonths(today, 6),
    })
    details = "Agreement recorded through mediation."
  } else if (fromStatus === CaseProcessStatus.MEDIATION && event === "absent") {
    if (payload.absent_by !== "complainant" && payload.absent_by !== "respondent") {
      throw new CaseProcessValidationError("Choose which party was absent.")
    }
    if (payload.absent_by === "complainant") {
      const absenceCount = current.absenceCount + 1
      details = `Complainant absence recorded (${absenceCount}/3).`
      updates = { absenceCount }
      if (absenceCount >= 3) {
        updates = enteredStage(CaseProcessStatus.DISMISSED, today, {
          dismissedReason: "Complainant absent 3 times during mediation",
        })
        details = "Case dismissed after three complainant absences during mediation."
      }
    } else {
      details = "Respondent absence recorded during mediation."
    }
  } else if (fromStatus === CaseProcessStatus.MEDIATION && event === "withdrawn") {
    updates = enteredStage(CaseProcessStatus.WITHDRAWN, today, { withdrawalReason: requireText(payload.reason, "Withdrawal reason") })
    details = "Case withdrawn during mediation."
  } else if (fromStatus === CaseProcessStatus.CONCILIATION && event === "not_settled") {
    if (current.conciliationAttemptCount < 1 || current.conciliationAttemptCount > 3) {
      throw new CaseProcessValidationError("Conciliation attempts are already exhausted or have not started.")
    }
    if (current.conciliationAttemptCount < 3) {
      updates = { conciliationAttemptCount: current.conciliationAttemptCount + 1 }
      details = `Conciliation attempt ${current.conciliationAttemptCount} was not settled.`
    } else if (payload.arbitration_agreement_signed === true) {
      updates = enteredStage(CaseProcessStatus.ARBITRATION, today, {
        arbitrationAgreementSigned: true,
        arbitrationAgreementDate: today,
      })
      details = "Signed agreement recorded; case moved to arbitration."
    } else if (payload.arbitration_agreement_signed === false || payload.arbitration_agreement_signed === undefined) {
      updates = enteredStage(CaseProcessStatus.WITHDRAWN, today, {
        withdrawalReason: "Conciliation exhausted, no arbitration agreement; refer to Certificate to File Action",
        needsCertificateToFileAction: true,
      })
      details = "Conciliation exhausted without an arbitration agreement; certificate to file action is needed."
    } else {
      throw new CaseProcessValidationError("The arbitration agreement selection must be true or false.")
    }
  } else if (fromStatus === CaseProcessStatus.CONCILIATION && event === "settled") {
    updates = enteredStage(CaseProcessStatus.RESOLVED, today, {
      previousStatus: fromStatus,
      settlementDate: today,
      settlementSource: SettlementSource.CONCILIATION,
      repudiationDeadline: addBusinessDays(today, 10),
      executionDeadline: addCalendarMonths(today, 6),
    })
    details = "Agreement recorded through conciliation."
  } else if (fromStatus === CaseProcessStatus.CONCILIATION && event === "absent") {
    if (payload.absent_by !== "complainant" && payload.absent_by !== "respondent") {
      throw new CaseProcessValidationError("Choose which party was absent.")
    }
    if (payload.absent_by === "complainant") {
      const absenceCount = current.absenceCount + 1
      updates = { absenceCount }
      details = `Complainant absence recorded (${absenceCount}/3).`
      if (absenceCount >= 3) {
        updates = enteredStage(CaseProcessStatus.DISMISSED, today, {
          dismissedReason: "Complainant absent 3 times during conciliation",
        })
        details = "Case dismissed after three complainant absences during conciliation."
      }
    } else {
      details = "Respondent absence recorded during conciliation."
    }
  } else if (fromStatus === CaseProcessStatus.CONCILIATION && event === "withdrawn") {
    updates = enteredStage(CaseProcessStatus.WITHDRAWN, today, { withdrawalReason: requireText(payload.reason, "Withdrawal reason") })
    details = "Case withdrawn during conciliation."
  } else if (fromStatus === CaseProcessStatus.ARBITRATION && event === "award_rendered") {
    if (!current.arbitrationAgreementSigned) {
      throw new CaseProcessValidationError("An arbitration award requires a signed arbitration agreement.")
    }
    updates = enteredStage(CaseProcessStatus.RESOLVED, today, {
      previousStatus: fromStatus,
      settlementDate: today,
      settlementSource: SettlementSource.ARBITRATION,
      arbitrationAwardDate: today,
      repudiationDeadline: null,
      executionDeadline: addCalendarMonths(today, 6),
      closedDate: today,
    })
    details = "Arbitration award recorded."
  } else if (fromStatus === CaseProcessStatus.RESOLVED && event === "repudiated") {
    if (current.settlementSource === SettlementSource.ARBITRATION) {
      throw new CaseProcessValidationError("Arbitration awards cannot be repudiated.")
    }
    if (!current.settlementDate || !current.repudiationDeadline) {
      throw new CaseProcessValidationError("This settlement has no repudiation window.")
    }
    if (businessDaysRemaining(current.repudiationDeadline, now) < 0
      || countBusinessDaysBetween(current.settlementDate, today) > 10) {
      throw new CaseProcessValidationError("The 10 business day repudiation window has passed.")
    }
    updates = enteredStage(CaseProcessStatus.REPUDIATION, today, {
      repudiationDate: today,
      repudiatedBy: requireRepudiatedBy(payload.repudiated_by),
      repudiationReason: requireText(payload.reason, "Repudiation reason"),
    })
    details = "Settlement repudiation filed."
  } else if (fromStatus === CaseProcessStatus.RESOLVED && event === "system_check") {
    if (!current.closedDate && current.repudiationDeadline
      && businessDaysRemaining(current.repudiationDeadline, now) < 0
      && !current.repudiationDate) {
      updates = { closedDate: today }
      details = "Repudiation window elapsed; case closed."
    } else if (current.closedDate && current.executionDeadline
      && today.getTime() > current.executionDeadline.getTime()) {
      updates = { executionMethod: ExecutionMethod.COURT }
      details = "Execution deadline elapsed; court execution is required."
    }
  } else if (fromStatus === CaseProcessStatus.REPUDIATION && event === "resume") {
    if (current.previousStatus !== CaseProcessStatus.MEDIATION && current.previousStatus !== CaseProcessStatus.CONCILIATION) {
      throw new CaseProcessValidationError("This case has no mediation or conciliation stage to resume.")
    }
    updates = enteredStage(current.previousStatus, today, {
      settlementDate: null,
      settlementSource: null,
      repudiationDeadline: null,
      executionDeadline: null,
      closedDate: null,
    })
    details = `Case resumed in ${current.previousStatus.toLowerCase()}; attempt counts retained.`
  } else if (fromStatus === CaseProcessStatus.REPUDIATION && event === "withdrawn") {
    updates = enteredStage(CaseProcessStatus.WITHDRAWN, today, {
      withdrawalReason: "Parties did not continue after repudiation",
    })
    details = "Case withdrawn after repudiation."
  } else if (fromStatus === CaseProcessStatus.RESOLVED && event === "execution_needed") {
    if (!current.closedDate) {
      throw new CaseProcessValidationError("Execution can be tracked after the case is closed.")
    }
    updates = {
      executionMethod: current.executionDeadline && today.getTime() <= current.executionDeadline.getTime()
        ? ExecutionMethod.LUPON
        : ExecutionMethod.COURT,
    }
    details = `Execution should proceed through ${(updates.executionMethod ?? ExecutionMethod.COURT).toLowerCase()}.`
  } else {
    throw new CaseProcessValidationError(`The event “${event}” is not valid while the case is ${fromStatus.toLowerCase()}.`)
  }

  const toStatus = updates.currentStatus ?? fromStatus
  const businessDaysSpent = countBusinessDaysBetween(current.statusEnteredDate, today)
  const tracking = recalculateDayTracking({
    statusEnteredDate: updates.statusEnteredDate ?? current.statusEnteredDate,
    statusDaysAllotted: updates.statusDaysAllotted ?? current.statusDaysAllotted,
  }, now)

  return {
    updates,
    fromStatus,
    toStatus,
    businessDaysSpent,
    details,
    tracking,
  }
}

export function isCaseArchivable(current: Pick<CaseProcessState, "currentStatus" | "closedDate">): boolean {
  return current.currentStatus === CaseProcessStatus.DISMISSED
    || current.currentStatus === CaseProcessStatus.WITHDRAWN
    || (current.currentStatus === CaseProcessStatus.RESOLVED && current.closedDate != null)
}

type CreateCaseInput = {
  complainantId: string
  complainantName: string
  respondentName: string
  respondentAddress: string
  category: Prisma.CaseCreateInput["category"]
  type: string
  details: string
  filingDate: Date
  incidentDate: Date
  incidentAddress: string
  incidentStreet: string
  incidentLatitude?: number | null
  incidentLongitude?: number | null
  incidentAccuracy?: number | null
  priority?: CasePriority
  evidenceFiles?: Array<{ fileName: string; fileType: string; fileData: Uint8Array<ArrayBuffer> }>
}

export async function createCase(input: CreateCaseInput) {
  const required = [
    [input.complainantName, "Complainant name"],
    [input.respondentName, "Respondent name"],
    [input.respondentAddress, "Respondent address"],
    [input.category, "Category"],
    [input.type, "Type"],
    [input.details, "Details"],
    [input.incidentAddress, "Incident address"],
    [input.incidentStreet, "Incident street"],
  ] as const
  for (const [value, label] of required) {
    if (typeof value !== "string" || !value.trim()) throw new CaseProcessValidationError(`${label} is required.`)
  }
  if (input.type.trim().length > 100) throw new CaseProcessValidationError("Type must be 100 characters or fewer.")
  if (!Number.isFinite(input.filingDate.getTime()) || !Number.isFinite(input.incidentDate.getTime())) {
    throw new CaseProcessValidationError("Filing date and incident date must be valid dates.")
  }
  const hasLatitude = input.incidentLatitude != null
  const hasLongitude = input.incidentLongitude != null
  if (hasLatitude !== hasLongitude
    || (hasLatitude && (!Number.isFinite(input.incidentLatitude) || input.incidentLatitude! < -90 || input.incidentLatitude! > 90))
    || (hasLongitude && (!Number.isFinite(input.incidentLongitude) || input.incidentLongitude! < -180 || input.incidentLongitude! > 180))
    || (input.incidentAccuracy != null && (!Number.isFinite(input.incidentAccuracy) || input.incidentAccuracy < 0))) {
    throw new CaseProcessValidationError("Incident coordinates are invalid.")
  }

  const database = await getDatabase()
  const filingDate = todayInManila(input.filingDate)
  const year = filingDate.getUTCFullYear()
  const month = filingDate.getUTCMonth() + 1

  return database.$transaction(async (transaction) => {
    const [sequence] = await transaction.$queryRaw<Array<{ last_number: number }>>`
      INSERT INTO case_monthly_sequences (year, month, last_number)
      VALUES (${year}, ${month}, 1)
      ON CONFLICT (year, month)
      DO UPDATE SET last_number = case_monthly_sequences.last_number + 1
      RETURNING last_number
    `

    return transaction.case.create({
    data: {
      caseNumber: formatCaseNumber(year, month, sequence.last_number),
      complainant: { connect: { id: input.complainantId } },
      respondentName: input.respondentName.trim(),
      respondentAddress: input.respondentAddress.trim(),
      category: input.category,
      type: input.type.trim(),
      details: input.details.trim(),
      priority: input.priority ?? CasePriority.MEDIUM,
      status: DbCaseStatus.PENDING,
      currentStatus: CaseProcessStatus.SCHEDULED,
      filingDate,
      dateSubmitted: filingDate,
      incidentDate: input.incidentDate,
      incidentStreet: input.incidentStreet.trim(),
      incidentLocation: input.incidentAddress.trim(),
      incidentLatitude: input.incidentLatitude ?? null,
      incidentLongitude: input.incidentLongitude ?? null,
      incidentAccuracy: input.incidentAccuracy ?? null,
      statusEnteredDate: filingDate,
      statusDaysAllotted: STATUS_DAY_ALLOTMENTS.SCHEDULED,
      ...(input.evidenceFiles?.length ? {
        evidence: {
          create: input.evidenceFiles.map((file) => {
            const id = randomUUID()
            return {
              id,
              fileName: file.fileName,
              fileType: file.fileType,
              fileData: file.fileData,
              fileUrl: `/api/evidence/${id}`,
            }
          }),
        },
      } : {}),
      processHistory: {
        create: {
          event: "created",
          fromStatus: CaseProcessStatus.SCHEDULED,
          toStatus: CaseProcessStatus.SCHEDULED,
          details: "Case filed and scheduled for review.",
        },
      },
    },
    })
  })
}

export async function transitionStatus(caseId: string, event: CaseProcessEvent, payload: CaseProcessPayload = {}) {
  const database = await getDatabase()
  return database.$transaction(async (transaction) => {
    const current = await transaction.case.findUnique({ where: { id: caseId } })
    if (!current) return null
    const hearingStage = current.currentStatus === CaseProcessStatus.CONCILIATION
      ? HearingStage.CONCILIATION
      : current.currentStatus === CaseProcessStatus.MEDIATION || event === "hearing_scheduled"
        ? HearingStage.MEDIATION
        : null
    if (event === "hearing_scheduled") {
      const hearing = await transaction.hearing.findFirst({
        where: { caseId, stage: HearingStage.MEDIATION, status: HearingStatus.SCHEDULED },
      })
      if (!hearing) throw new CaseProcessValidationError("Schedule a mediation hearing before starting the mediation stage.")
    }
    if (hearingStage && (event === "not_settled" || event === "settled" || event === "absent")) {
      const hearing = await transaction.hearing.findFirst({
        where: { caseId, stage: hearingStage, status: HearingStatus.SCHEDULED },
      })
      if (!hearing) throw new CaseProcessValidationError("Schedule a hearing for this stage before recording its outcome.")
    }

    const result = transitionCaseState(current as CaseProcessState, event, payload)
    const updated = await transaction.case.update({
      where: { id: caseId },
      data: result.updates as Prisma.CaseUpdateInput,
    })
    const hearingOutcome = event === "settled"
      ? HearingOutcome.RESOLVED
      : event === "not_settled"
        ? HearingOutcome.UNRESOLVED
        : event === "absent"
          ? HearingOutcome.ADJOURNED
          : null
    if (hearingStage && hearingOutcome) {
      const hearing = await transaction.hearing.findFirst({
        where: { caseId, stage: hearingStage, status: HearingStatus.SCHEDULED },
        orderBy: [{ scheduledDate: "desc" }, { createdAt: "desc" }],
      })
      if (hearing) {
        await transaction.hearing.update({
          where: { id: hearing.id },
          data: {
            status: HearingStatus.COMPLETED,
            outcome: hearingOutcome,
            complainantAttended: event === "absent" ? payload.absent_by !== "complainant" : true,
            respondentAttended: event === "absent" ? payload.absent_by !== "respondent" : true,
          },
        })
      }
    }
    await transaction.caseProcessHistory.create({
      data: {
        caseId,
        event,
        fromStatus: result.fromStatus,
        toStatus: result.toStatus,
        businessDaysSpent: result.businessDaysSpent,
        details: result.details,
      },
    })
    return { ...updated, ...result.tracking }
  })
}

export async function getCaseHistory(caseId: string) {
  const database = await getDatabase()
  return database.caseProcessHistory.findMany({
    where: { caseId },
    orderBy: { changedAt: "asc" },
  })
}

export async function archiveCase(caseId: string) {
  const database = await getDatabase()
  return database.$transaction(async (transaction) => {
    const item = await transaction.case.findUnique({ where: { id: caseId } })
    if (!item) return null
    if (!isCaseArchivable(item)) throw new CaseProcessValidationError("Only closed, dismissed, or withdrawn cases can be archived.")
    return transaction.case.update({ where: { id: caseId }, data: { isArchived: true, archivedAt: new Date() } })
  })
}

export async function unarchiveCase(caseId: string) {
  const database = await getDatabase()
  return database.$transaction(async (transaction) => {
    const item = await transaction.case.findUnique({ where: { id: caseId } })
    if (!item) return null
    return transaction.case.update({ where: { id: caseId }, data: { isArchived: false, archivedAt: null } })
  })
}

export async function checkOverdueCases() {
  const database = await getDatabase()
  const today = todayInManila()
  const candidates = await database.case.findMany({
    where: {
      isArchived: false,
      OR: [
        { currentStatus: CaseProcessStatus.RESOLVED, closedDate: null, repudiationDeadline: { not: null } },
        { currentStatus: CaseProcessStatus.RESOLVED, closedDate: { not: null }, executionDeadline: { lt: today } },
        { currentStatus: CaseProcessStatus.CONCILIATION, conciliationAttemptCount: { gte: 3 } },
      ],
    },
  })

  for (const item of candidates) {
    if (item.currentStatus === CaseProcessStatus.CONCILIATION && item.conciliationAttemptCount >= 3) {
      if (!item.needsCertificateToFileAction) {
        await database.case.update({ where: { id: item.id }, data: { needsCertificateToFileAction: true } })
      }
      continue
    }

    if (item.currentStatus === CaseProcessStatus.RESOLVED && !item.closedDate && item.repudiationDeadline
      && businessDaysRemaining(item.repudiationDeadline) < 0 && !item.repudiationDate) {
      await transitionStatus(item.id, "system_check")
    } else if (item.closedDate && item.executionDeadline && today.getTime() > item.executionDeadline.getTime()
      && item.executionMethod !== ExecutionMethod.COURT) {
      await database.case.update({ where: { id: item.id }, data: { executionMethod: ExecutionMethod.COURT } })
    }
  }

  const cases = await database.case.findMany({ where: { isArchived: false } })
  return cases.flatMap((item) => {
    const tracking = recalculateDayTracking(item as CaseProcessState)
    return tracking.statusOverdue ? [{ id: item.id, currentStatus: item.currentStatus, ...tracking }] : []
  })
}

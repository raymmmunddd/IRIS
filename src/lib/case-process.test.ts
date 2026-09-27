import assert from "node:assert/strict"
import test from "node:test"
import { CaseStatus as CaseProcessStatus, SettlementSource } from "@/generated/prisma/client"
import { addBusinessDays } from "@/lib/business-days"
import {
  isCaseArchivable,
  formatCaseNumber,
  recalculateDayTracking,
  transitionCaseState,
  type CaseProcessState,
} from "@/lib/case-process"

function state(overrides: Partial<CaseProcessState> = {}): CaseProcessState {
  return {
    currentStatus: CaseProcessStatus.MEDIATION,
    previousStatus: null,
    statusEnteredDate: new Date("2026-09-01T00:00:00.000Z"),
    statusDaysAllotted: 15,
    mediationAttemptCount: 1,
    conciliationAttemptCount: 0,
    absenceCount: 0,
    arbitrationAgreementSigned: false,
    arbitrationAgreementDate: null,
    arbitrationAwardDate: null,
    settlementDate: null,
    settlementSource: null,
    repudiationDate: null,
    repudiationDeadline: null,
    repudiationReason: null,
    repudiatedBy: null,
    closedDate: null,
    executionDeadline: null,
    executionMethod: null,
    needsCertificateToFileAction: false,
    withdrawalReason: null,
    dismissedReason: null,
    ...overrides,
  }
}

test("case numbers use the month sequence and two-digit year format", () => {
  assert.equal(formatCaseNumber(2026, 3, 23), "MARCH-23-26")
  assert.equal(formatCaseNumber(2026, 4, 1), "APRIL-1-26")
})

test("settlement reaches resolved and closes after its 10 business-day window", () => {
  const resolved = transitionCaseState(state(), "settled", {}, new Date("2026-09-01T04:00:00.000Z"))
  assert.equal(resolved.toStatus, CaseProcessStatus.RESOLVED)
  assert.equal(resolved.updates.settlementSource, SettlementSource.MEDIATION)
  assert.equal(resolved.updates.statusDaysAllotted, 10)
  const afterSettlement = { ...state(), ...resolved.updates } as CaseProcessState
  const closed = transitionCaseState(afterSettlement, "system_check", {}, new Date("2026-09-17T04:00:00.000Z"))
  assert.equal(closed.updates.closedDate?.toISOString().slice(0, 10), "2026-09-17")
})

test("arbitration award is immediately binding and closes without a repudiation window", () => {
  const result = transitionCaseState(state({
    currentStatus: CaseProcessStatus.ARBITRATION,
    arbitrationAgreementSigned: true,
  }), "award_rendered", {}, new Date("2026-09-10T04:00:00.000Z"))
  assert.equal(result.toStatus, CaseProcessStatus.RESOLVED)
  assert.equal(result.updates.repudiationDeadline, null)
  assert.equal(result.updates.closedDate?.toISOString().slice(0, 10), "2026-09-10")
})

test("mediation becomes overdue after its 15th business day", () => {
  const due = addBusinessDays("2026-09-01", 15)
  const overdueDate = addBusinessDays(due, 1)
  const tracking = recalculateDayTracking(state(), overdueDate)
  assert.equal(tracking.statusDaysElapsed, 16)
  assert.equal(tracking.statusDaysRemaining, -1)
  assert.equal(tracking.statusOverdue, true)
})

test("mediation attempts share one clock and the third failure starts conciliation", () => {
  const firstRepeat = transitionCaseState(state(), "not_settled", {}, new Date("2026-09-10T04:00:00.000Z"))
  assert.equal(firstRepeat.updates.mediationAttemptCount, 2)
  assert.equal(firstRepeat.updates.statusEnteredDate, undefined)

  const thirdAttempt = transitionCaseState(state({ mediationAttemptCount: 3, absenceCount: 2 }), "not_settled", {}, new Date("2026-09-11T04:00:00.000Z"))
  assert.equal(thirdAttempt.toStatus, CaseProcessStatus.CONCILIATION)
  assert.equal(thirdAttempt.updates.conciliationAttemptCount, 1)
  assert.equal(thirdAttempt.updates.absenceCount, 0)
  assert.equal(thirdAttempt.updates.statusDaysAllotted, 15)
})

test("repudiation is accepted on the 10th business day and rejected on the 11th", () => {
  const settlementDate = new Date("2026-09-01T00:00:00.000Z")
  const resolved = state({
    currentStatus: CaseProcessStatus.RESOLVED,
    previousStatus: CaseProcessStatus.MEDIATION,
    statusDaysAllotted: 10,
    settlementDate,
    settlementSource: SettlementSource.MEDIATION,
    repudiationDeadline: addBusinessDays(settlementDate, 10),
  })
  assert.equal(transitionCaseState(resolved, "repudiated", {
    repudiated_by: "complainant", reason: "Agreement terms were not followed.",
  }, new Date("2026-09-15T04:00:00.000Z")).toStatus, CaseProcessStatus.REPUDIATION)
  assert.throws(() => transitionCaseState(resolved, "repudiated", {
    repudiated_by: "complainant", reason: "Late filing.",
  }, new Date("2026-09-16T04:00:00.000Z")), /window has passed/)
})

test("third failed conciliation attempt requires arbitration agreement or withdraws for certificate", () => {
  const exhausted = state({ currentStatus: CaseProcessStatus.CONCILIATION, mediationAttemptCount: 3, conciliationAttemptCount: 3 })
  const arbitration = transitionCaseState(exhausted, "not_settled", { arbitration_agreement_signed: true }, new Date("2026-09-10T04:00:00.000Z"))
  assert.equal(arbitration.toStatus, CaseProcessStatus.ARBITRATION)
  assert.equal(arbitration.updates.arbitrationAgreementSigned, true)

  const withdrawn = transitionCaseState(exhausted, "not_settled", { arbitration_agreement_signed: false }, new Date("2026-09-10T04:00:00.000Z"))
  assert.equal(withdrawn.toStatus, CaseProcessStatus.WITHDRAWN)
  assert.equal(withdrawn.updates.needsCertificateToFileAction, true)
})

test("third complainant absence dismisses a mediation case", () => {
  const result = transitionCaseState(state({ absenceCount: 2 }), "absent", { absent_by: "complainant" }, new Date("2026-09-10T04:00:00.000Z"))
  assert.equal(result.toStatus, CaseProcessStatus.DISMISSED)
  assert.equal(result.updates.dismissedReason, "Complainant absent 3 times during mediation")
})

test("resuming after repudiation restores the prior stage clock and keeps attempt counts", () => {
  const repudiated = state({
    currentStatus: CaseProcessStatus.REPUDIATION,
    previousStatus: CaseProcessStatus.CONCILIATION,
    statusDaysAllotted: null,
    mediationAttemptCount: 2,
    conciliationAttemptCount: 3,
  })
  const resumed = transitionCaseState(repudiated, "resume", {}, new Date("2026-09-10T04:00:00.000Z"))
  assert.equal(resumed.toStatus, CaseProcessStatus.CONCILIATION)
  assert.equal(resumed.updates.statusDaysAllotted, 15)
  assert.equal(resumed.updates.mediationAttemptCount, undefined)
  assert.equal(resumed.updates.conciliationAttemptCount, undefined)
})

test("archive validation rejects an active case and allows a closed case", () => {
  assert.equal(isCaseArchivable(state()), false)
  assert.equal(isCaseArchivable(state({ currentStatus: CaseProcessStatus.RESOLVED, closedDate: null })), false)
  assert.equal(isCaseArchivable(state({ currentStatus: CaseProcessStatus.RESOLVED, closedDate: new Date() })), true)
})

import assert from "node:assert/strict"
import test from "node:test"
import {
  addBusinessDays,
  businessDaysRemaining,
  countBusinessDaysBetween,
  isBusinessDay,
} from "@/lib/business-days"

test("addBusinessDays skips weekends", () => {
  assert.equal(addBusinessDays("2026-09-25", 1).toISOString().slice(0, 10), "2026-09-28")
})

test("countBusinessDaysBetween excludes weekends across multiple weeks", () => {
  assert.equal(countBusinessDaysBetween("2026-09-18", "2026-09-29"), 7)
})

test("business-day helpers support injectable holidays", () => {
  const holiday = new Date("2026-09-28T00:00:00.000Z")
  assert.equal(isBusinessDay("2026-09-28", [holiday]), false)
  assert.equal(addBusinessDays("2026-09-25", 1, [holiday]).toISOString().slice(0, 10), "2026-09-29")
})

test("businessDaysRemaining returns a negative count after a deadline", () => {
  const deadline = new Date("2026-09-25T00:00:00.000Z")
  const now = new Date("2026-09-28T04:00:00.000Z")
  assert.equal(businessDaysRemaining(deadline, now), -1)
})

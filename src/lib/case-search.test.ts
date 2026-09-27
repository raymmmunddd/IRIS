import assert from "node:assert/strict"
import test from "node:test"
import { matchesCaseSearch, matchesSearchValues } from "@/lib/case-search"

const caseRecord = {
  fullName: "Maria Santos",
  shortName: "Maria S.",
  caseNumber: "MARCH-23-26",
  assignedOfficer: "Officer Reyes",
  respondentName: "Juan Dela Cruz",
}

test("case search matches respondent names partially and without case sensitivity", () => {
  assert.equal(matchesCaseSearch(caseRecord, "DELA cR"), true)
})

test("case search keeps existing complainant, case number, and officer matches", () => {
  assert.equal(matchesCaseSearch(caseRecord, "maria san"), true)
  assert.equal(matchesCaseSearch(caseRecord, "march-23"), true)
  assert.equal(matchesCaseSearch(caseRecord, "OFFICER REY"), true)
})

test("case search safely handles missing respondents and whitespace", () => {
  assert.equal(matchesCaseSearch({ ...caseRecord, respondentName: null }, "Dela"), false)
  assert.equal(matchesCaseSearch(caseRecord, "  "), true)
  assert.equal(matchesSearchValues(["Noise complaint", "MARCH-23-26", "Mabini St.", "Rogelio Cruz"], "gelio"), true)
})

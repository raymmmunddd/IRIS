import type { CaseRecord } from "@/lib/types"

type CaseSearchFields = Pick<CaseRecord, "fullName" | "shortName" | "caseNumber" | "assignedOfficer" | "respondentName">

export function matchesCaseSearch(caseItem: CaseSearchFields, searchQuery: string) {
  return matchesSearchValues([
    caseItem.fullName,
    caseItem.shortName,
    caseItem.caseNumber,
    caseItem.assignedOfficer,
    caseItem.respondentName,
  ], searchQuery)
}

export function matchesSearchValues(values: readonly (string | null | undefined)[], searchQuery: string) {
  const query = searchQuery.trim().toLowerCase()
  if (!query) return true

  return values.some((value) => (value ?? "").toLowerCase().includes(query))
}

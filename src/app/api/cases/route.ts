import { NextResponse } from "next/server"
import { getCasesData, type CaseListFilters } from "@/lib/iris-data"
import type { CaseCategory, CasePriority, CaseProcessStatus } from "@/lib/types"

const categories: CaseCategory[] = [
  "Violence or Threats", "Harassment & Abuse", "Fraud & Scams", "Public Disturbance",
  "Property & Theft", "Community Dispute", "Child & Vulnerable Protection",
]
const priorities: CasePriority[] = ["Low", "Medium", "High", "Urgent"]
const processStatuses: CaseProcessStatus[] = [
  "SCHEDULED", "MEDIATION", "CONCILIATION", "ARBITRATION", "RESOLVED", "REPUDIATION", "DISMISSED", "WITHDRAWN",
]

function dateParameter(value: string | null, label: string) {
  if (value == null || value === "") return undefined
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00.000Z`) : null
  if (!parsed || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error(`${label} must be a valid date in YYYY-MM-DD format.`)
  }
  return value
}

function numericParameter(value: string | null, label: string, minimum: number, maximum: number) {
  if (value == null || value === "") return undefined
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < minimum || parsed > maximum) throw new Error(`${label} is invalid.`)
  return parsed
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryValue = searchParams.get("category") || undefined
    const priorityValue = searchParams.get("priority") || undefined
    const processStatusValue = searchParams.get("currentStatus") || undefined
    const typeValue = searchParams.get("type") || undefined
    const archivedValue = searchParams.get("isArchived")
    const includeArchivedValue = searchParams.get("includeArchived")
    if (categoryValue && !categories.includes(categoryValue as CaseCategory)) throw new Error("Category filter is invalid.")
    if (priorityValue && !priorities.includes(priorityValue as CasePriority)) throw new Error("Priority filter is invalid.")
    if (processStatusValue && !processStatuses.includes(processStatusValue as CaseProcessStatus)) throw new Error("Current status filter is invalid.")
    if (typeValue && typeValue.length > 100) throw new Error("Type filter must be 100 characters or fewer.")
    if (archivedValue !== null && archivedValue !== "true" && archivedValue !== "false") throw new Error("Archived filter must be true or false.")
    if (includeArchivedValue !== null && includeArchivedValue !== "true" && includeArchivedValue !== "false") throw new Error("Include archived filter must be true or false.")

    const filters: CaseListFilters = {
      ...(categoryValue ? { category: categoryValue as CaseCategory } : {}),
      ...(typeValue !== undefined ? { type: typeValue } : {}),
      ...(priorityValue ? { priority: priorityValue as CasePriority } : {}),
      ...(processStatusValue ? { currentStatus: processStatusValue as CaseProcessStatus } : {}),
      ...(archivedValue !== null ? { isArchived: archivedValue === "true" } : {}),
      includeArchived: includeArchivedValue === "true",
      filingDateFrom: dateParameter(searchParams.get("filingDateFrom"), "Filing date start"),
      filingDateTo: dateParameter(searchParams.get("filingDateTo"), "Filing date end"),
      incidentDateFrom: dateParameter(searchParams.get("incidentDateFrom"), "Incident date start"),
      incidentDateTo: dateParameter(searchParams.get("incidentDateTo"), "Incident date end"),
      minLatitude: numericParameter(searchParams.get("minLatitude"), "Minimum latitude", -90, 90),
      maxLatitude: numericParameter(searchParams.get("maxLatitude"), "Maximum latitude", -90, 90),
      minLongitude: numericParameter(searchParams.get("minLongitude"), "Minimum longitude", -180, 180),
      maxLongitude: numericParameter(searchParams.get("maxLongitude"), "Maximum longitude", -180, 180),
    }
    if (filters.filingDateFrom && filters.filingDateTo && filters.filingDateFrom > filters.filingDateTo) throw new Error("Filing date range is reversed.")
    if (filters.incidentDateFrom && filters.incidentDateTo && filters.incidentDateFrom > filters.incidentDateTo) throw new Error("Incident date range is reversed.")
    if (filters.minLatitude != null && filters.maxLatitude != null && filters.minLatitude > filters.maxLatitude) throw new Error("Latitude bounds are reversed.")
    if (filters.minLongitude != null && filters.maxLongitude != null && filters.minLongitude > filters.maxLongitude) throw new Error("Longitude bounds are reversed.")

    const data = await getCasesData(filters)
    return NextResponse.json({ success: true, message: "Cases loaded", data })
  } catch (error) {
    if (error instanceof Error && /filter|date|bounds|latitude|longitude|archived|category|priority|current status/i.test(error.message)) {
      return NextResponse.json({ success: false, message: error.message, data: [] }, { status: 400 })
    }
    console.error("Failed to load cases:", error)
    return NextResponse.json({ success: false, message: "Failed to load cases", data: [] }, { status: 500 })
  }
}

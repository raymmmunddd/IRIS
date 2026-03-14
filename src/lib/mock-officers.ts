import { mockCases } from "./mock-cases";

export const mockOfficers: string[] = Array.from(
  new Set(
    mockCases
      .map((c) => c.assignedOfficer)
      .filter((officer) => officer && officer !== "Unassigned")
  )
).sort();

export function getAvailableOfficers(): string[] {
  return ["Unassigned", ...mockOfficers];
}

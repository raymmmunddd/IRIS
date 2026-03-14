import type { CaseRecord, CaseStatus } from "./types";
import { mockCases } from "./mock-cases";

const STORAGE_KEY = "iris_cases";

function initializeStorage(): CaseRecord[] {
  if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : mockCases;
    } catch (e) {
      console.error("Failed to parse stored cases:", e);
      return mockCases;
    }
  }

  const enrichedCases = mockCases.map((caseRecord) => ({
    ...caseRecord,
    statusHistory: caseRecord.statusHistory || [
      { status: caseRecord.status as CaseStatus, changedAt: new Date().toISOString() },
    ],
    assignedOfficerHistory: caseRecord.assignedOfficerHistory || [
      { officer: caseRecord.assignedOfficer || "Unassigned", assignedAt: new Date().toISOString() },
    ],
    lastUpdated: caseRecord.lastUpdated || new Date().toISOString(),
    version: caseRecord.version || 1,
  }));

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enrichedCases));
  }

  return enrichedCases;
}

export function getCases(): CaseRecord[] {
  if (typeof window === "undefined") return mockCases;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return initializeStorage();
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to get cases:", e);
    return mockCases;
  }
}

export function getActiveCases(): CaseRecord[] {
  return getCases().filter((c) => c.status !== "Resolved" && c.status !== "Closed");
}

export function getArchivedCases(): CaseRecord[] {
  return getCases().filter((c) => c.status === "Resolved" || c.status === "Closed");
}

export function getCaseById(caseId: string): CaseRecord | undefined {
  return getCases().find((c) => c.id === caseId);
}

export function updateCaseStatus(caseId: string, newStatus: CaseStatus): CaseRecord | null {
  if (typeof window === "undefined") return null;

  try {
    const allCases = getCases();
    const caseIndex = allCases.findIndex((c) => c.id === caseId);
    if (caseIndex === -1) return null;

    const caseRecord = allCases[caseIndex];
    if (caseRecord.status === newStatus) return caseRecord;

    caseRecord.statusHistory = caseRecord.statusHistory || [
      { status: caseRecord.status, changedAt: caseRecord.lastUpdated || new Date().toISOString() },
    ];
    caseRecord.statusHistory.push({ status: newStatus, changedAt: new Date().toISOString() });

    caseRecord.status = newStatus;
    caseRecord.lastUpdated = new Date().toISOString();
    caseRecord.version = (caseRecord.version || 1) + 1;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allCases));
    return caseRecord;
  } catch (e) {
    console.error("Failed to update case status:", e);
    return null;
  }
}

export function updateAssignedOfficer(caseId: string, newOfficer: string): CaseRecord | null {
  if (typeof window === "undefined") return null;

  try {
    const allCases = getCases();
    const caseIndex = allCases.findIndex((c) => c.id === caseId);
    if (caseIndex === -1) return null;

    const caseRecord = allCases[caseIndex];
    if (caseRecord.assignedOfficer === newOfficer) return caseRecord;

    caseRecord.assignedOfficerHistory = caseRecord.assignedOfficerHistory || [
      { officer: caseRecord.assignedOfficer || "Unassigned", assignedAt: caseRecord.lastUpdated || new Date().toISOString() },
    ];
    caseRecord.assignedOfficerHistory.push({ officer: newOfficer, assignedAt: new Date().toISOString() });

    caseRecord.assignedOfficer = newOfficer;
    caseRecord.lastUpdated = new Date().toISOString();
    caseRecord.version = (caseRecord.version || 1) + 1;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allCases));
    return caseRecord;
  } catch (e) {
    console.error("Failed to update assigned officer:", e);
    return null;
  }
}

export function updateCase(caseId: string, updatedCase: Partial<CaseRecord>): CaseRecord | null {
  if (typeof window === "undefined") return null;

  try {
    const allCases = getCases();
    const caseIndex = allCases.findIndex((c) => c.id === caseId);
    if (caseIndex === -1) return null;

    const caseRecord = allCases[caseIndex];

    if (updatedCase.status && updatedCase.status !== caseRecord.status) {
      caseRecord.statusHistory = caseRecord.statusHistory || [
        { status: caseRecord.status, changedAt: caseRecord.lastUpdated || new Date().toISOString() },
      ];
      caseRecord.statusHistory.push({ status: updatedCase.status, changedAt: new Date().toISOString() });
      caseRecord.status = updatedCase.status;
    }

    if (updatedCase.assignedOfficer && updatedCase.assignedOfficer !== caseRecord.assignedOfficer) {
      caseRecord.assignedOfficerHistory = caseRecord.assignedOfficerHistory || [
        { officer: caseRecord.assignedOfficer || "Unassigned", assignedAt: caseRecord.lastUpdated || new Date().toISOString() },
      ];
      caseRecord.assignedOfficerHistory.push({ officer: updatedCase.assignedOfficer, assignedAt: new Date().toISOString() });
      caseRecord.assignedOfficer = updatedCase.assignedOfficer;
    }

    caseRecord.lastUpdated = new Date().toISOString();
    caseRecord.version = (caseRecord.version || 1) + 1;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allCases));
    return caseRecord;
  } catch (e) {
    console.error("Failed to update case:", e);
    return null;
  }
}

export function clearStorage(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function resetStorage(): void {
  if (typeof window !== "undefined") {
    clearStorage();
    initializeStorage();
  }
}

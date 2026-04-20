import type { CaseRecord, CaseStatus } from "./types";
import { mockCases } from "./mock-cases";
import { addActivityLog } from "./activityLogs";

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

type CreateResidentCaseInput = {
  fullName: string;
  category: CaseRecord["category"];
  incidentDate: string;
  contact: string;
  email: string;
  street: string;
  details: string;
};

function toShortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return "Resident";
  if (parts.length === 1) return parts[0];

  const firstInitial = parts[0].charAt(0).toUpperCase();
  const lastName = parts[parts.length - 1];
  return `${firstInitial}. ${lastName}`;
}

function nextCaseNumber(existingCases: CaseRecord[]): string {
  const now = new Date();
  const year = now.getFullYear();
  const nextSeq = existingCases.length + 1;
  return `IRIS-${year}-${String(nextSeq).padStart(3, "0")}`;
}

function inferPriority(category: CaseRecord["category"]): CaseRecord["priority"] {
  if (category === "Violence or Threats" || category === "Child & Vulnerable Protection") {
    return "High";
  }

  if (category === "Property & Theft" || category === "Fraud & Scams") {
    return "Medium";
  }

  return "Low";
}

export function createResidentCaseReport(input: CreateResidentCaseInput): CaseRecord | null {
  if (typeof window === "undefined") return null;

  try {
    const allCases = getCases();
    const nowIso = new Date().toISOString();
    const nowDisplay = new Date().toLocaleDateString();
    const caseNumber = nextCaseNumber(allCases);

    const createdCase: CaseRecord = {
      id: `case_${Date.now()}`,
      caseNumber,
      fullName: input.fullName,
      shortName: toShortName(input.fullName),
      category: input.category,
      type: "Resident Report",
      priority: inferPriority(input.category),
      status: "Pending",
      assignedOfficer: "Unassigned",
      date: nowDisplay,
      gender: "Not specified",
      contact: input.contact,
      email: input.email,
      street: input.street,
      details: input.details,
      dateSubmitted: nowDisplay,
      incidentDate: input.incidentDate,
      evidence: 0,
      evidenceFiles: [],
      statusHistory: [{ status: "Pending" as CaseStatus, changedAt: nowIso, changedBy: "Resident Portal" }],
      assignedOfficerHistory: [{ officer: "Unassigned", assignedAt: nowIso, assignedBy: "System" }],
      lastUpdated: nowIso,
      version: 1,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify([createdCase, ...allCases]));

    addActivityLog({
      label: "Resident report filed",
      detail: `${caseNumber} was submitted under ${input.category}.`,
      category: "cases",
      status: "Verified",
      timestamp: nowIso,
    });

    return createdCase;
  } catch (e) {
    console.error("Failed to create resident case report:", e);
    return null;
  }
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

    addActivityLog({
      label: "Case status updated",
      detail: `${caseRecord.caseNumber} is now ${newStatus}.`,
      category: "cases",
      status: "Verified",
      timestamp: caseRecord.lastUpdated,
    });

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

    addActivityLog({
      label: "Officer assignment updated",
      detail: `${newOfficer} was assigned to ${caseRecord.caseNumber}.`,
      category: "cases",
      status: "Verified",
      timestamp: caseRecord.lastUpdated,
    });

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
    let activityDetails: string[] = [];

    if (updatedCase.status && updatedCase.status !== caseRecord.status) {
      caseRecord.statusHistory = caseRecord.statusHistory || [
        { status: caseRecord.status, changedAt: caseRecord.lastUpdated || new Date().toISOString() },
      ];
      caseRecord.statusHistory.push({ status: updatedCase.status, changedAt: new Date().toISOString() });
      caseRecord.status = updatedCase.status;
      activityDetails.push(`status changed to ${updatedCase.status}`);
    }

    if (updatedCase.assignedOfficer && updatedCase.assignedOfficer !== caseRecord.assignedOfficer) {
      caseRecord.assignedOfficerHistory = caseRecord.assignedOfficerHistory || [
        { officer: caseRecord.assignedOfficer || "Unassigned", assignedAt: caseRecord.lastUpdated || new Date().toISOString() },
      ];
      caseRecord.assignedOfficerHistory.push({ officer: updatedCase.assignedOfficer, assignedAt: new Date().toISOString() });
      caseRecord.assignedOfficer = updatedCase.assignedOfficer;
      activityDetails.push(`assigned officer set to ${updatedCase.assignedOfficer}`);
    }

    caseRecord.lastUpdated = new Date().toISOString();
    caseRecord.version = (caseRecord.version || 1) + 1;

    if (activityDetails.length > 0) {
      addActivityLog({
        label: "Case updated",
        detail: `${caseRecord.caseNumber}: ${activityDetails.join(", ")}.`,
        category: "cases",
        status: "Verified",
        timestamp: caseRecord.lastUpdated,
      });
    }

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

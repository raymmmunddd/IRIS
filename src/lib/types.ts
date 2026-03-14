export type CaseStatus = "Pending" | "Under Review" | "Mediation" | "Resolved" | "Closed";

export type CasePriority = "High" | "Medium" | "Low";

export type CaseCategory =
  | "Violence or Threats"
  | "Harassment & Abuse"
  | "Fraud & Scams"
  | "Public Disturbance"
  | "Property & Theft"
  | "Community Dispute"
  | "Child & Vulnerable Protection";

export interface EvidenceFile {
  id: string;
  name: string;
  type: "image" | "document";
  url: string;
  thumbnail: string;
  size: string;
  uploadedAt: string;
}

export interface StatusHistoryEntry {
  status: CaseStatus;
  changedAt: string;
}

export interface OfficerHistoryEntry {
  officer: string;
  assignedAt: string;
}

export interface CaseRecord {
  id: string;
  caseNumber: string;
  fullName: string;
  shortName: string;
  category: CaseCategory;
  type: string;
  priority: CasePriority;
  status: CaseStatus;
  assignedOfficer: string;
  date: string;
  gender: string;
  contact: string;
  email: string;
  street: string;
  details: string;
  dateSubmitted: string;
  incidentDate: string;
  evidence: number;
  evidenceFiles: EvidenceFile[];
  statusHistory?: StatusHistoryEntry[];
  assignedOfficerHistory?: OfficerHistoryEntry[];
  lastUpdated?: string;
  version?: number;
}

export type Officer = string;

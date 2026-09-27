export type CaseStatus = "Pending" | "Under Review" | "Mediation" | "Resolved" | "Closed" | "Dismissed";

export type CaseProcessStatus = "SCHEDULED" | "MEDIATION" | "CONCILIATION" | "ARBITRATION" | "RESOLVED" | "REPUDIATION" | "DISMISSED" | "WITHDRAWN";

export type CasePriority = "Urgent" | "High" | "Medium" | "Low";

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
  changedBy?: string;
}

export interface OfficerHistoryEntry {
  officer: string;
  assignedAt: string;
  assignedBy?: string;
}

export interface CaseActivityEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  actor?: string;
}

export interface CaseProcessHistoryEntry {
  id: string;
  event: string;
  fromStatus: CaseProcessStatus;
  toStatus: CaseProcessStatus;
  changedAt: string;
  businessDaysSpent: number;
  details?: string | null;
}

export interface CaseRecord {
  id: string;
  caseNumber: string;
  fullName: string;
  shortName: string;
  category: string;
  type: string;
  priority: CasePriority;
  status: CaseStatus;
  currentStatus?: CaseProcessStatus;
  previousStatus?: CaseProcessStatus | null;
  statusEnteredDate?: string;
  statusDaysAllotted?: number | null;
  statusDaysElapsed?: number;
  statusDaysRemaining?: number | null;
  statusOverdue?: boolean;
  mediationAttemptCount?: number;
  conciliationAttemptCount?: number;
  absenceCount?: number;
  arbitrationAgreementSigned?: boolean;
  arbitrationAgreementDate?: string | null;
  arbitrationAwardDate?: string | null;
  settlementDate?: string | null;
  settlementSource?: "MEDIATION" | "CONCILIATION" | "ARBITRATION" | null;
  repudiationDate?: string | null;
  repudiationDeadline?: string | null;
  repudiationReason?: string | null;
  repudiatedBy?: "COMPLAINANT" | "RESPONDENT" | null;
  executionDeadline?: string | null;
  executionMethod?: "LUPON" | "COURT" | null;
  closedDate?: string | null;
  dismissalReason?: string | null;
  withdrawalReason?: string | null;
  needsCertificateToFileAction?: boolean;
  isArchived?: boolean;
  respondentName?: string | null;
  respondentAddress?: string | null;
  hearingDates?: string[];
  assignedOfficer: string;
  date: string;
  gender: string;
  contact: string;
  email: string;
  street: string;
  incidentLocation?: string;
  incidentLatitude?: number | null;
  incidentLongitude?: number | null;
  incidentAccuracy?: number | null;
  details: string;
  dateSubmitted: string;
  incidentDate: string;
  resolution?: string;
  evidence: number;
  evidenceFiles: EvidenceFile[];
  statusHistory?: StatusHistoryEntry[];
  assignedOfficerHistory?: OfficerHistoryEntry[];
  activityHistory?: CaseActivityEntry[];
  processHistory?: CaseProcessHistoryEntry[];
  lastUpdated?: string;
  version?: number;
}

export type Officer = string;

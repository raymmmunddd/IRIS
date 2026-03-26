// Mock data for the Operations page

export interface Officer {
  id: string;
  name: string;
  fullName: string;
  position: string;
  activeCases: number;
  resolvedCases: number;
  performance: number; // percentage
  avgResponseTime: string;
}

export const mockOfficers: Officer[] = [
  {
    id: "1",
    name: "Ricardo Augustine",
    fullName: "Ricardo Augustine",
    position: "Barangay Tanod Captain",
    activeCases: 12,
    resolvedCases: 45,
    performance: 92,
    avgResponseTime: "2.5 hours",
  },
  {
    id: "2",
    name: "Ramon Dela Cruz",
    fullName: "Ramon Dela Cruz",
    position: "Barangay Tanod",
    activeCases: 8,
    resolvedCases: 38,
    performance: 88,
    avgResponseTime: "3.1 hours",
  },
  {
    id: "3",
    name: "Sarah Lim",
    fullName: "Sarah Lim",
    position: "Barangay Tanod",
    activeCases: 6,
    resolvedCases: 52,
    performance: 95,
    avgResponseTime: "1.8 hours",
  },
];

export interface MediationSession {
  id: string;
  caseId: string;
  parties: string[];
  mediator: string;
  scheduledDate: string;
  scheduledTime: string;
  location: string;
  status: "Scheduled" | "Completed" | "Cancelled";
}

export const mockMediationSessions: MediationSession[] = [
  {
    id: "1",
    caseId: "IRIS-2026-001",
    parties: ["Juan Dela Cruz", "Jose Mercado"],
    mediator: "M. Santos",
    scheduledDate: "03/01/2026",
    scheduledTime: "10:00 AM",
    location: "Barangay Hall - Conference Room A",
    status: "Scheduled",
  },
  {
    id: "2",
    caseId: "IRIS-2026-012",
    parties: ["Anna Reyes", "Pedro Gonzales"],
    mediator: "M. Santos",
    scheduledDate: "02/28/2026",
    scheduledTime: "2:00 PM",
    location: "Barangay Hall - Conference Room B",
    status: "Completed",
  },
];

import { createHash } from "node:crypto"
import {
  AuditAction,
  CasePriority,
  CaseReviewStatus,
  CaseStatus as CaseProcessStatus,
  ExecutionMethod,
  Gender,
  HearingOutcome,
  HearingStage,
  HearingStatus,
  NotificationType,
  OfficerRoleTitle,
  Prisma,
  RepudiatedBy,
  SettlementSource,
  UserRole,
  UserStatus,
} from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"
import { addBusinessDays, addCalendarMonths, countBusinessDaysBetween, todayInManila } from "../src/lib/business-days"
import { formatCaseNumber } from "../src/lib/case-process"

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error("DATABASE_URL is not configured")

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) })

const PRESERVED_ACCOUNTS = [
  { email: "admin@gmail.com", role: UserRole.ADMIN },
  { email: "resident@gmail.com", role: UserRole.RESIDENT },
  { email: "officer@gmail.com", role: UserRole.BPAT_OFFICER },
] as const

const CASE_CATEGORIES = [
  "Violence or Threats",
  "Harassment & Abuse",
  "Fraud & Scams",
  "Public Disturbance",
  "Property & Theft",
  "Community Dispute",
  "Child & Vulnerable Protection",
] as const

type SeedResident = { fullName: string; email: string; contact: string; street: string; gender: Gender; status?: UserStatus; suspensionReason?: string }

const residents: SeedResident[] = [
  { fullName: "Ana Patricia Reyes", email: "ana.reyes.newkalalake@example.com", contact: "+63 917 210 4601", street: "Purok 1, Irving Street, Barangay New Kalalake, Olongapo City, Zambales", gender: Gender.FEMALE },
  { fullName: "Ramon Luis Santos", email: "ramon.santos.newkalalake@example.com", contact: "+63 918 324 5702", street: "Purok 2, Jones Street, Barangay New Kalalake, Olongapo City, Zambales", gender: Gender.MALE },
  { fullName: "Michelle Dizon Cruz", email: "michelle.cruz.newkalalake@example.com", contact: "+63 905 438 6803", street: "Purok 3, Kessing Street, Barangay New Kalalake, Olongapo City, Zambales", gender: Gender.FEMALE },
  { fullName: "Jose Miguel Garcia", email: "miguel.garcia.newkalalake@example.com", contact: "+63 917 542 7904", street: "Purok 4, Gordon Avenue, Barangay New Kalalake, Olongapo City, Zambales", gender: Gender.MALE },
  { fullName: "Liza Mae Bautista", email: "liza.bautista.newkalalake@example.com", contact: "+63 920 656 8105", street: "Purok 5, Murphy Street, Barangay New Kalalake, Olongapo City, Zambales", gender: Gender.FEMALE },
  { fullName: "Rogelio Aquino Flores", email: "rogelio.flores.newkalalake@example.com", contact: "+63 939 760 9206", street: "Purok 6, Norton Street, Barangay New Kalalake, Olongapo City, Zambales", gender: Gender.MALE },
  { fullName: "Katrina Joy Mendoza", email: "katrina.mendoza.newkalalake@example.com", contact: "+63 916 874 1307", street: "Purok 7, Gatbunton Street, Barangay New Kalalake, Olongapo City, Zambales", gender: Gender.FEMALE },
  { fullName: "Danilo Ramos Villanueva", email: "danilo.villanueva.newkalalake@example.com", contact: "+63 927 988 2408", street: "Purok 8, Rodriguez Street, Barangay New Kalalake, Olongapo City, Zambales", gender: Gender.MALE },
  { fullName: "Grace Ann Lim", email: "grace.lim.newkalalake@example.com", contact: "+63 915 192 3509", street: "14th Street, Barangay New Kalalake, Olongapo City, Zambales", gender: Gender.FEMALE, status: UserStatus.SUSPENDED, suspensionReason: "Repeatedly submitted reports containing abusive language after two written reminders." },
  { fullName: "Mark Anthony David", email: "mark.david.newkalalake@example.com", contact: "+63 906 206 4610", street: "E-16th Street, Barangay New Kalalake, Olongapo City, Zambales", gender: Gender.MALE, status: UserStatus.SUSPENDED, suspensionReason: "Account temporarily suspended after repeated misuse of the resident messaging feature." },
]

const bpatOfficers = [
  { fullName: "Marvin de la Cruz", email: "marvin.delacruz.bpat@example.com", contact: "+63 917 310 5721", street: "Purok 2, Jones Street, Barangay New Kalalake, Olongapo City, Zambales" },
  { fullName: "Jocelyn Mercado", email: "jocelyn.mercado.bpat@example.com", contact: "+63 918 421 6832", street: "Purok 4, Gordon Avenue, Barangay New Kalalake, Olongapo City, Zambales" },
  { fullName: "Edgar Manalo", email: "edgar.manalo.bpat@example.com", contact: "+63 905 532 7943", street: "Purok 6, Norton Street, Barangay New Kalalake, Olongapo City, Zambales" },
  { fullName: "Sheila Navarro", email: "sheila.navarro.bpat@example.com", contact: "+63 920 643 8054", street: "Purok 8, Rodriguez Street, Barangay New Kalalake, Olongapo City, Zambales" },
] as const

const officials = [
  { fullName: "Renato Villanueva", email: "renato.villanueva.lupon@example.com", contact: "+63 917 710 6411", street: "Purok 1, Irving Street, Barangay New Kalalake, Olongapo City, Zambales", roleTitle: OfficerRoleTitle.LUPON_CHAIR },
  { fullName: "Maribel Bautista", email: "maribel.bautista.lupon@example.com", contact: "+63 918 821 7522", street: "Purok 3, Kessing Street, Barangay New Kalalake, Olongapo City, Zambales", roleTitle: OfficerRoleTitle.LUPON_MEMBER },
  { fullName: "Lino Santos", email: "lino.santos.kapitan@example.com", contact: "+63 905 932 8633", street: "Purok 5, Murphy Street, Barangay New Kalalake, Olongapo City, Zambales", roleTitle: OfficerRoleTitle.BARANGAY_CAPTAIN },
  { fullName: "Rowena Lim", email: "rowena.lim.secretary@example.com", contact: "+63 920 143 9744", street: "Purok 7, Gatbunton Street, Barangay New Kalalake, Olongapo City, Zambales", roleTitle: OfficerRoleTitle.BARANGAY_SECRETARY },
] as const

type Scenario = {
  key: string
  currentStatus: CaseProcessStatus
  category: (typeof CASE_CATEGORIES)[number]
  type: string
  priority: CasePriority
  complainantIndex: number
  location: string
  latitude: number
  longitude: number
  details: string
  respondentName: string
  respondentAddress: string
  scheduledDayOffset?: number
  resolutionFrom?: typeof CaseProcessStatus.MEDIATION | typeof CaseProcessStatus.CONCILIATION | typeof CaseProcessStatus.ARBITRATION
  archived?: boolean
  evidenceCount?: number
}

const scenarios: Scenario[] = [
  { key: "boundary-01", currentStatus: CaseProcessStatus.SCHEDULED, category: "Community Dispute", type: "Boundary marker disagreement", priority: CasePriority.MEDIUM, complainantIndex: 0, location: "Purok 1, Irving Street, Barangay New Kalalake, Olongapo City, Zambales", latitude: 14.8390, longitude: 120.2843, details: "The parties disagree about the placement of a shared boundary marker. Both residents requested barangay assistance before making any changes to the fence.", respondentName: "Noel Bautista", respondentAddress: "Purok 2, Jones Street, Barangay New Kalalake, Olongapo City, Zambales", evidenceCount: 2 },
  { key: "noise-01", currentStatus: CaseProcessStatus.SCHEDULED, category: "Public Disturbance", type: "Late-night noise complaint", priority: CasePriority.LOW, complainantIndex: 1, location: "Purok 2, Jones Street, Barangay New Kalalake, Olongapo City, Zambales", latitude: 14.8394, longitude: 120.2840, details: "A resident reported repeated loud music after the community quiet hours. The parties agreed to attend a barangay conference.", respondentName: "Cesar Ramos", respondentAddress: "Purok 3, Kessing Street, Barangay New Kalalake, Olongapo City, Zambales" },
  { key: "threats-01", currentStatus: CaseProcessStatus.MEDIATION, category: "Violence or Threats", type: "Verbal threat during a neighborhood disagreement", priority: CasePriority.HIGH, complainantIndex: 2, location: "Purok 3, Kessing Street, Barangay New Kalalake, Olongapo City, Zambales", latitude: 14.8397, longitude: 120.2846, details: "A heated disagreement about a shared access path included a reported verbal threat. No physical injury was reported, and both parties were referred for mediation.", respondentName: "Rogelio Aquino Flores", respondentAddress: "Purok 6, Norton Street, Barangay New Kalalake, Olongapo City, Zambales", evidenceCount: 1 },
  { key: "harassment-01", currentStatus: CaseProcessStatus.MEDIATION, category: "Harassment & Abuse", type: "Repeated unwanted messages", priority: CasePriority.MEDIUM, complainantIndex: 3, location: "Purok 4, Gordon Avenue, Barangay New Kalalake, Olongapo City, Zambales", latitude: 14.8382, longitude: 120.2847, details: "The complainant reported repeated unwanted messages connected to a neighborhood disagreement and asked for the contact to stop. The parties have been invited to mediation.", respondentName: "Katrina Joy Mendoza", respondentAddress: "Purok 7, Gatbunton Street, Barangay New Kalalake, Olongapo City, Zambales" },
  { key: "property-01", currentStatus: CaseProcessStatus.CONCILIATION, category: "Property & Theft", type: "Disputed return of borrowed tools", priority: CasePriority.MEDIUM, complainantIndex: 4, location: "Purok 5, Murphy Street, Barangay New Kalalake, Olongapo City, Zambales", latitude: 14.8385, longitude: 120.2850, details: "The parties disagree about the return and condition of tools borrowed for a home repair. Mediation did not produce an agreement, so the matter advanced to conciliation.", respondentName: "Danilo Ramos Villanueva", respondentAddress: "Purok 8, Rodriguez Street, Barangay New Kalalake, Olongapo City, Zambales", evidenceCount: 2 },
  { key: "scam-01", currentStatus: CaseProcessStatus.SCHEDULED, category: "Fraud & Scams", type: "Online sale payment dispute", priority: CasePriority.HIGH, complainantIndex: 5, location: "Purok 6, Norton Street, Barangay New Kalalake, Olongapo City, Zambales", latitude: 14.8388, longitude: 120.2853, details: "A resident paid a local seller for a second-hand appliance that was not delivered. The parties have been asked to provide receipts and attend an initial barangay conference.", respondentName: "Joel Garcia", respondentAddress: "Purok 1, Irving Street, Barangay New Kalalake, Olongapo City, Zambales", evidenceCount: 2 },
  { key: "noise-02", currentStatus: CaseProcessStatus.MEDIATION, category: "Public Disturbance", type: "Recurring neighborhood noise", priority: CasePriority.LOW, complainantIndex: 6, location: "Purok 7, Gatbunton Street, Barangay New Kalalake, Olongapo City, Zambales", latitude: 14.8391, longitude: 120.2856, details: "The complainant reported recurring noise during evening hours. One mediation meeting has concluded without an agreement and another session is scheduled.", respondentName: "Michelle Dizon Cruz", respondentAddress: "Purok 3, Kessing Street, Barangay New Kalalake, Olongapo City, Zambales" },
  { key: "community-01", currentStatus: CaseProcessStatus.CONCILIATION, category: "Community Dispute", type: "Shared drainage maintenance dispute", priority: CasePriority.MEDIUM, complainantIndex: 7, location: "Purok 8, Rodriguez Street, Barangay New Kalalake, Olongapo City, Zambales", latitude: 14.8394, longitude: 120.2859, details: "Neighbors disagree about responsibility for keeping a shared drainage channel clear. The mediation attempts were unsuccessful and the case is now in conciliation.", respondentName: "Ana Patricia Reyes", respondentAddress: "Purok 1, Irving Street, Barangay New Kalalake, Olongapo City, Zambales", evidenceCount: 1 },
  { key: "fraud-02", currentStatus: CaseProcessStatus.ARBITRATION, category: "Fraud & Scams", type: "Unpaid installment for a used motorcycle", priority: CasePriority.URGENT, complainantIndex: 8, location: "Purok 2, Jones Street near E-14th Street, Barangay New Kalalake, Olongapo City, Zambales", latitude: 14.8380, longitude: 120.2854, details: "The complainant provided a written payment schedule for a second-hand motorcycle. Conciliation was unsuccessful; both parties signed the required arbitration agreement.", respondentName: "Ramon Luis Santos", respondentAddress: "Purok 2, Jones Street, Barangay New Kalalake, Olongapo City, Zambales", evidenceCount: 2 },
  { key: "harassment-02", currentStatus: CaseProcessStatus.RESOLVED, category: "Harassment & Abuse", type: "Neighbor communication dispute", priority: CasePriority.MEDIUM, complainantIndex: 9, location: "Purok 3, Kessing Street near E-16th Street, Barangay New Kalalake, Olongapo City, Zambales", latitude: 14.8383, longitude: 120.2858, details: "The parties agreed to stop direct unwanted contact and use the barangay office for any further communication about the shared access path.", respondentName: "Mark Anthony David", respondentAddress: "E-16th Street, Barangay New Kalalake, Olongapo City, Zambales", resolutionFrom: CaseProcessStatus.MEDIATION },
  { key: "disturbance-01", currentStatus: CaseProcessStatus.SCHEDULED, category: "Public Disturbance", type: "Use of amplified sound near residences", priority: CasePriority.LOW, complainantIndex: 10, location: "Purok 4, Gordon Avenue near E-14th Street, Barangay New Kalalake, Olongapo City, Zambales", latitude: 14.8386, longitude: 120.2860, details: "A resident requested assistance after amplified sound continued late into the evening. The barangay has opened a conference schedule and will hear both sides.", respondentName: "Jocelyn Mercado", respondentAddress: "Purok 4, Gordon Avenue, Barangay New Kalalake, Olongapo City, Zambales" },
  { key: "property-02", currentStatus: CaseProcessStatus.MEDIATION, category: "Property & Theft", type: "Damage to a shared gate", priority: CasePriority.HIGH, complainantIndex: 0, location: "Purok 5, Murphy Street near E-12th Street, Barangay New Kalalake, Olongapo City, Zambales", latitude: 14.8389, longitude: 120.2862, details: "A shared gate was damaged during a disagreement over access. The complainant provided photographs and the parties are attending mediation.", respondentName: "Edgar Manalo", respondentAddress: "Purok 6, Norton Street, Barangay New Kalalake, Olongapo City, Zambales", evidenceCount: 2 },
  { key: "community-02", currentStatus: CaseProcessStatus.CONCILIATION, category: "Community Dispute", type: "Boundary and fence alignment", priority: CasePriority.MEDIUM, complainantIndex: 1, location: "Purok 6, Norton Street near E-18th Street, Barangay New Kalalake, Olongapo City, Zambales", latitude: 14.8392, longitude: 120.2865, details: "The parties disagree about a fence line near a shared walkway. Three mediation attempts did not settle the issue, and a conciliation hearing is scheduled.", respondentName: "Liza Mae Bautista", respondentAddress: "Purok 5, Murphy Street, Barangay New Kalalake, Olongapo City, Zambales" },
  { key: "fraud-03", currentStatus: CaseProcessStatus.ARBITRATION, category: "Fraud & Scams", type: "Unreturned deposit for repair work", priority: CasePriority.URGENT, complainantIndex: 2, location: "Purok 7, Gatbunton Street near E-20th Street, Barangay New Kalalake, Olongapo City, Zambales", latitude: 14.8396, longitude: 120.2867, details: "A deposit for agreed home repair work was not returned after the work stopped. Both parties signed an arbitration agreement after conciliation was exhausted.", respondentName: "Ramon Luis Santos", respondentAddress: "Purok 2, Jones Street, Barangay New Kalalake, Olongapo City, Zambales", evidenceCount: 2 },
  { key: "boundary-02", currentStatus: CaseProcessStatus.RESOLVED, category: "Community Dispute", type: "Shared walkway access", priority: CasePriority.MEDIUM, complainantIndex: 3, location: "Purok 8, Rodriguez Street near E-22nd Street, Barangay New Kalalake, Olongapo City, Zambales", latitude: 14.8398, longitude: 120.2842, details: "The parties signed a conciliation agreement preserving access to the shared walkway and setting out how future maintenance costs will be shared.", respondentName: "Sheila Navarro", respondentAddress: "Purok 8, Rodriguez Street, Barangay New Kalalake, Olongapo City, Zambales", resolutionFrom: CaseProcessStatus.CONCILIATION },
  { key: "noise-03", currentStatus: CaseProcessStatus.RESOLVED, category: "Public Disturbance", type: "Repeated quiet-hours disturbance", priority: CasePriority.LOW, complainantIndex: 4, location: "12th Street at Murphy Street, Barangay New Kalalake, Olongapo City, Zambales", latitude: 14.8377, longitude: 120.2845, details: "The parties signed a mediation agreement setting evening quiet hours and a process for raising future concerns with the barangay.", respondentName: "Marvin de la Cruz", respondentAddress: "Purok 2, Jones Street, Barangay New Kalalake, Olongapo City, Zambales", resolutionFrom: CaseProcessStatus.MEDIATION },
  { key: "repudiation-01", currentStatus: CaseProcessStatus.REPUDIATION, category: "Property & Theft", type: "Repudiated repair-cost settlement", priority: CasePriority.HIGH, complainantIndex: 5, location: "14th Street near Gordon Avenue, Barangay New Kalalake, Olongapo City, Zambales", latitude: 14.8381, longitude: 120.2849, details: "A settlement for shared repair costs was signed and then repudiated by the respondent within the allowed period. The case has returned to the conciliation stage for follow-up.", respondentName: "Renato Villanueva", respondentAddress: "Purok 1, Irving Street, Barangay New Kalalake, Olongapo City, Zambales" },
  { key: "absence-01", currentStatus: CaseProcessStatus.DISMISSED, category: "Child & Vulnerable Protection", type: "Welfare concern follow-up", priority: CasePriority.HIGH, complainantIndex: 6, location: "15th Street near Irving Street, Barangay New Kalalake, Olongapo City, Zambales", latitude: 14.8384, longitude: 120.2852, details: "A welfare concern was referred to the appropriate barangay focal person. The complainant missed three scheduled mediation sessions, so the barangay closed the local case while retaining the referral record.", respondentName: "Rowena Lim", respondentAddress: "Purok 7, Gatbunton Street, Barangay New Kalalake, Olongapo City, Zambales", archived: true },
  { key: "withdrawn-01", currentStatus: CaseProcessStatus.WITHDRAWN, category: "Community Dispute", type: "Shared utility contribution dispute", priority: CasePriority.LOW, complainantIndex: 7, location: "16th Street near Jones Street, Barangay New Kalalake, Olongapo City, Zambales", latitude: 14.8387, longitude: 120.2855, details: "The complainant withdrew the report after the parties arranged a direct repayment plan. The barangay recorded the withdrawal and retained the initial mediation outcome.", respondentName: "Ramon Luis Santos", respondentAddress: "Purok 2, Jones Street, Barangay New Kalalake, Olongapo City, Zambales" },
  { key: "arbitration-award-01", currentStatus: CaseProcessStatus.RESOLVED, category: "Property & Theft", type: "Arbitration award for damaged property", priority: CasePriority.URGENT, complainantIndex: 8, location: "17th Street near Kessing Street, Barangay New Kalalake, Olongapo City, Zambales", latitude: 14.8390, longitude: 120.2859, details: "The parties signed an arbitration agreement after conciliation. The Lupon rendered an award for documented property damage, which is binding and recorded as closed.", respondentName: "Danilo Ramos Villanueva", respondentAddress: "Purok 8, Rodriguez Street, Barangay New Kalalake, Olongapo City, Zambales", resolutionFrom: CaseProcessStatus.ARBITRATION, archived: true, evidenceCount: 2 },
  { key: "scheduled-today-01", currentStatus: CaseProcessStatus.SCHEDULED, category: "Community Dispute", type: "Shared pathway access discussion", priority: CasePriority.MEDIUM, complainantIndex: 0, location: "Purok 1, Irving Street, Barangay New Kalalake, Olongapo City, Zambales", latitude: 14.8390, longitude: 120.2843, details: "The parties requested barangay assistance to agree on access hours for a shared pathway. Their first conference is scheduled for today.", respondentName: "Noel Bautista", respondentAddress: "Purok 2, Jones Street, Barangay New Kalalake, Olongapo City, Zambales", scheduledDayOffset: 0 },
  { key: "scheduled-day-1-01", currentStatus: CaseProcessStatus.SCHEDULED, category: "Public Disturbance", type: "Quiet-hours agreement meeting", priority: CasePriority.LOW, complainantIndex: 1, location: "Purok 2, Jones Street, Barangay New Kalalake, Olongapo City, Zambales", latitude: 14.8394, longitude: 120.2840, details: "Neighbors requested assistance in setting quiet hours after several late-night noise concerns. The initial conference is scheduled for the next day.", respondentName: "Cesar Ramos", respondentAddress: "Purok 3, Kessing Street, Barangay New Kalalake, Olongapo City, Zambales", scheduledDayOffset: 1 },
  { key: "scheduled-day-2-01", currentStatus: CaseProcessStatus.SCHEDULED, category: "Property & Theft", type: "Shared fence repair cost discussion", priority: CasePriority.MEDIUM, complainantIndex: 0, location: "Purok 3, Kessing Street, Barangay New Kalalake, Olongapo City, Zambales", latitude: 14.8397, longitude: 120.2846, details: "The parties asked the barangay to help clarify their respective contributions toward repairing a shared fence. An initial conference is scheduled in two days.", respondentName: "Rogelio Aquino Flores", respondentAddress: "Purok 6, Norton Street, Barangay New Kalalake, Olongapo City, Zambales", scheduledDayOffset: 2 },
  { key: "scheduled-day-3-01", currentStatus: CaseProcessStatus.SCHEDULED, category: "Fraud & Scams", type: "Local marketplace payment dispute", priority: CasePriority.HIGH, complainantIndex: 3, location: "Purok 4, Gordon Avenue, Barangay New Kalalake, Olongapo City, Zambales", latitude: 14.8382, longitude: 120.2847, details: "A resident requested assistance after paying for a used appliance that was not delivered. Both parties have been asked to attend an initial conference in three days.", respondentName: "Katrina Joy Mendoza", respondentAddress: "Purok 7, Gatbunton Street, Barangay New Kalalake, Olongapo City, Zambales", scheduledDayOffset: 3 },
  { key: "scheduled-day-4-01", currentStatus: CaseProcessStatus.SCHEDULED, category: "Harassment & Abuse", type: "Neighbor communication agreement", priority: CasePriority.MEDIUM, complainantIndex: 0, location: "Purok 5, Murphy Street, Barangay New Kalalake, Olongapo City, Zambales", latitude: 14.8385, longitude: 120.2850, details: "The complainant requested help setting boundaries for repeated unwanted messages. The parties are scheduled to meet with the barangay in four days.", respondentName: "Danilo Ramos Villanueva", respondentAddress: "Purok 8, Rodriguez Street, Barangay New Kalalake, Olongapo City, Zambales", scheduledDayOffset: 4 },
  { key: "scheduled-day-5-01", currentStatus: CaseProcessStatus.SCHEDULED, category: "Violence or Threats", type: "Disagreement follow-up conference", priority: CasePriority.HIGH, complainantIndex: 5, location: "Purok 6, Norton Street, Barangay New Kalalake, Olongapo City, Zambales", latitude: 14.8388, longitude: 120.2853, details: "A resident reported a verbal threat during a disagreement about shared access. No physical injury was reported; an officer will hear both parties at a conference in five days.", respondentName: "Joel Garcia", respondentAddress: "Purok 1, Irving Street, Barangay New Kalalake, Olongapo City, Zambales", scheduledDayOffset: 5 },
]

const announcements = [
  { title: "Barangay Hall Service Hours", content: "The barangay hall is open Monday to Friday, 8:00 a.m. to 5:00 p.m. Residents attending a case conference should arrive 15 minutes before their scheduled time." },
  { title: "Community Mediation Schedule", content: "Mediation and conciliation sessions are held at the Barangay New Kalalake Hall. Please bring any relevant receipts, photographs, or written agreements." },
  { title: "Drainage Clearing on Purok Streets", content: "Residents are encouraged to keep household waste out of the drainage channels. The barangay clean-up team will visit the puroks this week." },
  { title: "Updated Quiet Hours Reminder", content: "Please keep amplified sound at a considerate level during evening hours. Residents with unresolved noise concerns may request assistance from the barangay office." },
  { title: "Senior Citizen Assistance Desk", content: "The assistance desk will be available at the barangay hall on Wednesday morning for residents who need help with forms and referrals." },
  { title: "Community Safety Contact", content: "For urgent safety concerns, contact the barangay office or the on-duty BPAT officer. For non-urgent disputes, submit a report through the IRIS resident portal." },
  { title: "Barangay Assembly Notice", content: "Residents are invited to the monthly assembly at the covered court. The agenda includes community maintenance, safety updates, and open questions from residents." },
] as const

function stableId(namespace: string, key: string) {
  const bytes = createHash("sha256").update(`iris-seed:${namespace}:${key}`).digest().subarray(0, 16)
  bytes[6] = (bytes[6] & 0x0f) | 0x50
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Buffer.from(bytes).toString("hex")
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setUTCDate(result.getUTCDate() + days)
  return result
}

function laterDate(first: Date, second: Date) {
  return first.getTime() >= second.getTime() ? first : second
}

function caseReviewStatus(currentStatus: CaseProcessStatus) {
  if (currentStatus === CaseProcessStatus.SCHEDULED) return CaseReviewStatus.SCHEDULED
  if (currentStatus === CaseProcessStatus.RESOLVED) return CaseReviewStatus.RESOLVED
  if (currentStatus === CaseProcessStatus.DISMISSED) return CaseReviewStatus.DISMISSED
  if (currentStatus === CaseProcessStatus.WITHDRAWN) return CaseReviewStatus.UNRESOLVED
  return CaseReviewStatus.ONGOING
}

type ProcessStep = {
  event: string
  fromStatus: CaseProcessStatus
  toStatus: CaseProcessStatus
  details: string
}

type Workflow = {
  steps: ProcessStep[]
  mediationAttemptCount: number
  conciliationAttemptCount: number
  absenceCount: number
  previousStatus: CaseProcessStatus | null
  settlementSource: SettlementSource | null
  arbitrationAgreementSigned: boolean
  repudiatedBy: RepudiatedBy | null
  withdrawalReason: string | null
  dismissedReason: string | null
}

function buildWorkflow(scenario: Scenario, index: number): Workflow {
  const steps: ProcessStep[] = []
  let mediationAttemptCount = 0
  let conciliationAttemptCount = 0
  let absenceCount = 0
  let previousStatus: CaseProcessStatus | null = null
  let settlementSource: SettlementSource | null = null
  let arbitrationAgreementSigned = false
  let repudiatedBy: RepudiatedBy | null = null
  let withdrawalReason: string | null = null
  let dismissedReason: string | null = null

  const scheduleMediation = () => {
    mediationAttemptCount = 1
    steps.push({ event: "hearing_scheduled", fromStatus: CaseProcessStatus.SCHEDULED, toStatus: CaseProcessStatus.MEDIATION, details: "First mediation hearing scheduled." })
  }

  const mediationFailed = (attempts: number) => {
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      const movesToConciliation = attempt === 3
      if (!movesToConciliation) mediationAttemptCount += 1
      else conciliationAttemptCount = 1
      steps.push({
        event: "not_settled",
        fromStatus: CaseProcessStatus.MEDIATION,
        toStatus: movesToConciliation ? CaseProcessStatus.CONCILIATION : CaseProcessStatus.MEDIATION,
        details: movesToConciliation
          ? "Mediation attempts exhausted; case moved to conciliation."
          : `Mediation attempt ${attempt} was not settled.`,
      })
    }
  }

  const conciliationFailed = (attempts: number) => {
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      const movesToArbitration = attempt === 3
      if (!movesToArbitration) conciliationAttemptCount += 1
      steps.push({
        event: "not_settled",
        fromStatus: CaseProcessStatus.CONCILIATION,
        toStatus: movesToArbitration ? CaseProcessStatus.ARBITRATION : CaseProcessStatus.CONCILIATION,
        details: movesToArbitration
          ? "Conciliation attempts exhausted; signed agreement moved the case to arbitration."
          : `Conciliation attempt ${attempt} was not settled.`,
      })
    }
  }

  if (scenario.currentStatus === CaseProcessStatus.SCHEDULED) {
    // The case has been reviewed and is waiting for its first mediation hearing.
  } else {
    scheduleMediation()
  }

  if (scenario.currentStatus === CaseProcessStatus.MEDIATION) {
    const attemptsAlreadyStarted = 1 + (index % 3)
    mediationFailed(attemptsAlreadyStarted - 1)
    mediationAttemptCount = attemptsAlreadyStarted
  } else if (scenario.currentStatus === CaseProcessStatus.CONCILIATION) {
    mediationFailed(3)
  } else if (scenario.currentStatus === CaseProcessStatus.ARBITRATION) {
    mediationFailed(3)
    conciliationFailed(3)
    arbitrationAgreementSigned = true
  } else if (scenario.currentStatus === CaseProcessStatus.RESOLVED) {
    if (scenario.resolutionFrom === CaseProcessStatus.ARBITRATION) {
      mediationFailed(3)
      conciliationFailed(3)
      arbitrationAgreementSigned = true
      previousStatus = CaseProcessStatus.ARBITRATION
      steps.push({ event: "award_rendered", fromStatus: CaseProcessStatus.ARBITRATION, toStatus: CaseProcessStatus.RESOLVED, details: "Arbitration award recorded." })
    } else if (scenario.resolutionFrom === CaseProcessStatus.CONCILIATION) {
      mediationFailed(3)
      conciliationAttemptCount = 1
      conciliationFailed(1)
      steps.push({ event: "settled", fromStatus: CaseProcessStatus.CONCILIATION, toStatus: CaseProcessStatus.RESOLVED, details: "Agreement recorded through conciliation." })
      previousStatus = CaseProcessStatus.CONCILIATION
      settlementSource = SettlementSource.CONCILIATION
    } else {
      mediationAttemptCount = 1 + (index % 2)
      mediationFailed(mediationAttemptCount - 1)
      steps.push({ event: "settled", fromStatus: CaseProcessStatus.MEDIATION, toStatus: CaseProcessStatus.RESOLVED, details: "Agreement recorded through mediation." })
      previousStatus = CaseProcessStatus.MEDIATION
      settlementSource = SettlementSource.MEDIATION
    }
  } else if (scenario.currentStatus === CaseProcessStatus.REPUDIATION) {
    mediationFailed(3)
    steps.push({ event: "settled", fromStatus: CaseProcessStatus.CONCILIATION, toStatus: CaseProcessStatus.RESOLVED, details: "Agreement recorded through conciliation." })
    previousStatus = CaseProcessStatus.CONCILIATION
    settlementSource = SettlementSource.CONCILIATION
    steps.push({ event: "repudiated", fromStatus: CaseProcessStatus.RESOLVED, toStatus: CaseProcessStatus.REPUDIATION, details: "Settlement repudiation filed within the permitted period." })
    repudiatedBy = RepudiatedBy.RESPONDENT
  } else if (scenario.currentStatus === CaseProcessStatus.DISMISSED) {
    absenceCount = 0
    for (let absence = 1; absence <= 3; absence += 1) {
      steps.push({
        event: "absent",
        fromStatus: CaseProcessStatus.MEDIATION,
        toStatus: absence === 3 ? CaseProcessStatus.DISMISSED : CaseProcessStatus.MEDIATION,
        details: absence === 3
          ? "Case dismissed after three complainant absences during mediation."
          : `Complainant absence recorded (${absence}/3).`,
      })
    }
    dismissedReason = "Complainant absent 3 times during mediation"
  } else if (scenario.currentStatus === CaseProcessStatus.WITHDRAWN) {
    mediationFailed(1)
    steps.push({ event: "withdrawn", fromStatus: CaseProcessStatus.MEDIATION, toStatus: CaseProcessStatus.WITHDRAWN, details: "Case withdrawn during mediation at the complainant's request." })
    withdrawalReason = "The complainant withdrew after the parties arranged a direct repayment plan."
  }

  if (scenario.currentStatus === CaseProcessStatus.RESOLVED && scenario.resolutionFrom === CaseProcessStatus.ARBITRATION) {
    settlementSource = SettlementSource.ARBITRATION
    previousStatus = CaseProcessStatus.ARBITRATION
  }

  return {
    steps,
    mediationAttemptCount,
    conciliationAttemptCount,
    absenceCount,
    previousStatus,
    settlementSource,
    arbitrationAgreementSigned,
    repudiatedBy,
    withdrawalReason,
    dismissedReason,
  }
}

function parseCaseSequence(caseNumber: string, year: number, month: number) {
  const match = /^([A-Z]+)-(\d+)-(\d{2})$/.exec(caseNumber)
  if (!match) return 0
  const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"]
  if (match[1] !== monthNames[month - 1] || Number(match[3]) !== year % 100) return 0
  return Number(match[2])
}

async function main() {
  const today = todayInManila()
  const preserved = await prisma.user.findMany({
    where: { email: { in: PRESERVED_ACCOUNTS.map((account) => account.email) } },
    select: { id: true, email: true, fullName: true, role: true, password: true },
  })
  const preservedByEmail = new Map(preserved.map((account) => [account.email.toLowerCase(), account]))
  const missingAccounts = PRESERVED_ACCOUNTS.filter((account) => !preservedByEmail.has(account.email))
  if (missingAccounts.length > 0) {
    throw new Error(`Seeding stopped without changing data. Required accounts are missing: ${missingAccounts.map((account) => account.email).join(", ")}.`)
  }
  const wrongRoles = PRESERVED_ACCOUNTS.filter((account) => preservedByEmail.get(account.email)!.role !== account.role)
  if (wrongRoles.length > 0) {
    throw new Error(`Seeding stopped without changing data. Required accounts have unexpected roles: ${wrongRoles.map((account) => account.email).join(", ")}.`)
  }

  const preservedPasswordValues = new Map(preserved.map((account) => [account.email.toLowerCase(), account.password]))
  const scenarioIds = scenarios.map((scenario) => stableId("case", scenario.key))
  const existingSeedCases = await prisma.case.findMany({
    where: { id: { in: scenarioIds } },
    select: { id: true, caseNumber: true },
  })
  const existingSeedIds = new Set(existingSeedCases.map((item) => item.id))
  const nonSeedCases = await prisma.case.findMany({
    where: { id: { notIn: scenarioIds } },
    select: { caseNumber: true },
  })
  const sequenceRows = await prisma.caseMonthlySequence.findMany()

  const monthOffsets = scenarios.map((scenario, index) => scenario.scheduledDayOffset == null ? Math.floor(index / 5) : 0)
  const months = scenarios.map((scenario, index) => {
    const monthOffset = monthOffsets[index]
    const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - monthOffset, 1))
    const year = monthStart.getUTCFullYear()
    const month = monthStart.getUTCMonth() + 1
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
    const monthlyIndex = monthOffsets.slice(0, index).filter((offset) => offset === monthOffset).length
    const monthScenarioCount = monthOffsets.filter((offset) => offset === monthOffset).length
    const requestedDay = [3, 9, 16, 22, 27][monthlyIndex % 5]
    const maxDay = monthOffset === 0 ? Math.max(1, today.getUTCDate() - 1) : lastDay
    const filingDate = scenario.scheduledDayOffset == null
      ? new Date(Date.UTC(year, month - 1, Math.min(requestedDay, lastDay, maxDay)))
      : addDays(today, -6)
    const incidentDate = addDays(filingDate, -(2 + ((index * 7) % 29)))
    const sequenceRow = sequenceRows.find((sequence) => sequence.year === year && sequence.month === month)
    const oldSeedCount = existingSeedCases.filter((item) => {
      const sequence = parseCaseSequence(item.caseNumber, year, month)
      return sequence > 0 && existingSeedIds.has(item.id)
    }).length
    const otherCaseMaximum = Math.max(0, ...nonSeedCases.map((item) => parseCaseSequence(item.caseNumber, year, month)))
    const sequenceBase = Math.max(otherCaseMaximum, (sequenceRow?.lastNumber ?? 0) - oldSeedCount, 0)
    const caseNumber = formatCaseNumber(year, month, sequenceBase + monthlyIndex + 1)
    return {
      scenario: scenarios[index],
      id: scenarioIds[index],
      index,
      year,
      month,
      monthlyIndex,
      filingDate,
      incidentDate,
      caseNumber,
      sequenceEnd: sequenceBase + monthScenarioCount,
    }
  })

  await prisma.$transaction(async (transaction) => {
    const admin = preservedByEmail.get("admin@gmail.com")!
    const preservedResident = preservedByEmail.get("resident@gmail.com")!
    const preservedOfficer = preservedByEmail.get("officer@gmail.com")!
    const userRows: Array<{ email: string; fullName: string; role: UserRole; contact: string; street: string; gender?: Gender; status?: UserStatus; suspensionReason?: string }> = [
      ...residents.map((user) => ({ ...user, role: UserRole.RESIDENT, status: user.status ?? UserStatus.ACTIVE, suspensionReason: user.suspensionReason })),
      ...bpatOfficers.map((user) => ({ ...user, role: UserRole.BPAT_OFFICER, status: UserStatus.ACTIVE })),
      ...officials.map((user) => ({ ...user, role: UserRole.LUPON, status: UserStatus.ACTIVE })),
    ]

    for (const [index, user] of userRows.entries()) {
      const id = stableId("user", user.email)
      const createdAt = addDays(today, -(150 + index * 9))
      await transaction.user.upsert({
        where: { email: user.email },
        update: {
          fullName: user.fullName,
          contact: user.contact,
          street: user.street,
          gender: user.gender,
          role: user.role,
          status: user.status ?? UserStatus.ACTIVE,
          suspensionReason: user.suspensionReason ?? null,
          isArchived: false,
          archivedAt: null,
          archivedReason: null,
        },
        create: {
          id,
          fullName: user.fullName,
          email: user.email,
          password: null,
          contact: user.contact,
          street: user.street,
          gender: user.gender,
          role: user.role,
          status: user.status ?? UserStatus.ACTIVE,
          suspensionReason: user.suspensionReason,
          createdAt,
        },
      })
    }

    const seededUserEmails = [...userRows.map((user) => user.email), preservedOfficer.email]
    const seededUsers = await transaction.user.findMany({
      where: { email: { in: seededUserEmails } },
      select: { id: true, email: true, fullName: true, role: true },
    })
    const usersByEmail = new Map([...seededUsers, { id: preservedResident.id, email: preservedResident.email, fullName: preservedResident.fullName, role: preservedResident.role }].map((user) => [user.email.toLowerCase(), user]))

    const officerDefinitions = [
      { email: preservedOfficer.email, roleTitle: OfficerRoleTitle.BPAT_OFFICER },
      ...bpatOfficers.map((user) => ({ email: user.email, roleTitle: OfficerRoleTitle.BPAT_OFFICER })),
      ...officials.map((user) => ({ email: user.email, roleTitle: user.roleTitle })),
    ]
    const officersByEmail = new Map<string, { id: string; userId: string; fullName: string }>()
    for (const definition of officerDefinitions) {
      const user = usersByEmail.get(definition.email.toLowerCase())
      if (!user) throw new Error(`Seed officer account ${definition.email} was not created.`)
      const officer = await transaction.officer.upsert({
        where: { userId: user.id },
        update: { fullName: user.fullName, roleTitle: definition.roleTitle },
        create: { userId: user.id, fullName: user.fullName, roleTitle: definition.roleTitle },
      })
      officersByEmail.set(definition.email.toLowerCase(), officer)
    }

    const residentEmails = [preservedResident.email, ...residents.map((user) => user.email)]
    const residentAccounts = residentEmails.map((email) => {
      const user = usersByEmail.get(email.toLowerCase())
      if (!user) throw new Error(`Seed complainant account ${email} was not found.`)
      return user
    })
    const bpatEmails = [preservedOfficer.email, ...bpatOfficers.map((user) => user.email)]
    const activeOfficerAccounts = bpatEmails.map((email) => {
      const user = usersByEmail.get(email.toLowerCase())
      const officer = officersByEmail.get(email.toLowerCase())
      if (!user || !officer) throw new Error(`Seed BPAT officer ${email} was not found.`)
      return { user, officer }
    })

    const existingSeedIdsList = [...scenarioIds]
    const existingCaseIds = (await transaction.case.findMany({ where: { id: { in: existingSeedIdsList } }, select: { id: true } })).map((item) => item.id)
    for (const id of existingCaseIds) {
      await transaction.case.update({ where: { id }, data: { caseNumber: `SEED-TEMP-${id}` } })
    }

    const preparedCases = months.map((item) => {
      const scenario = item.scenario
      const complainant = residentAccounts[scenario.complainantIndex % residentAccounts.length]
      const assignment = activeOfficerAccounts[item.index % activeOfficerAccounts.length]
      const workflow = buildWorkflow(scenario, item.index)
      const transitionStart = laterDate(addDays(item.filingDate, 1), addDays(today, -(workflow.steps.length * 2 + 3)))
      const timedSteps = workflow.steps.map((step, stepIndex) => ({ ...step, changedAt: addDays(transitionStart, stepIndex * 2) }))
      const statusEnteredDate = scenario.currentStatus === CaseProcessStatus.SCHEDULED
        ? item.filingDate
        : [...timedSteps].reverse().find((step) => step.toStatus === scenario.currentStatus && step.fromStatus !== scenario.currentStatus)?.changedAt
          ?? timedSteps.at(-1)?.changedAt
          ?? item.filingDate
      const currentTransition = timedSteps.at(-1)
      const settlementStep = timedSteps.find((step) => step.event === "settled" || step.event === "award_rendered")
      const settlementDate = settlementStep?.changedAt ?? null
      const repudiationDate = timedSteps.find((step) => step.event === "repudiated")?.changedAt ?? null
      const arbitrationAgreementDate = workflow.arbitrationAgreementSigned
        ? timedSteps.find((step) => step.toStatus === CaseProcessStatus.ARBITRATION)?.changedAt ?? item.filingDate
        : null
      const arbitrationAwardDate = timedSteps.find((step) => step.event === "award_rendered")?.changedAt ?? null
      const repudiationDeadline = settlementDate && workflow.settlementSource !== SettlementSource.ARBITRATION
        ? addBusinessDays(settlementDate, 10)
        : null
      const executionDeadline = settlementDate ? addCalendarMonths(settlementDate, 6) : null
      const calculatedClosedDate = workflow.settlementSource === SettlementSource.ARBITRATION
        ? arbitrationAwardDate
        : repudiationDeadline && today.getTime() > repudiationDeadline.getTime()
          ? today
          : null
      const closedDate = calculatedClosedDate
      const processHistory = [
        {
          id: stableId("case-process-history", `${scenario.key}:created`),
          caseId: item.id,
          event: "created",
          fromStatus: CaseProcessStatus.SCHEDULED,
          toStatus: CaseProcessStatus.SCHEDULED,
          changedAt: item.filingDate,
          businessDaysSpent: 0,
          details: "Case filed and scheduled for barangay review.",
        },
        ...timedSteps.map((step, stepIndex) => ({
          id: stableId("case-process-history", `${scenario.key}:${stepIndex}:${step.event}`),
          caseId: item.id,
          event: step.event,
          fromStatus: step.fromStatus,
          toStatus: step.toStatus,
          changedAt: step.changedAt,
          businessDaysSpent: countBusinessDaysBetween(
            stepIndex === 0 ? item.filingDate : timedSteps[stepIndex - 1].changedAt,
            step.changedAt,
          ),
          details: step.details,
        })),
      ]
      const desiredReviewStatus = caseReviewStatus(scenario.currentStatus)
      const reviewPath = [
        CaseReviewStatus.PENDING,
        CaseReviewStatus.UNDER_REVIEW,
        CaseReviewStatus.ACCEPTED,
        CaseReviewStatus.ASSIGNED,
        CaseReviewStatus.SCHEDULED,
        ...(desiredReviewStatus === CaseReviewStatus.SCHEDULED ? [] : [CaseReviewStatus.ONGOING]),
        ...(desiredReviewStatus === CaseReviewStatus.SCHEDULED || desiredReviewStatus === CaseReviewStatus.ONGOING ? [] : [desiredReviewStatus]),
      ]
      const statusHistory = reviewPath.slice(1).map((newStatus, historyIndex) => {
        const oldStatus = reviewPath[historyIndex]
        const actorId = historyIndex < 3 ? admin.id : assignment.user.id
        const changedAt = historyIndex === 0
          ? item.filingDate
          : historyIndex === reviewPath.length - 2
            ? laterDate(currentTransition?.changedAt ?? item.filingDate, addDays(item.filingDate, historyIndex))
            : addDays(item.filingDate, Math.min(historyIndex, 3))
        return {
          id: stableId("case-status-history", `${scenario.key}:${historyIndex}`),
          caseId: item.id,
          changedBy: actorId,
          oldStatus,
          newStatus,
          changedAt,
        }
      })
      const hearings: Array<{
        id: string
        caseId: string
        conductedBy: string
        hearingNumber: number
        stage: HearingStage
        scheduledDate: Date
        scheduledTime: string
        location: string
        notes: string
        complainantAttended: boolean
        respondentAttended: boolean
        outcome: HearingOutcome | null
        status: HearingStatus
      }> = []
      const hearingCounters = new Map<HearingStage, number>([[HearingStage.MEDIATION, 0], [HearingStage.CONCILIATION, 0]])
      for (const step of timedSteps) {
        if (!["not_settled", "settled", "absent"].includes(step.event)) continue
        const stage = step.fromStatus === CaseProcessStatus.CONCILIATION ? HearingStage.CONCILIATION : HearingStage.MEDIATION
        const hearingNumber = (hearingCounters.get(stage) ?? 0) + 1
        hearingCounters.set(stage, hearingNumber)
        const outcome = step.event === "settled"
          ? HearingOutcome.RESOLVED
          : step.event === "absent"
            ? HearingOutcome.ADJOURNED
            : HearingOutcome.UNRESOLVED
        hearings.push({
          id: stableId("hearing", `${scenario.key}:${stage}:${hearingNumber}`),
          caseId: item.id,
          conductedBy: assignment.officer.id,
          hearingNumber,
          stage,
          scheduledDate: step.changedAt,
          scheduledTime: `${String(9 + ((item.index + hearingNumber) % 7)).padStart(2, "0")}:00`,
          location: "Barangay New Kalalake Hall, Olongapo City",
          notes: step.details,
          complainantAttended: step.event !== "absent" || step.toStatus !== CaseProcessStatus.DISMISSED,
          respondentAttended: true,
          outcome,
          status: HearingStatus.COMPLETED,
        })
      }
      if (scenario.currentStatus === CaseProcessStatus.MEDIATION || scenario.currentStatus === CaseProcessStatus.CONCILIATION || scenario.scheduledDayOffset != null) {
        const stage = scenario.currentStatus === CaseProcessStatus.CONCILIATION ? HearingStage.CONCILIATION : HearingStage.MEDIATION
        const hearingNumber = (hearingCounters.get(stage) ?? 0) + 1
        hearings.push({
          id: stableId("hearing", `${scenario.key}:${stage}:${hearingNumber}`),
          caseId: item.id,
          conductedBy: assignment.officer.id,
          hearingNumber,
          stage,
          scheduledDate: addDays(today, scenario.scheduledDayOffset ?? 0),
          scheduledTime: `${String(9 + item.index % 7).padStart(2, "0")}:${String((item.index % 4) * 15).padStart(2, "0")}`,
          location: "Barangay New Kalalake Hall, Olongapo City",
          notes: "Upcoming hearing for the current case stage.",
          complainantAttended: false,
          respondentAttended: false,
          outcome: null,
          status: HearingStatus.SCHEDULED,
        })
      }
      const caseStatus = desiredReviewStatus
      const settlementText = settlementDate
        ? workflow.settlementSource === SettlementSource.ARBITRATION
          ? "Arbitration award issued for the documented claim."
          : "The parties agreed to the recorded terms and will follow the barangay settlement schedule."
        : null
      const notificationSeed = {
        complainant,
        assignment,
        processHistory,
        statusHistory,
        hearings,
        statusEnteredDate,
        settlementDate,
        repudiationDate,
        arbitrationAgreementDate,
        arbitrationAwardDate,
        repudiationDeadline,
        executionDeadline,
        closedDate,
        settlementText,
        workflow,
        desiredReviewStatus,
        caseStatus,
      }
      return {
        ...item,
        ...notificationSeed,
        respondentName: scenario.respondentName,
        respondentAddress: scenario.respondentAddress,
        caseId: item.id,
      }
    })

    const monthlyState = new Map<string, { year: number; month: number; lastNumber: number }>()
    for (const item of months) {
      const key = `${item.year}-${item.month}`
      const prior = monthlyState.get(key)
      monthlyState.set(key, { year: item.year, month: item.month, lastNumber: Math.max(prior?.lastNumber ?? 0, item.sequenceEnd) })
    }

    for (const item of preparedCases) {
      const { scenario, id, caseNumber, filingDate, incidentDate, index } = item
      const workflow = item.workflow
      const assignedOfficer = item.assignment
      const complainant = item.complainant
      const currentStatus = scenario.currentStatus
      const statusEnteredDate = item.statusEnteredDate
      const closedDate = item.closedDate
      const isArchived = scenario.archived === true
      const data = {
        caseNumber,
        complainantId: complainant.id,
        respondentId: null,
        respondentName: item.respondentName,
        respondentAddress: item.respondentAddress,
        incidentStreet: scenario.location.replace(/^Purok \d+, /, "").split(",")[0].replace(/ near .*/, "").replace(/ at .*/, ""),
        incidentLatitude: scenario.latitude,
        incidentLongitude: scenario.longitude,
        incidentAccuracy: 18 + (index % 4) * 7,
        incidentLocation: scenario.location,
        assignedOfficerId: assignedOfficer.officer.id,
        category: scenario.category,
        type: scenario.type,
        details: scenario.details,
        priority: scenario.priority,
        status: item.caseStatus,
        currentStatus,
        previousStatus: workflow.previousStatus,
        filingDate,
        statusEnteredDate,
        statusDaysAllotted: currentStatus === CaseProcessStatus.MEDIATION || currentStatus === CaseProcessStatus.CONCILIATION
          ? 15
          : currentStatus === CaseProcessStatus.RESOLVED
            ? 10
            : null,
        mediationAttemptCount: workflow.mediationAttemptCount,
        conciliationAttemptCount: workflow.conciliationAttemptCount,
        absenceCount: workflow.absenceCount,
        arbitrationAgreementSigned: workflow.arbitrationAgreementSigned,
        arbitrationAgreementDate: item.arbitrationAgreementDate,
        arbitrationAwardDate: item.arbitrationAwardDate,
        settlementDate: item.settlementDate,
        settlementSource: workflow.settlementSource,
        repudiationDate: item.repudiationDate,
        repudiationDeadline: item.repudiationDeadline,
        repudiationReason: item.repudiationDate ? "The respondent disagreed with the signed repair-cost settlement." : null,
        repudiatedBy: workflow.repudiatedBy,
        closedDate,
        executionDeadline: item.executionDeadline,
        executionMethod: null as ExecutionMethod | null,
        needsCertificateToFileAction: workflow.withdrawalReason?.includes("Certificate to File Action") ?? false,
        withdrawalReason: workflow.withdrawalReason,
        dismissedReason: workflow.dismissedReason,
        deadlineDate: addDays(filingDate, 14) > today ? today : addDays(filingDate, 14),
        isArchived,
        archivedAt: isArchived ? today : null,
        dateSubmitted: filingDate,
        incidentDate,
        updatedAt: item.processHistory.at(-1)?.changedAt ?? filingDate,
      }
      await transaction.case.upsert({
        where: { id },
        update: data,
        create: { id, ...data },
      })

      if (item.settlementText && item.settlementDate) {
        await transaction.settlement.upsert({
          where: { caseId: id },
          update: {
            agreementText: item.settlementText,
            proofUrl: `https://placehold.co/960x640/png?text=Settlement+${encodeURIComponent(caseNumber)}`,
            complainantSigned: true,
            respondentSigned: true,
            signedAt: item.arbitrationAwardDate ?? item.settlementDate,
          },
          create: {
            caseId: id,
            agreementText: item.settlementText,
            proofUrl: `https://placehold.co/960x640/png?text=Settlement+${encodeURIComponent(caseNumber)}`,
            complainantSigned: true,
            respondentSigned: true,
            signedAt: item.arbitrationAwardDate ?? item.settlementDate,
          },
        })
      } else {
        await transaction.settlement.deleteMany({ where: { caseId: id } })
      }
    }

    for (const item of monthlyState.values()) {
      await transaction.caseMonthlySequence.upsert({
        where: { year_month: { year: item.year, month: item.month } },
        update: { lastNumber: item.lastNumber },
        create: item,
      })
    }

    const processHistory = preparedCases.flatMap((item) => item.processHistory)
    const statusHistory = preparedCases.flatMap((item) => item.statusHistory)
    const hearings = preparedCases.flatMap((item) => item.hearings)
    const evidence = preparedCases.flatMap((item) => {
      const count = item.scenario.evidenceCount ?? 0
      return Array.from({ length: count }, (_, evidenceIndex) => ({
        id: stableId("evidence", `${item.scenario.key}:${evidenceIndex + 1}`),
        caseId: item.id,
        fileUrl: `https://placehold.co/960x640/f1f5f9/334155.png?text=Evidence+${item.scenario.key}+${evidenceIndex + 1}`,
        fileType: "image/png",
        fileName: `${item.scenario.key}-evidence-${evidenceIndex + 1}.png`,
        fileData: null,
        uploadedAt: item.filingDate,
      }))
    })

    await transaction.caseProcessHistory.deleteMany({ where: { id: { in: processHistory.map((entry) => entry.id) } } })
    await transaction.caseStatusHistory.deleteMany({ where: { id: { in: statusHistory.map((entry) => entry.id) } } })
    await transaction.hearing.deleteMany({ where: { id: { in: hearings.map((entry) => entry.id) } } })
    await transaction.evidence.deleteMany({ where: { id: { in: evidence.map((entry) => entry.id) } } })
    if (processHistory.length) await transaction.caseProcessHistory.createMany({ data: processHistory })
    if (statusHistory.length) await transaction.caseStatusHistory.createMany({ data: statusHistory })
    if (hearings.length) await transaction.hearing.createMany({ data: hearings })
    if (evidence.length) await transaction.evidence.createMany({ data: evidence })

    const seededAnnouncementIds = announcements.map((item, index) => stableId("announcement", String(index + 1)))
    for (const [index, announcement] of announcements.entries()) {
      await transaction.announcement.upsert({
        where: { id: seededAnnouncementIds[index] },
        update: {
          createdBy: admin.id,
          title: announcement.title,
          content: announcement.content,
          imageUrl: index % 3 === 0 ? `https://placehold.co/1200x640/png?text=Barangay+Notice+${index + 1}` : null,
          publishedAt: addDays(today, -(78 - index * 11)),
        },
        create: {
          id: seededAnnouncementIds[index],
          createdBy: admin.id,
          title: announcement.title,
          content: announcement.content,
          imageUrl: index % 3 === 0 ? `https://placehold.co/1200x640/png?text=Barangay+Notice+${index + 1}` : null,
          publishedAt: addDays(today, -(78 - index * 11)),
        },
      })
    }

    const notificationData = preparedCases.flatMap((item) => {
      const residentMessage = item.scenario.currentStatus === CaseProcessStatus.RESOLVED
        ? `${item.caseNumber} has been resolved. Review the settlement details in your case page.`
        : item.scenario.currentStatus === CaseProcessStatus.REPUDIATION
          ? `${item.caseNumber} has a settlement update and is returning to conciliation.`
          : `${item.caseNumber} is now in ${item.scenario.currentStatus.toLowerCase()} status.`
      const residentNotification = {
        id: stableId("notification", `${item.scenario.key}:resident`),
        userId: item.complainant.id,
        message: residentMessage,
        type: item.scenario.currentStatus === CaseProcessStatus.RESOLVED ? NotificationType.SETTLEMENT : NotificationType.CASE_UPDATE,
        isRead: item.index % 3 === 0,
        createdAt: item.processHistory.at(-1)?.changedAt ?? item.filingDate,
      }
      const officerNotification = {
        id: stableId("notification", `${item.scenario.key}:officer`),
        userId: item.assignment.user.id,
        message: `New case ${item.caseNumber} has been assigned to you for follow-up.`,
        type: NotificationType.SYSTEM,
        isRead: item.index % 4 === 1,
        createdAt: item.filingDate,
      }
      const messages = [residentNotification, officerNotification]
      if (item.scenario.priority === CasePriority.URGENT || item.scenario.priority === CasePriority.HIGH) {
        messages.push({
          id: stableId("notification", `${item.scenario.key}:escalation`),
          userId: item.assignment.user.id,
          message: `Case ${item.caseNumber} was escalated for priority follow-up.`,
          type: NotificationType.SYSTEM,
          isRead: item.index % 2 === 0,
          createdAt: item.filingDate,
        })
      }
      return messages
    })
    await transaction.notification.deleteMany({ where: { id: { in: notificationData.map((item) => item.id) } } })
    if (notificationData.length) await transaction.notification.createMany({ data: notificationData })

    const auditData: Prisma.AuditLogCreateManyInput[] = preparedCases.flatMap((item) => {
      const lastStep = item.processHistory.at(-1)
      const changedFrom = lastStep?.fromStatus ?? CaseProcessStatus.SCHEDULED
      const changedTo = lastStep?.toStatus ?? CaseProcessStatus.SCHEDULED
      const assignmentActor = item.assignment.user.id
      return [
        {
          id: stableId("audit", `${item.scenario.key}:create`),
          actorId: admin.id,
          action: AuditAction.CREATE,
          targetTable: "cases",
          targetId: item.id,
          caseId: item.id,
          changes: { caseNumber: item.caseNumber, category: item.scenario.category, type: item.scenario.type },
          loggedAt: item.filingDate,
        },
        {
          id: stableId("audit", `${item.scenario.key}:assign`),
          actorId: admin.id,
          action: AuditAction.ASSIGN,
          targetTable: "cases",
          targetId: item.id,
          caseId: item.id,
          changes: { previousOfficer: "Unassigned", assignedOfficer: item.assignment.officer.fullName },
          loggedAt: addDays(item.filingDate, 1) > today ? today : addDays(item.filingDate, 1),
        },
        {
          id: stableId("audit", `${item.scenario.key}:status`),
          actorId: assignmentActor,
          action: AuditAction.STATUS_CHANGE,
          targetTable: "cases",
          targetId: item.id,
          caseId: item.id,
          changes: { previousStatus: changedFrom, status: changedTo },
          loggedAt: lastStep?.changedAt ?? item.filingDate,
        },
      ]
    })
    const activeResidentSeeds = residents.filter((user) => user.status === UserStatus.SUSPENDED)
    for (const [index, suspended] of activeResidentSeeds.entries()) {
      const target = usersByEmail.get(suspended.email.toLowerCase())!
      auditData.push({
        id: stableId("audit", `suspension:${suspended.email}`),
        actorId: admin.id,
        action: AuditAction.STATUS_CHANGE,
        targetTable: "users",
        targetId: target.id,
        caseId: null,
        changes: { previousStatus: UserStatus.ACTIVE, status: UserStatus.SUSPENDED, remarks: suspended.suspensionReason },
        loggedAt: addDays(today, -(6 + index * 5)),
      })
    }
    const loginAccounts = new Map([admin, preservedResident, preservedOfficer, ...seededUsers].map((account) => [account.email.toLowerCase(), account]))
    for (const [index, account] of [...loginAccounts.values()].entries()) {
      auditData.push({
        id: stableId("audit", `login:${account.email}`),
        actorId: account.id,
        action: AuditAction.LOGIN,
        targetTable: "users",
        targetId: account.id,
        caseId: null,
        changes: { role: account.role },
        loggedAt: addDays(today, -(2 + index * 3)),
      })
    }
    for (const [index, category] of ["Community Dispute", "Fraud & Scams", "Property & Theft", "Violence or Threats"].entries()) {
      auditData.push({
        id: stableId("audit", `category:${category}`),
        actorId: admin.id,
        action: AuditAction.UPDATE,
        targetTable: "categories",
        targetId: category,
        caseId: null,
        changes: { category, active: true, revision: index + 1 },
        loggedAt: addDays(today, -(12 + index * 8)),
      })
    }
    const auditIds = auditData.flatMap((item) => item.id ? [item.id] : [])
    await transaction.auditLog.deleteMany({ where: { id: { in: auditIds } } })
    if (auditData.length) await transaction.auditLog.createMany({ data: auditData })

    const activityData = [...userRows, { email: admin.email, fullName: admin.fullName, role: UserRole.ADMIN, contact: "", street: "", gender: Gender.OTHER }].flatMap((user, index) => {
      const account = usersByEmail.get(user.email.toLowerCase()) ?? admin
      return [
        {
          id: stableId("user-activity", `${user.email}:login`),
          userId: account.id,
          label: "Account activity recorded",
          detail: `Recent ${user.role.toLowerCase().replaceAll("_", " ")} account activity for ${user.fullName}.`,
          category: "system",
          status: "Verified",
          createdAt: addDays(today, -(1 + index * 2)),
        },
        ...(index % 3 === 0 ? [{
          id: stableId("user-activity", `${user.email}:case`),
          userId: account.id,
          label: "Case information updated",
          detail: "A case record or follow-up entry was updated in IRIS.",
          category: "cases",
          status: "Info",
          createdAt: addDays(today, -(3 + index * 2)),
        }] : []),
      ]
    })
    await transaction.userActivity.deleteMany({ where: { id: { in: activityData.map((item) => item.id) } } })
    if (activityData.length) await transaction.userActivity.createMany({ data: activityData })

    const categorySetting = await transaction.appSetting.findUnique({ where: { key: "categories" }, select: { id: true } })
    if (!categorySetting) {
      await transaction.appSetting.create({
        data: {
          key: "categories",
          value: { active: [...CASE_CATEGORIES], archived: [] },
        },
      })
    }

  }, { maxWait: 10_000, timeout: 60_000 })

  const preservedAfter = await prisma.user.findMany({
    where: { email: { in: PRESERVED_ACCOUNTS.map((account) => account.email) } },
    select: { email: true, password: true },
  })
  for (const account of preservedAfter) {
    if (preservedPasswordValues.get(account.email.toLowerCase()) !== account.password) {
      throw new Error(`Seeder changed the preserved password value for ${account.email}.`)
    }
  }

  const [userCount, caseCount, hearingCount, evidenceCount, announcementCount, officerCount, archivedCount, currentStatusCounts] = await Promise.all([
    prisma.user.count({ where: { email: { in: [...PRESERVED_ACCOUNTS.map((account) => account.email), ...residents.map((user) => user.email), ...bpatOfficers.map((user) => user.email), ...officials.map((user) => user.email)] } } }),
    prisma.case.count({ where: { id: { in: scenarioIds } } }),
    prisma.hearing.count({ where: { caseId: { in: scenarioIds } } }),
    prisma.evidence.count({ where: { caseId: { in: scenarioIds } } }),
    prisma.announcement.count({ where: { id: { in: announcements.map((_, index) => stableId("announcement", String(index + 1))) } } }),
    prisma.officer.count({ where: { user: { email: { in: [...bpatOfficers.map((user) => user.email), ...officials.map((user) => user.email), "officer@gmail.com"] } } } }),
    prisma.case.count({ where: { id: { in: scenarioIds }, isArchived: true } }),
    prisma.case.groupBy({ by: ["currentStatus"], where: { id: { in: scenarioIds } }, _count: { _all: true } }),
  ])
  const seededNotificationIds = preparedNotificationIds(scenarios)
  const seededAuditIds = preparedAuditIds(scenarios, residents)
  const [actualNotificationCount, actualAuditCount, actualActivityCount] = await Promise.all([
    prisma.notification.count({ where: { id: { in: seededNotificationIds } } }),
    prisma.auditLog.count({ where: { id: { in: seededAuditIds } } }),
    prisma.userActivity.count({ where: { id: { in: preparedActivityIds() } } }),
  ])

  process.stdout.write(`${JSON.stringify({ preservedAccounts: preserved.length, seededUsers: userCount, cases: caseCount, casesByStatus: currentStatusCounts.map((item) => ({ status: item.currentStatus, count: item._count._all })), archivedCases: archivedCount, hearings: hearingCount, evidenceImages: evidenceCount, notifications: actualNotificationCount, announcements: announcementCount, auditLogs: actualAuditCount, userActivities: actualActivityCount, officersAndOfficials: officerCount, preservedPasswordValuesUnchanged: true })}\n`)
}

function preparedNotificationIds(items: Scenario[]) {
  return items.flatMap((item) => [
    stableId("notification", `${item.key}:resident`),
    stableId("notification", `${item.key}:officer`),
    ...(item.priority === CasePriority.URGENT || item.priority === CasePriority.HIGH ? [stableId("notification", `${item.key}:escalation`)] : []),
  ])
}

function preparedAuditIds(items: Scenario[], residentSeeds: typeof residents) {
  const loginEmails = [...new Set([
    ...PRESERVED_ACCOUNTS.map((account) => account.email),
    ...residents.map((user) => user.email),
    ...bpatOfficers.map((user) => user.email),
    ...officials.map((user) => user.email),
  ])]
  return [
    ...items.flatMap((item) => [
      stableId("audit", `${item.key}:create`),
      stableId("audit", `${item.key}:assign`),
      stableId("audit", `${item.key}:status`),
    ]),
    ...residentSeeds.filter((user) => user.status === UserStatus.SUSPENDED).map((user) => stableId("audit", `suspension:${user.email}`)),
    ...loginEmails.map((email) => stableId("audit", `login:${email}`)),
    ...["Community Dispute", "Fraud & Scams", "Property & Theft", "Violence or Threats"].map((category) => stableId("audit", `category:${category}`)),
  ]
}

function preparedActivityIds() {
  const accounts = [...residents, ...bpatOfficers, ...officials, { email: "admin@gmail.com" }]
  return accounts.flatMap((account, index) => [
    stableId("user-activity", `${account.email}:login`),
    ...(index % 3 === 0 ? [stableId("user-activity", `${account.email}:case`)] : []),
  ])
}

main()
  .catch((error: unknown) => {
    process.exitCode = 1
    if (error instanceof Error) process.stderr.write(`${error.message}\n`)
  })
  .finally(async () => prisma.$disconnect())

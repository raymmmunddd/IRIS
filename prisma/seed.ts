import { pbkdf2Sync, randomBytes } from "node:crypto"
import "dotenv/config"

import {
  AuditAction,
  CaseCategory,
  CasePriority,
  CaseStatus,
  Gender,
  HearingOutcome,
  HearingStage,
  HearingStatus,
  NotificationType,
  OfficerRoleTitle,
  Prisma,
  PrismaClient,
  UserRole,
  UserStatus,
} from "../src/generated/prisma/client"

import {
  describeEastTapinacLocation,
  EAST_TAPINAC_STREETS,
  type EastTapinacStreet,
} from "../src/lib/east-tapinac-geo"
import { createPrismaAdapter } from "../src/lib/database"

const prisma = new PrismaClient({
  adapter: createPrismaAdapter(),
})

const SEED_PASSWORD = "Password123"
const BASE_YEAR = 2026
const UNASSIGNED_CASE_STATUSES: CaseStatus[] = [
  CaseStatus.PENDING,
  CaseStatus.UNDER_REVIEW,
  CaseStatus.REJECTED,
  CaseStatus.REFERRED,
]

function hashSeedPassword(password: string) {
  const iterations = 120000
  const salt = randomBytes(16).toString("hex")
  const hash = pbkdf2Sync(password, salt, iterations, 64, "sha512").toString("hex")
  return `${iterations}:${salt}:${hash}`
}

function dateIn(month: number, day: number, hour = 9, minute = 0) {
  return new Date(Date.UTC(BASE_YEAR, month - 1, day, hour, minute))
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 86400000)
}

function streetAt(index: number) {
  return EAST_TAPINAC_STREETS[index % EAST_TAPINAC_STREETS.length]
}

function locationData(street: EastTapinacStreet, capturedAt: Date) {
  return {
    street: street.name,
    locationLatitude: street.lat,
    locationLongitude: street.lng,
    locationAccuracy: 18 + (street.purok % 6),
    locationAddress: describeEastTapinacLocation(street),
    locationCapturedAt: capturedAt,
  }
}

function nameData(fullName: string) {
  const suffixes = new Set(["Jr.", "Sr.", "II", "III", "IV", "V"])
  const parts = fullName.trim().split(/\s+/)
  const suffix = suffixes.has(parts.at(-1) ?? "") ? parts.pop() : null
  const firstName = parts.shift() ?? fullName
  const lastName = parts.length > 0 ? parts.pop() ?? null : null
  const middleName = parts.length > 0 ? parts.join(" ") : null

  return {
    fullName,
    firstName,
    middleName,
    lastName,
    suffix,
    termsAcceptedAt: dateIn(1, 1, 8),
    privacyAcceptedAt: dateIn(1, 1, 8),
    passwordLastUpdated: dateIn(1, 1, 8),
  }
}

async function cleanDatabase() {
  await prisma.caseChatMessage.deleteMany()
  await prisma.userActivity.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.caseStatusHistory.deleteMany()
  await prisma.caseMonitoring.deleteMany()
  await prisma.settlement.deleteMany()
  await prisma.evidence.deleteMany()
  await prisma.hearing.deleteMany()
  await prisma.case.deleteMany()
  await prisma.officer.deleteMany()
  await prisma.announcement.deleteMany()
  await prisma.appSetting.deleteMany()
  await prisma.user.deleteMany()
}

async function main() {
  await cleanDatabase()

  const password = hashSeedPassword(SEED_PASSWORD)

  const residents = []
  const residentNames = [
    ["Maria Lourdes Santos", "maria.santos@iris.com", Gender.FEMALE],
    ["Jose Miguel Reyes", "jose.reyes@iris.com", Gender.MALE],
    ["Ana Patricia Cruz", "ana.cruz@iris.com", Gender.FEMALE],
    ["Mark Angelo Dizon", "mark.dizon@iris.com", Gender.MALE],
    ["Lorna Mae Garcia", "lorna.garcia@iris.com", Gender.FEMALE],
    ["Carlo Mendoza Jr.", "carlo.mendoza@iris.com", Gender.MALE],
    ["Teresa Aquino", "teresa.aquino@iris.com", Gender.FEMALE],
    ["Nico Bautista", "nico.bautista@iris.com", Gender.MALE],
    ["Elena Ramos", "elena.ramos@iris.com", Gender.FEMALE],
    ["Paolo Villanueva", "paolo.villanueva@iris.com", Gender.MALE],
    ["Test Resident", "resident@gmail.com", Gender.OTHER],
  ] as const

  for (let index = 0; index < residentNames.length; index += 1) {
    const [fullName, email, gender] = residentNames[index]
    const street = streetAt(index * 3)
    const resident = await prisma.user.create({
      data: {
        ...nameData(fullName),
        email,
        password,
        contact: `091700000${String(index + 1).padStart(2, "0")}`,
        gender,
        role: UserRole.RESIDENT,
        status: UserStatus.ACTIVE,
        createdAt: dateIn(1 + (index % 5), 4 + index, 8),
        ...locationData(street, dateIn(1 + (index % 5), 4 + index, 8, 15)),
      },
    })
    residents.push(resident)
  }

  const adminStreet = streetAt(8)
  const admin = await prisma.user.create({
    data: {
      ...nameData("Alicia Dela Cruz"),
      email: "alicia.delacruz@iris.com",
      password,
      contact: "09175550100",
      gender: Gender.FEMALE,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      createdAt: dateIn(1, 2, 8),
      ...locationData(adminStreet, dateIn(1, 2, 8, 20)),
    },
  })

  const testAdminStreet = streetAt(9)
  const testAdmin = await prisma.user.create({
    data: {
      ...nameData("Test Admin"),
      email: "admin@gmail.com",
      password,
      contact: "09175550199",
      gender: Gender.OTHER,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      createdAt: dateIn(1, 2, 9),
      ...locationData(testAdminStreet, dateIn(1, 2, 9, 20)),
    },
  })

  const officerProfiles = [
    ["Rafael Navarro", "rafael.navarro@iris.com", UserRole.BPAT_OFFICER, OfficerRoleTitle.BPAT_OFFICER, Gender.MALE],
    ["Bianca Flores", "bianca.flores@iris.com", UserRole.BPAT_OFFICER, OfficerRoleTitle.BPAT_OFFICER, Gender.FEMALE],
    ["Miguel Ortega", "miguel.ortega@iris.com", UserRole.BPAT_OFFICER, OfficerRoleTitle.BPAT_OFFICER, Gender.MALE],
    ["Carmen Lim", "carmen.lim@iris.com", UserRole.LUPON, OfficerRoleTitle.LUPON_CHAIR, Gender.FEMALE],
    ["Daniel Valdez", "daniel.valdez@iris.com", UserRole.LUPON, OfficerRoleTitle.LUPON_MEMBER, Gender.MALE],
    ["Test Officer", "officer@gmail.com", UserRole.BPAT_OFFICER, OfficerRoleTitle.BPAT_OFFICER, Gender.OTHER],
  ] as const

  const officers = []
  for (let index = 0; index < officerProfiles.length; index += 1) {
    const [fullName, email, role, roleTitle, gender] = officerProfiles[index]
    const street = streetAt(12 + index * 4)
    const user = await prisma.user.create({
      data: {
        ...nameData(fullName),
        email,
        password,
        contact: `0917555020${index + 1}`,
        gender,
        role,
        status: UserStatus.ACTIVE,
        createdAt: dateIn(1, 3 + index, 9),
        ...locationData(street, dateIn(1, 3 + index, 9, 30)),
      },
    })

    officers.push(await prisma.officer.create({
      data: {
        userId: user.id,
        fullName: user.fullName,
        roleTitle,
        createdAt: dateIn(1, 3 + index, 10),
      },
    }))
  }

  const caseTemplates = [
    [CaseCategory.DISPUTE, "Boundary fence dispute", CasePriority.LOW, CaseStatus.PENDING, 1, 9],
    [CaseCategory.ORDINANCE_VIOLATION, "Late-night karaoke complaint", CasePriority.MEDIUM, CaseStatus.UNDER_REVIEW, 1, 14],
    [CaseCategory.INJURY, "Threat and minor injury report", CasePriority.HIGH, CaseStatus.ACCEPTED, 1, 22],
    [CaseCategory.OTHER, "Missing bicycle report", CasePriority.MEDIUM, CaseStatus.ASSIGNED, 1, 29],
    [CaseCategory.DISPUTE, "Right-of-way disagreement", CasePriority.LOW, CaseStatus.SCHEDULED, 2, 3],
    [CaseCategory.VAWC, "Harassment concern", CasePriority.HIGH, CaseStatus.ONGOING, 2, 7],
    [CaseCategory.ORDINANCE_VIOLATION, "Road obstruction complaint", CasePriority.MEDIUM, CaseStatus.RESOLVED, 2, 12],
    [CaseCategory.DISPUTE, "Water drainage dispute", CasePriority.LOW, CaseStatus.DISMISSED, 2, 18],
    [CaseCategory.INJURY, "Assault allegation", CasePriority.URGENT, CaseStatus.REFERRED, 2, 24],
    [CaseCategory.OTHER, "Property damage report", CasePriority.MEDIUM, CaseStatus.ACCEPTED, 3, 2],
    [CaseCategory.DISPUTE, "Shared wall complaint", CasePriority.LOW, CaseStatus.ASSIGNED, 3, 6],
    [CaseCategory.ORDINANCE_VIOLATION, "Curfew violation report", CasePriority.LOW, CaseStatus.SCHEDULED, 3, 10],
    [CaseCategory.VAWC, "Verbal abuse complaint", CasePriority.HIGH, CaseStatus.ONGOING, 3, 15],
    [CaseCategory.OTHER, "Fraudulent payment dispute", CasePriority.MEDIUM, CaseStatus.UNRESOLVED, 3, 21],
    [CaseCategory.DISPUTE, "Neighbor noise mediation", CasePriority.LOW, CaseStatus.RESOLVED, 3, 28],
    [CaseCategory.INJURY, "Punching incident", CasePriority.HIGH, CaseStatus.UNDER_REVIEW, 4, 1],
    [CaseCategory.ORDINANCE_VIOLATION, "Illegal parking complaint", CasePriority.LOW, CaseStatus.PENDING, 4, 4],
    [CaseCategory.DISPUTE, "Canal maintenance dispute", CasePriority.LOW, CaseStatus.ACCEPTED, 4, 8],
    [CaseCategory.OTHER, "Lost document complaint", CasePriority.LOW, CaseStatus.REJECTED, 4, 12],
    [CaseCategory.VAWC, "Intimidation report", CasePriority.HIGH, CaseStatus.ASSIGNED, 4, 17],
    [CaseCategory.DISPUTE, "Tree branch property complaint", CasePriority.LOW, CaseStatus.SCHEDULED, 4, 23],
    [CaseCategory.ORDINANCE_VIOLATION, "Public drinking report", CasePriority.MEDIUM, CaseStatus.ONGOING, 4, 29],
    [CaseCategory.OTHER, "Small claims referral", CasePriority.MEDIUM, CaseStatus.REFERRED, 5, 3],
    [CaseCategory.INJURY, "Threat with weapon allegation", CasePriority.URGENT, CaseStatus.ACCEPTED, 5, 9],
    [CaseCategory.DISPUTE, "Household boundary mediation", CasePriority.LOW, CaseStatus.RESOLVED, 5, 15],
  ] as const

  const cases = []
  for (let index = 0; index < caseTemplates.length; index += 1) {
    const [category, type, priority, status, month, day] = caseTemplates[index]
    const complainant = residents[index % residents.length]
    const respondent = residents[(index + 3) % residents.length]
    const street = streetAt(index * 2 + 5)
    const submittedAt = dateIn(month, day, 10 + (index % 6), 15)
    const hasOfficer = !UNASSIGNED_CASE_STATUSES.includes(status)
    const assignedOfficer = hasOfficer ? officers[index % officers.length] : null

    const created = await prisma.case.create({
      data: {
        complainantId: complainant.id,
        respondentId: index % 4 === 0 ? respondent.id : null,
        respondentName: index % 4 === 0 ? respondent.fullName : `Respondent ${index + 1}`,
        respondentContact: `0917666${String(index + 1).padStart(4, "0")}`,
        respondentAddress: describeEastTapinacLocation(streetAt(index + 9)),
        assignedOfficerId: assignedOfficer?.id,
        category,
        type,
        details: `${type} filed in ${describeEastTapinacLocation(street)}. Seeded details include parties involved, incident timeline, and requested barangay action.`,
        priority,
        status,
        referredTo: status === CaseStatus.REFERRED ? "PNP Olongapo City" : null,
        deadlineDate: addDays(submittedAt, 60),
        dismissedReason: status === CaseStatus.DISMISSED ? "Complainant failed to appear after notices." : null,
        imageUrl: index % 5 === 0 ? "https://placehold.co/800x600/png?text=IRIS+Evidence" : null,
        incidentStreet: street.name,
        incidentPurok: street.purok,
        incidentLatitude: street.lat,
        incidentLongitude: street.lng,
        incidentAccuracy: 16 + (index % 8),
        incidentLocation: describeEastTapinacLocation(street),
        incidentDate: addDays(submittedAt, -1 - (index % 5)),
        dateSubmitted: submittedAt,
        updatedAt: addDays(submittedAt, 1 + (index % 12)),
      },
    })
    cases.push(created)
  }

  for (let index = 0; index < 20; index += 1) {
    await prisma.evidence.create({
      data: {
        caseId: cases[index % cases.length].id,
        fileUrl: `https://placehold.co/640x480/png?text=Evidence+${index + 1}`,
        fileType: index % 3 === 0 ? "document" : "image",
        uploadedAt: addDays(cases[index % cases.length].dateSubmitted, 1),
      },
    })
  }

  const hearingCaseIndexes = [4, 5, 6, 10, 11, 12, 14, 19, 20, 21, 23, 24]
  for (let index = 0; index < hearingCaseIndexes.length; index += 1) {
    const relatedCase = cases[hearingCaseIndexes[index]]
    const completed = index % 3 !== 0
    await prisma.hearing.create({
      data: {
        caseId: relatedCase.id,
        conductedBy: officers[3 + (index % 2)]?.id ?? officers[index % officers.length].id,
        hearingNumber: 1 + (index % 2),
        stage: index > 6 ? HearingStage.CONCILIATION : HearingStage.MEDIATION,
        scheduledDate: addDays(relatedCase.dateSubmitted, 5 + index),
        scheduledTime: index % 2 === 0 ? "09:00 AM" : "02:00 PM",
        location: "Barangay East Tapinac Hall",
        notes: completed ? "Session notes recorded for seeded mediation workflow." : "Awaiting scheduled appearance.",
        complainantAttended: completed,
        respondentAttended: completed && index % 4 !== 0,
        outcome: completed ? (index % 4 === 0 ? HearingOutcome.ADJOURNED : HearingOutcome.RESOLVED) : null,
        status: completed ? HearingStatus.COMPLETED : HearingStatus.SCHEDULED,
        createdAt: addDays(relatedCase.dateSubmitted, 2),
        updatedAt: addDays(relatedCase.dateSubmitted, 5 + index),
      },
    })
  }

  const settlementCaseIndexes = [6, 12, 14, 19, 20, 21, 23, 24]
  for (let index = 0; index < settlementCaseIndexes.length; index += 1) {
    const relatedCase = cases[settlementCaseIndexes[index]]
    const signedAt = addDays(relatedCase.dateSubmitted, 9 + index)
    await prisma.settlement.create({
      data: {
        caseId: relatedCase.id,
        agreementText: "Both parties agreed to comply with barangay mediation terms and avoid further escalation.",
        proofUrl: index % 2 === 0 ? `https://placehold.co/640x480/png?text=Settlement+${index + 1}` : null,
        complainantSigned: true,
        respondentSigned: index % 3 !== 0,
        signedAt,
        createdAt: signedAt,
      },
    })

    await prisma.caseMonitoring.create({
      data: {
        caseId: relatedCase.id,
        monitoringStart: addDays(signedAt, 1),
        monitoringEnd: addDays(signedAt, 11),
        isRepudiated: index === 3,
        repudiatedAt: index === 3 ? addDays(signedAt, 6) : null,
        repudiationReason: index === 3 ? "Respondent failed to follow settlement terms." : null,
        isClosed: index !== 3,
        closedAt: index !== 3 ? addDays(signedAt, 12) : null,
        createdAt: signedAt,
      },
    })
  }

  const statusFlow = [
    CaseStatus.PENDING,
    CaseStatus.UNDER_REVIEW,
    CaseStatus.ACCEPTED,
    CaseStatus.ASSIGNED,
    CaseStatus.SCHEDULED,
    CaseStatus.ONGOING,
    CaseStatus.RESOLVED,
  ]
  for (let index = 0; index < 30; index += 1) {
    const relatedCase = cases[index % cases.length]
    const oldStatus = statusFlow[index % (statusFlow.length - 1)]
    const newStatus = statusFlow[(index % (statusFlow.length - 1)) + 1]
    await prisma.caseStatusHistory.create({
      data: {
        caseId: relatedCase.id,
        changedBy: admin.id,
        oldStatus,
        newStatus,
        changedAt: addDays(relatedCase.dateSubmitted, 1 + (index % 8)),
      },
    })
  }

  const announcements = []
  const announcementTitles = [
    "Barangay Clean-Up Drive",
    "Lupon Mediation Schedule Advisory",
    "Road Clearing Notice",
    "Emergency Hotline Reminder",
    "Community Watch Orientation",
  ]
  for (let index = 0; index < announcementTitles.length; index += 1) {
    announcements.push(await prisma.announcement.create({
      data: {
        createdBy: admin.id,
        title: announcementTitles[index],
        content: `${announcementTitles[index]} details and reminders for East Tapinac residents.`,
        imageUrl: index % 2 === 0 ? "https://placehold.co/900x500/png?text=Barangay+Advisory" : null,
        publishedAt: dateIn(1 + index, 6 + index, 8),
      },
    }))
  }

  for (let index = 0; index < 25; index += 1) {
    await prisma.notification.create({
      data: {
        userId: residents[index % residents.length].id,
        message: index % 2 === 0
          ? `${cases[index % cases.length].type} has a new status update.`
          : announcementTitles[index % announcementTitles.length],
        type: Object.values(NotificationType)[index % Object.values(NotificationType).length],
        isRead: index % 4 === 0,
        createdAt: addDays(cases[index % cases.length].dateSubmitted, 2 + (index % 10)),
      },
    })
  }

  for (let index = 0; index < 20; index += 1) {
    const relatedCase = cases[(index + 3) % cases.length]
    await prisma.caseChatMessage.create({
      data: {
        caseId: relatedCase.id,
        senderId: index % 2 === 0 ? relatedCase.complainantId : admin.id,
        senderRole: index % 2 === 0 ? "RESIDENT" : "ADMIN",
        message: index % 2 === 0
          ? "I am available for follow-up and can provide more details."
          : "Your report is being reviewed. Please keep your contact line open.",
        createdAt: addDays(relatedCase.dateSubmitted, 1 + (index % 7)),
      },
    })
  }

  const activityLabels = ["Signed in", "Submitted report", "Viewed case update", "Updated profile", "Read notification"]
  for (let index = 0; index < 25; index += 1) {
    const user = index % 5 === 0 ? admin : residents[index % residents.length]
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        label: activityLabels[index % activityLabels.length],
        detail: `Seeded activity ${index + 1} for IRIS workflow testing.`,
        category: index % 3 === 0 ? "account" : index % 3 === 1 ? "case" : "notification",
        status: index % 4 === 0 ? "completed" : "active",
        createdAt: dateIn(1 + (index % 5), 3 + (index % 24), 7 + (index % 8)),
      },
    })
  }

  const appSettings: Array<{ key: string; value: Prisma.InputJsonValue }> = [
    {
      key: "aiConfig",
      value: {
        highPriorityThreshold: "7.0",
        criticalPriorityThreshold: "9.0",
        autoConfidence: "85",
      },
    },
    {
      key: "categories",
      value: [
        "Violence or Threats",
        "Harassment & Abuse",
        "Fraud & Scams",
        "Public Disturbance",
        "Property & Theft",
        "Community Dispute",
        "Child & Vulnerable Protection",
      ],
    },
    {
      key: "permissions",
      value: [
        { role: "Admin", allowed: ["Full System Access", "User Management", "Edit Settings", "Export Data"], denied: [] },
        { role: "Officer", allowed: ["View Cases", "Update Status"], denied: ["Delete Cases", "User Management"] },
        { role: "Resident", allowed: ["Submit Reports", "View Own Cases"], denied: ["Admin Dashboard"] },
      ],
    },
  ]

  for (const setting of appSettings) {
    await prisma.appSetting.create({ data: setting })
  }

  const auditTargets = [
    ...cases.map((item) => ({ table: "cases", id: item.id })),
    ...residents.map((item) => ({ table: "users", id: item.id })),
    { table: "users", id: testAdmin.id },
    ...announcements.map((item) => ({ table: "announcements", id: item.id })),
  ]
  for (let index = 0; index < 20; index += 1) {
    const target = auditTargets[index % auditTargets.length]
    await prisma.auditLog.create({
      data: {
        actorId: index % 5 === 0 ? officers[index % officers.length].userId : admin.id,
        action: Object.values(AuditAction)[index % Object.values(AuditAction).length],
        targetTable: target.table,
        targetId: target.id,
        changes: {
          seeded: true,
          month: 1 + (index % 5),
          note: `Audit trail seed entry ${index + 1}`,
        },
        loggedAt: dateIn(1 + (index % 5), 5 + (index % 20), 11),
      },
    })
  }

  console.log(`IRIS seed complete: ${residents.length + officerProfiles.length + 2} users, ${cases.length} cases, all tables populated.`)
  console.log(`Test logins: resident@gmail.com / ${SEED_PASSWORD}, officer@gmail.com / ${SEED_PASSWORD}, admin@gmail.com / ${SEED_PASSWORD}.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

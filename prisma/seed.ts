import {
  pbkdf2Sync,
  randomBytes,
} from "node:crypto"

import {
  PrismaClient,
  UserRole,
  UserStatus,
  Gender,
  OfficerRoleTitle,
  CaseCategory,
  CasePriority,
  CaseStatus,
  HearingStage,
  HearingStatus,
  HearingOutcome,
  NotificationType,
  AuditAction,
} from "../src/generated/prisma/client"

import { PrismaPg } from "@prisma/adapter-pg"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

// ================= HELPERS =================
function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randDate(days = 30) {
  return new Date(Date.now() - Math.random() * days * 86400000)
}

function hashSeedPassword(password: string) {
  const iterations = 120000
  const salt = randomBytes(16).toString("hex")
  const hash = pbkdf2Sync(password, salt, iterations, 64, "sha512").toString("hex")
  return `${iterations}:${salt}:${hash}`
}

async function main() {
  // ================= CLEAN =================
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
  await prisma.user.deleteMany()

  // ================= USERS =================
  const residents = []

  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        fullName: `Resident ${i}`,
        email: `resident${i}@iris.com`,
        password: hashSeedPassword("Password123"),
        contact: `0917000000${i}`,
        street: `Sample Street ${i}`,
        gender: rand([Gender.MALE, Gender.FEMALE]),
        role: UserRole.RESIDENT,
        status: UserStatus.ACTIVE,
      },
    })
    residents.push(user)
  }

  const admin = await prisma.user.create({
    data: {
      fullName: "Admin",
      email: "admin@iris.com",
      password: hashSeedPassword("Password123"),
      street: "Barangay Hall",
      role: UserRole.ADMIN,
    },
  })

  const officerUsers = []
  for (let i = 1; i <= 5; i++) {
    const u = await prisma.user.create({
      data: {
        fullName: `Officer ${i}`,
        email: `officer${i}@iris.com`,
        password: hashSeedPassword("Password123"),
        street: "Barangay Hall",
        role: i <= 3 ? UserRole.BPAT_OFFICER : UserRole.LUPON,
      },
    })
    officerUsers.push(u)
  }

  // ================= OFFICERS =================
  const officers = []
  for (let i = 0; i < officerUsers.length; i++) {
    const officer = await prisma.officer.create({
      data: {
        userId: officerUsers[i].id,
        fullName: officerUsers[i].fullName,
        roleTitle:
          i <= 2
            ? OfficerRoleTitle.BPAT_OFFICER
            : OfficerRoleTitle.LUPON_MEMBER,
      },
    })
    officers.push(officer)
  }

  // ================= CASES =================
  const cases = []

  for (let i = 1; i <= 25; i++) {
    const c = await prisma.case.create({
      data: {
        complainantId: rand(residents).id,
        respondentId: Math.random() > 0.5 ? rand(residents).id : null,
        respondentName: Math.random() > 0.5 ? `Respondent ${i}` : null,
        respondentContact: null,
        respondentAddress: null,
        category: rand(Object.values(CaseCategory)),
        type: `Case Type ${i}`,
        details: `Details for case ${i}`,
        priority: rand(Object.values(CasePriority)),
        status: rand(Object.values(CaseStatus)),
        assignedOfficerId:
          Math.random() > 0.5 ? rand(officers).id : null,
        incidentDate: randDate(),
      },
    })
    cases.push(c)
  }

  // ================= EVIDENCE =================
  for (let i = 0; i < 20; i++) {
    await prisma.evidence.create({
      data: {
        caseId: rand(cases).id,
        fileUrl: "https://via.placeholder.com/300",
        fileType: "image",
      },
    })
  }

  // ================= HEARINGS =================
  for (let i = 0; i < 12; i++) {
    await prisma.hearing.create({
      data: {
        caseId: rand(cases).id,
        hearingNumber: i + 1,
        stage: rand([HearingStage.MEDIATION, HearingStage.CONCILIATION]),
        scheduledDate: randDate(),
        scheduledTime: "10:00 AM",
        location: "Barangay Hall",
        status: rand(Object.values(HearingStatus)),
        outcome: rand(Object.values(HearingOutcome)),
        conductedBy: rand(officers).id,
      },
    })
  }

  // ================= SETTLEMENTS (UNIQUE CASES ONLY) =================
  const usedCases = new Set<string>()

  for (let i = 0; i < 8; i++) {
    let c
    do {
      c = rand(cases)
    } while (usedCases.has(c.id))

    usedCases.add(c.id)

    await prisma.settlement.create({
      data: {
        caseId: c.id,
        agreementText: "Settlement reached between parties.",
        complainantSigned: true,
        respondentSigned: true,
        signedAt: new Date(),
      },
    })
  }

  // ================= MONITORING =================
  for (let i = 0; i < 8; i++) {
    await prisma.caseMonitoring.create({
      data: {
        caseId: rand(cases).id,
        monitoringStart: new Date(),
        monitoringEnd: new Date(Date.now() + 7 * 86400000),
        isClosed: Math.random() > 0.5,
      },
    })
  }

  // ================= STATUS HISTORY =================
  for (let i = 0; i < 30; i++) {
    await prisma.caseStatusHistory.create({
      data: {
        caseId: rand(cases).id,
        changedBy: admin.id,
        oldStatus: rand(Object.values(CaseStatus)),
        newStatus: rand(Object.values(CaseStatus)),
      },
    })
  }

  // ================= ANNOUNCEMENTS =================
  for (let i = 1; i <= 5; i++) {
    await prisma.announcement.create({
      data: {
        createdBy: admin.id,
        title: `Announcement ${i}`,
        content: `Barangay update ${i}`,
      },
    })
  }

  // ================= NOTIFICATIONS =================
  for (let i = 0; i < 25; i++) {
    await prisma.notification.create({
      data: {
        userId: rand(residents).id,
        message: `Notification ${i + 1}`,
        type: rand(Object.values(NotificationType)),
      },
    })
  }

  // ================= AUDIT LOGS =================
  for (let i = 0; i < 20; i++) {
    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        action: rand(Object.values(AuditAction)),
        targetTable: "cases",
        targetId: rand(cases).id,
        changes: { updated: true },
      },
    })
  }

  console.log("🌱 IRIS FULL SEED COMPLETE")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

import { NextResponse } from "next/server"
import { UserRole } from "@/generated/prisma/client"
import { createEmailChangeCode } from "@/lib/auth-verification"
import { sendVerificationEmail } from "@/lib/mail"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const currentEmail = String(body.email ?? "").trim().toLowerCase()
    const nextEmail = String(body.nextEmail ?? "").trim().toLowerCase()

    if (!currentEmail || !nextEmail || !nextEmail.includes("@")) {
      return NextResponse.json({ success: false, message: "Valid current and new email addresses are required", data: null }, { status: 400 })
    }

    const [resident, existing] = await Promise.all([
      prisma.user.findFirst({ where: { email: currentEmail, role: UserRole.RESIDENT, isArchived: false }, select: { id: true } }),
      prisma.user.findUnique({ where: { email: nextEmail }, select: { id: true } }),
    ])

    if (!resident) {
      return NextResponse.json({ success: false, message: "Resident account not found", data: null }, { status: 404 })
    }

    if (existing) {
      return NextResponse.json({ success: false, message: "Email address is already in use", data: null }, { status: 409 })
    }

    const code = createEmailChangeCode(currentEmail, nextEmail)
    await sendVerificationEmail({
      to: nextEmail,
      code,
      subject: "Confirm your IRIS email change",
      intro: "Use this 6-digit code to confirm your new IRIS email address:",
    })

    return NextResponse.json({ success: true, message: "Verification code sent", data: { nextEmail } })
  } catch (error) {
    console.error("Failed to request resident email change:", error)
    return NextResponse.json({ success: false, message: "Failed to send verification code", data: null }, { status: 500 })
  }
}

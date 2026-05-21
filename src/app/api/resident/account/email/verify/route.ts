import { NextResponse } from "next/server"
import { UserRole } from "@/generated/prisma/client"
import { clearPendingEmailChange, getPendingEmailChange } from "@/lib/auth-verification"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const currentEmail = String(body.email ?? "").trim().toLowerCase()
    const code = String(body.code ?? "").trim()
    const pending = getPendingEmailChange(currentEmail, code)

    if (!pending) {
      return NextResponse.json({ success: false, message: "Invalid or expired verification code", data: null }, { status: 400 })
    }

    const resident = await prisma.user.findFirst({
      where: { email: pending.currentEmail, role: UserRole.RESIDENT, isArchived: false },
      select: { id: true },
    })

    if (!resident) {
      return NextResponse.json({ success: false, message: "Resident account not found", data: null }, { status: 404 })
    }

    const updated = await prisma.user.update({
      where: { id: resident.id },
      data: { email: pending.nextEmail },
      select: {
        fullName: true,
        email: true,
        contact: true,
        street: true,
        photoUrl: true,
        passwordLastUpdated: true,
        twoFactorEnabled: true,
      },
    })

    clearPendingEmailChange(currentEmail)

    return NextResponse.json({
      success: true,
      message: "Email address updated",
      data: {
        fullName: updated.fullName,
        email: updated.email,
        phone: updated.contact ?? "",
        street: updated.street ?? "",
        photoUrl: updated.photoUrl ?? "",
        passwordLastUpdated: updated.passwordLastUpdated?.toISOString() ?? null,
        twoFactorEnabled: updated.twoFactorEnabled,
      },
    })
  } catch (error) {
    console.error("Failed to verify resident email change:", error)
    return NextResponse.json({ success: false, message: "Failed to update email address", data: null }, { status: 500 })
  }
}

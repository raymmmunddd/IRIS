import { NextResponse } from "next/server"
import { UserRole } from "@/generated/prisma/client"
import { hashPassword, verifyPassword } from "@/lib/auth-data"
import { prisma } from "@/lib/prisma"

async function findResident(email: string) {
  return prisma.user.findFirst({
    where: {
      email: email.trim().toLowerCase(),
      role: UserRole.RESIDENT,
      isArchived: false,
    },
  })
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const user = await findResident(String(body.email ?? ""))

    if (!user) {
      return NextResponse.json({ success: false, message: "Resident account not found", data: null }, { status: 404 })
    }

    const data: { twoFactorEnabled?: boolean; password?: string; passwordLastUpdated?: Date } = {}

    if (typeof body.twoFactorEnabled === "boolean") {
      data.twoFactorEnabled = body.twoFactorEnabled
    }

    if (body.currentPassword || body.newPassword || body.confirmPassword) {
      if (!verifyPassword(String(body.currentPassword ?? ""), user.password)) {
        return NextResponse.json({ success: false, message: "Current password is incorrect", data: null }, { status: 400 })
      }

      const newPassword = String(body.newPassword ?? "")
      if (newPassword !== String(body.confirmPassword ?? "")) {
        return NextResponse.json({ success: false, message: "Passwords do not match", data: null }, { status: 400 })
      }

      if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
        return NextResponse.json({
          success: false,
          message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
          data: null,
        }, { status: 400 })
      }

      data.password = hashPassword(newPassword)
      data.passwordLastUpdated = new Date()
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
      select: {
        email: true,
        passwordLastUpdated: true,
        twoFactorEnabled: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Security settings updated",
      data: {
        email: updated.email,
        passwordLastUpdated: updated.passwordLastUpdated?.toISOString() ?? null,
        twoFactorEnabled: updated.twoFactorEnabled,
      },
    })
  } catch (error) {
    console.error("Failed to update resident security:", error)
    return NextResponse.json({ success: false, message: "Failed to update security settings", data: null }, { status: 500 })
  }
}

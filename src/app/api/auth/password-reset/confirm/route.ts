import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, isValidPassword } from "@/lib/auth-data"
import { hashPasswordResetCode } from "@/lib/password-reset"

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    const input = body && typeof body === "object" ? body as Record<string, unknown> : {}
    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : ""
    const code = typeof input.code === "string" ? input.code.trim() : ""
    const password = typeof input.password === "string" ? input.password : ""

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ success: false, message: "Enter a valid email and 6-digit code.", data: null }, { status: 400 })
    }
    if (!isValidPassword(password)) {
      return NextResponse.json({ success: false, message: "Password must be at least 8 characters with uppercase and lowercase letters, a number, and a symbol.", data: null }, { status: 400 })
    }

    const now = new Date()
    const codeHash = hashPasswordResetCode(email, code)
    const newPasswordHash = hashPassword(password)
    const updated = await prisma.$transaction(async (transaction) => {
      const claimed = await transaction.passwordResetCode.updateMany({
        where: { email, codeHash, expiresAt: { gt: now }, attempts: { lt: 5 }, consumedAt: null },
        data: { consumedAt: now },
      })

      if (claimed.count !== 1) {
        await transaction.passwordResetCode.updateMany({
          where: { email, expiresAt: { gt: now }, attempts: { lt: 5 }, consumedAt: null },
          data: { attempts: { increment: 1 } },
        })
        return false
      }

      const user = await transaction.user.findUnique({ where: { email }, select: { id: true } })
      if (!user) return false

      await transaction.user.update({
        where: { id: user.id },
        data: { password: newPasswordHash, passwordLastUpdated: now },
      })
      await transaction.passwordResetCode.delete({ where: { email } })
      return true
    })

    if (!updated) {
      return NextResponse.json({ success: false, message: "Invalid or expired verification code.", data: null }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Password reset complete. You can sign in with your new password.", data: null })
  } catch (error) {
    console.error("Failed to reset password:", error)
    return NextResponse.json({ success: false, message: "Unable to reset the password right now. Try again later.", data: null }, { status: 500 })
  }
}

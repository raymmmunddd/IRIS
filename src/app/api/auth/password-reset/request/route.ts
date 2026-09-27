import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createPasswordResetCode, hashPasswordResetCode } from "@/lib/password-reset"
import { sendPasswordResetEmail } from "@/lib/mail"

const genericMessage = "If an account exists for that email, a verification code has been sent."

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    const email = body && typeof body === "object" && "email" in body && typeof body.email === "string"
      ? body.email.trim().toLowerCase()
      : ""
    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: "Enter a valid email address.", data: null }, { status: 400 })
    }

    if (process.env.NODE_ENV === "production" && !process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: false, message: "Password reset email delivery is not configured. Contact an administrator.", data: null }, { status: 503 })
    }

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
    if (!user) {
      return NextResponse.json({ success: true, message: genericMessage, data: null }, { status: 202 })
    }

    const now = new Date()
    const current = await prisma.passwordResetCode.findUnique({ where: { email }, select: { createdAt: true } })
    if (current && now.getTime() - current.createdAt.getTime() < 60_000) {
      return NextResponse.json({ success: true, message: genericMessage, data: null }, { status: 202 })
    }

    const code = createPasswordResetCode()
    const codeHash = hashPasswordResetCode(email, code)
    await prisma.passwordResetCode.upsert({
      where: { email },
      create: {
        email,
        codeHash,
        expiresAt: new Date(now.getTime() + 10 * 60_000),
        createdAt: now,
        attempts: 0,
        consumedAt: null,
      },
      update: {
        codeHash,
        expiresAt: new Date(now.getTime() + 10 * 60_000),
        createdAt: now,
        attempts: 0,
        consumedAt: null,
      },
    })

    try {
      const mail = await sendPasswordResetEmail({ to: email, code })
      return NextResponse.json({
        success: true,
        message: genericMessage,
        data: process.env.NODE_ENV === "development" && !mail.sent ? { devCode: code } : null,
      }, { status: 202 })
    } catch (error) {
      await prisma.passwordResetCode.deleteMany({ where: { email, codeHash } })
      throw error
    }
  } catch (error) {
    console.error("Failed to request password reset:", error)
    return NextResponse.json({ success: false, message: "Unable to send a reset code right now. Try again later.", data: null }, { status: 500 })
  }
}

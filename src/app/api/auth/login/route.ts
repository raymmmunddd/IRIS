import { NextResponse } from "next/server"
import { AuditAction } from "@/generated/prisma/client"
import { validateLoginCredentialsData } from "@/lib/auth-data"
import { createUserActivityData } from "@/lib/admin-account-data"
import { writeAuditLog } from "@/lib/audit-logs"
import { createLoginVerificationCode, verifyLoginCode } from "@/lib/auth-verification"
import { sendVerificationEmail } from "@/lib/mail"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const login = await validateLoginCredentialsData({
      email: body.email,
      password: body.password,
    })

    if (!login) {
      return NextResponse.json({ success: false, message: "Invalid email or password.", data: null }, { status: 401 })
    }

    if (login.twoFactorEnabled) {
      if (!body.code) {
        const code = createLoginVerificationCode(login.authUser.email)
        await sendVerificationEmail({
          to: login.authUser.email,
          code,
          subject: "Your IRIS login verification code",
          intro: "Use this 6-digit code to finish signing in to IRIS:",
        })

        return NextResponse.json({
          success: true,
          message: "Verification code sent",
          data: null,
          requiresTwoFactor: true,
        })
      }

      if (!verifyLoginCode(login.authUser.email, String(body.code))) {
        return NextResponse.json({
          success: false,
          message: "Invalid or expired verification code.",
          data: null,
          requiresTwoFactor: true,
        }, { status: 401 })
      }
    }

    const data = login.authUser

    const loginLabel = data.role === "official" ? "Admin login" : data.role === "bpat" ? "Officer login" : "Resident login"
    const [activityResult, auditResult] = await Promise.allSettled([
      createUserActivityData({
        email: data.email,
        label: loginLabel,
        detail: `Signed in with ${data.email} (${data.role}).`,
        category: "security",
      }),
      writeAuditLog({
        actorId: data.id,
        action: AuditAction.LOGIN,
        target: { table: "users", id: data.id },
        changes: {
          email: data.email,
          role: data.role,
        },
      }),
    ])

    if (activityResult.status === "rejected") {
      console.error("Failed to write login activity:", activityResult.reason)
    }

    if (auditResult.status === "rejected") {
      console.error("Failed to write login audit log:", auditResult.reason)
    }

    return NextResponse.json({ success: true, message: "Login successful", data })
  } catch (error) {
    console.error("Failed to login:", error)
    return NextResponse.json({ success: false, message: "Failed to login", data: null }, { status: 500 })
  }
}

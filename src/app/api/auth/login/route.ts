import { NextResponse } from "next/server"
import { AuditAction } from "@/generated/prisma/client"
import { loginUserData } from "@/lib/auth-data"
import { createUserActivityData } from "@/lib/admin-account-data"
import { writeAuditLog } from "@/lib/audit-logs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = await loginUserData({
      email: body.email,
      password: body.password,
    })

    if (!data) {
      return NextResponse.json({ success: false, message: "Invalid email or password.", data: null }, { status: 401 })
    }

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

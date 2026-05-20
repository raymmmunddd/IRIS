import { NextResponse } from "next/server"
import { activeUserExists, resetUserPassword, validateNewPassword } from "@/lib/auth-data"
import { clearPendingPasswordReset, getPendingPasswordReset } from "@/lib/auth-verification"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = String(body.email ?? "").trim().toLowerCase()
    const code = String(body.code ?? "").trim()
    const password = String(body.password ?? "")
    const confirmPassword = String(body.confirmPassword ?? "")

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, message: "Enter a valid email address.", data: null }, { status: 400 })
    }

    const passwordError = validateNewPassword({ password, confirmPassword })
    if (passwordError) {
      return NextResponse.json({ success: false, message: passwordError, data: null }, { status: 400 })
    }

    const pending = getPendingPasswordReset(email, code)
    if (!pending) {
      return NextResponse.json({ success: false, message: "Invalid or expired verification code.", data: null }, { status: 400 })
    }

    if (!(await activeUserExists(email))) {
      clearPendingPasswordReset(email)
      return NextResponse.json({ success: false, message: "No active IRIS account was found for this email.", data: null }, { status: 404 })
    }

    const data = await resetUserPassword(email, password)
    clearPendingPasswordReset(email)

    return NextResponse.json({ success: true, message: "Password reset successfully", data }, { status: 200 })
  } catch (error) {
    console.error("Failed to reset password:", error)
    return NextResponse.json({ success: false, message: "Failed to reset password", data: null }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { activeUserExists } from "@/lib/auth-data"
import { createPasswordResetCode } from "@/lib/auth-verification"
import { sendPasswordResetEmail } from "@/lib/mail"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = String(body.email ?? "").trim().toLowerCase()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, message: "Enter a valid email address.", data: null }, { status: 400 })
    }

    if (!(await activeUserExists(email))) {
      return NextResponse.json({ success: false, message: "No active IRIS account was found for this email.", data: null }, { status: 404 })
    }

    const code = createPasswordResetCode(email)
    const mail = await sendPasswordResetEmail({ to: email, code })

    return NextResponse.json({
      success: true,
      message: "Password reset code sent",
      data: {
        email,
        devCode: mail.sent ? undefined : code,
      },
    })
  } catch (error) {
    console.error("Failed to request password reset:", error)
    return NextResponse.json({ success: false, message: "Failed to send password reset code", data: null }, { status: 500 })
  }
}

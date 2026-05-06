import { NextResponse } from "next/server"
import { createVerifiedUserData, emailExists } from "@/lib/auth-data"
import { clearPendingSignup, getPendingSignup } from "@/lib/auth-verification"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = String(body.email ?? "")
    const code = String(body.code ?? "")
    const pending = getPendingSignup(email, code)

    if (!pending) {
      return NextResponse.json({ success: false, message: "Invalid or expired verification code.", data: null }, { status: 400 })
    }

    if (await emailExists(email)) {
      clearPendingSignup(email)
      return NextResponse.json({ success: false, message: "An account already exists for this email.", data: null }, { status: 409 })
    }

    const data = await createVerifiedUserData(pending)
    clearPendingSignup(email)

    return NextResponse.json({ success: true, message: "Account verified and created", data }, { status: 201 })
  } catch (error) {
    console.error("Failed to verify signup:", error)
    return NextResponse.json({ success: false, message: "Failed to verify account", data: null }, { status: 500 })
  }
}

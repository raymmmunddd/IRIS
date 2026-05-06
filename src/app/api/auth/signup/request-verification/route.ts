import { NextResponse } from "next/server"
import { emailExists, validateSignupInput } from "@/lib/auth-data"
import { createVerificationCode } from "@/lib/auth-verification"
import { sendVerificationEmail } from "@/lib/mail"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const input = {
      fullName: body.fullName,
      email: body.email,
      password: body.password,
      confirmPassword: body.confirmPassword,
      role: body.role,
      street: body.street,
      contact: body.contact,
      gender: body.gender,
    }

    const validationError = validateSignupInput(input)
    if (validationError) {
      return NextResponse.json({ success: false, message: validationError, data: null }, { status: 400 })
    }

    if (await emailExists(input.email)) {
      return NextResponse.json({ success: false, message: "An account already exists for this email.", data: null }, { status: 409 })
    }

    const code = createVerificationCode(input)
    const mail = await sendVerificationEmail({ to: input.email, code })

    return NextResponse.json({
      success: true,
      message: "Verification code sent",
      data: {
        email: input.email,
        devCode: mail.sent ? undefined : code,
      },
    })
  } catch (error) {
    console.error("Failed to request signup verification:", error)
    return NextResponse.json({ success: false, message: "Failed to send verification code", data: null }, { status: 500 })
  }
}

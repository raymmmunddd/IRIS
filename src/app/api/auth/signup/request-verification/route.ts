import { NextResponse } from "next/server"
import { emailExists, validateSignupInput, type SignupInput } from "@/lib/auth-data"
import { createVerificationCode } from "@/lib/auth-verification"
import { sendVerificationEmail } from "@/lib/mail"

export async function POST(request: Request) {
  try {
    const body = await request.formData()
    const textField = (name: string) => {
      const value = body.get(name)
      return typeof value === "string" ? value : ""
    }
    const governmentId = body.get("governmentId")
    const isIdFile = governmentId !== null && typeof governmentId !== "string"
    const optionalNumber = (name: string) => {
      const value = textField(name)
      return value ? Number(value) : null
    }
    const input: SignupInput = {
      fullName: textField("fullName"),
      email: textField("email"),
      password: textField("password"),
      role: "resident",
      street: textField("street"),
      contact: textField("contact"),
      gender: textField("gender") as SignupInput["gender"],
      genderOther: textField("genderOther"),
      dateOfBirth: textField("dateOfBirth"),
      governmentIdImage: isIdFile && governmentId.size <= 4 * 1024 * 1024
        ? Buffer.from(await governmentId.arrayBuffer()).toString("base64")
        : "",
      governmentIdMimeType: isIdFile ? governmentId.type : "",
      locationLatitude: optionalNumber("locationLatitude"),
      locationLongitude: optionalNumber("locationLongitude"),
      locationAccuracy: optionalNumber("locationAccuracy"),
      locationAddress: textField("locationAddress") || null,
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

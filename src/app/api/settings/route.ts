import { NextResponse } from "next/server"
import {
  getAdminSecurityData,
  updateAdminPasswordData,
  updateAdminTwoFactorData,
} from "@/lib/admin-account-data"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required", data: null }, { status: 400 })
    }

    const data = await getAdminSecurityData(email)
    if (!data) {
      return NextResponse.json({ success: false, message: "Security settings not found", data: null }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Security settings loaded", data })
  } catch (error) {
    console.error("Failed to load security settings:", error)
    return NextResponse.json({ success: false, message: "Failed to load security settings", data: null }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    if (!body.email) {
      return NextResponse.json({ success: false, message: "Email is required", data: null }, { status: 400 })
    }

    if (body.action === "password") {
      const result = await updateAdminPasswordData(body.email, {
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
      })

      if (!result.ok) {
        return NextResponse.json({ success: false, message: result.message, data: null }, { status: 400 })
      }

      return NextResponse.json({ success: true, message: "Password updated", data: result.data })
    }

    if (body.action === "twoFactor") {
      const data = await updateAdminTwoFactorData(body.email, Boolean(body.enabled))
      if (!data) {
        return NextResponse.json({ success: false, message: "Security settings not found", data: null }, { status: 404 })
      }

      return NextResponse.json({ success: true, message: "Two-factor setting updated", data })
    }

    return NextResponse.json({ success: false, message: "Invalid settings action", data: null }, { status: 400 })
  } catch (error) {
    console.error("Failed to update security settings:", error)
    return NextResponse.json({ success: false, message: "Failed to update security settings", data: null }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { loginUserData } from "@/lib/auth-data"
import { createUserActivityData } from "@/lib/admin-account-data"
import { clearAdminSessionCookie, setAdminSessionCookie } from "@/lib/admin-session"

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
    if ("accountStatus" in data) {
      const message = data.accountStatus === "Pending"
        ? "Your email is verified. An administrator must review your ID before you can sign in."
        : "This account is suspended. Contact a system administrator for assistance."
      return NextResponse.json({ success: false, message, data: null }, { status: 403 })
    }

    await createUserActivityData({
      email: data.email,
      label: data.role === "official" ? "Admin login" : data.role === "bpat" ? "Officer login" : "Resident login",
      detail: `Signed in with ${data.email} (${data.role}).`,
      category: "security",
    })

    const response = NextResponse.json({ success: true, message: "Login successful", data })
    if (data.role === "official") setAdminSessionCookie(response, data.id)
    else clearAdminSessionCookie(response)
    return response
  } catch (error) {
    console.error("Failed to login:", error)
    return NextResponse.json({ success: false, message: "Failed to login", data: null }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { loginUserData } from "@/lib/auth-data"
import { createUserActivityData } from "@/lib/admin-account-data"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = await loginUserData({
      email: body.email,
      password: body.password,
      role: body.role,
    })

    if (!data) {
      return NextResponse.json({ success: false, message: "Invalid email, password, or role.", data: null }, { status: 401 })
    }

    await createUserActivityData({
      email: data.email,
      label: data.role === "official" ? "Admin login" : data.role === "bpat" ? "Officer login" : "Resident login",
      detail: `Signed in with ${data.email} (${data.role}).`,
      category: "security",
    })

    return NextResponse.json({ success: true, message: "Login successful", data })
  } catch (error) {
    console.error("Failed to login:", error)
    return NextResponse.json({ success: false, message: "Failed to login", data: null }, { status: 500 })
  }
}

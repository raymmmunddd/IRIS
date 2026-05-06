import { NextResponse } from "next/server"
import { getAdminActivityData } from "@/lib/admin-account-data"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required", data: null }, { status: 400 })
    }

    const data = await getAdminActivityData(email)
    return NextResponse.json({ success: true, message: "Activity loaded", data })
  } catch (error) {
    console.error("Failed to load activity:", error)
    return NextResponse.json({ success: false, message: "Failed to load activity", data: null }, { status: 500 })
  }
}

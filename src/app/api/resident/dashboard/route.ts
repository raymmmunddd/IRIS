import { NextResponse } from "next/server"
import { getResidentDashboardData } from "@/lib/resident-data"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ success: false, message: "Resident email is required", data: null }, { status: 400 })
    }

    const data = await getResidentDashboardData(email)
    return NextResponse.json({ success: true, message: "Resident dashboard loaded", data })
  } catch (error) {
    console.error("Failed to load resident dashboard:", error)
    return NextResponse.json({ success: false, message: "Failed to load resident dashboard", data: null }, { status: 500 })
  }
}

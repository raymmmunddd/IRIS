import { NextResponse } from "next/server"
import { getDashboardData } from "@/lib/iris-data"

export async function GET() {
  try {
    const data = await getDashboardData()
    return NextResponse.json({ success: true, message: "Dashboard data loaded", data })
  } catch (error) {
    console.error("Failed to load dashboard data:", error)
    return NextResponse.json({ success: false, message: "Failed to load dashboard data", data: null }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { getBpatDashboardData } from "@/lib/bpat-data"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const data = await getBpatDashboardData(searchParams.get("email"))
    return NextResponse.json({ success: true, message: "BPAT dashboard loaded", data })
  } catch (error) {
    console.error("Failed to load BPAT dashboard:", error)
    return NextResponse.json({ success: false, message: "Failed to load BPAT dashboard", data: null }, { status: 500 })
  }
}

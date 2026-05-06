import { NextResponse } from "next/server"
import { getReportsData } from "@/lib/iris-data"

export async function GET() {
  try {
    const data = await getReportsData()
    return NextResponse.json({ success: true, message: "Reports data loaded", data })
  } catch (error) {
    console.error("Failed to load reports data:", error)
    return NextResponse.json({ success: false, message: "Failed to load reports data", data: null }, { status: 500 })
  }
}

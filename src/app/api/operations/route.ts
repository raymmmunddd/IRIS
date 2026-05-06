import { NextResponse } from "next/server"
import { getOperationsData } from "@/lib/iris-data"

export async function GET() {
  try {
    const data = await getOperationsData()
    return NextResponse.json({ success: true, message: "Operations data loaded", data })
  } catch (error) {
    console.error("Failed to load operations data:", error)
    return NextResponse.json({ success: false, message: "Failed to load operations data", data: null }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { getOfficerNames } from "@/lib/iris-data"

export async function GET() {
  try {
    const data = await getOfficerNames()
    return NextResponse.json({ success: true, message: "Officers loaded", data })
  } catch (error) {
    console.error("Failed to load officers:", error)
    return NextResponse.json({ success: false, message: "Failed to load officers", data: ["Unassigned"] }, { status: 500 })
  }
}

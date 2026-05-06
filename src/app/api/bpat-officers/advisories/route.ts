import { NextResponse } from "next/server"
import { getBpatAdvisoriesData } from "@/lib/bpat-data"

export async function GET() {
  try {
    const data = await getBpatAdvisoriesData()
    return NextResponse.json({ success: true, message: "BPAT advisories loaded", data })
  } catch (error) {
    console.error("Failed to load BPAT advisories:", error)
    return NextResponse.json({ success: false, message: "Failed to load BPAT advisories", data: [] }, { status: 500 })
  }
}

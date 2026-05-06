import { NextResponse } from "next/server"
import { getBpatMapData } from "@/lib/bpat-data"

export async function GET() {
  try {
    const data = await getBpatMapData()
    return NextResponse.json({ success: true, message: "BPAT map data loaded", data })
  } catch (error) {
    console.error("Failed to load BPAT map data:", error)
    return NextResponse.json({ success: false, message: "Failed to load BPAT map data", data: null }, { status: 500 })
  }
}

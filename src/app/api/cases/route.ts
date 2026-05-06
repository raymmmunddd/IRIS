import { NextResponse } from "next/server"
import { getCasesData } from "@/lib/iris-data"

export async function GET() {
  try {
    const data = await getCasesData()
    return NextResponse.json({ success: true, message: "Cases loaded", data })
  } catch (error) {
    console.error("Failed to load cases:", error)
    return NextResponse.json({ success: false, message: "Failed to load cases", data: [] }, { status: 500 })
  }
}

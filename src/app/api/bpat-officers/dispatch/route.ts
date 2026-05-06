import { NextResponse } from "next/server"
import { getBpatAssignedCasesData } from "@/lib/bpat-data"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const data = await getBpatAssignedCasesData(searchParams.get("email"))
    return NextResponse.json({ success: true, message: "BPAT dispatch loaded", data })
  } catch (error) {
    console.error("Failed to load BPAT dispatch:", error)
    return NextResponse.json({ success: false, message: "Failed to load BPAT dispatch", data: [] }, { status: 500 })
  }
}

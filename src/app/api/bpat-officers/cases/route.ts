import { NextResponse } from "next/server"
import { claimBpatCaseData, getBpatOpenCasesData } from "@/lib/bpat-data"

export async function GET() {
  try {
    const data = await getBpatOpenCasesData()
    return NextResponse.json({ success: true, message: "BPAT open cases loaded", data })
  } catch (error) {
    console.error("Failed to load BPAT open cases:", error)
    return NextResponse.json({ success: false, message: "Failed to load BPAT open cases", data: [] }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()

    if (!body.caseId || !body.email) {
      return NextResponse.json({ success: false, message: "Case ID and officer email are required", data: null }, { status: 400 })
    }

    const data = await claimBpatCaseData({ caseId: body.caseId, email: body.email })
    return NextResponse.json({ success: true, message: "BPAT case claimed", data })
  } catch (error) {
    console.error("Failed to claim BPAT case:", error)
    return NextResponse.json({ success: false, message: "Failed to claim BPAT case", data: null }, { status: 500 })
  }
}

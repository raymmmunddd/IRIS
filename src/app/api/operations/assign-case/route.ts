import { NextResponse } from "next/server"
import { assignCaseData } from "@/lib/iris-data"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = await assignCaseData({ caseId: body.caseId, officerId: body.officerId })
    return NextResponse.json({ success: true, message: "Case assigned", data })
  } catch (error) {
    console.error("Failed to assign case:", error)
    return NextResponse.json({ success: false, message: "Failed to assign case", data: null }, { status: 500 })
  }
}

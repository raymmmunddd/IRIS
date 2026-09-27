import { NextResponse } from "next/server"
import { CaseProcessValidationError, transitionStatus, type CaseProcessEvent } from "@/lib/case-process"
import { getCaseData } from "@/lib/iris-data"

const events: CaseProcessEvent[] = [
  "hearing_scheduled", "not_settled", "settled", "absent", "withdrawn",
  "award_rendered", "repudiated", "resume", "execution_needed",
]

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()
    if (!body || typeof body !== "object" || !events.includes(body.event)) {
      return NextResponse.json({ success: false, message: "A valid case workflow event is required.", data: null }, { status: 400 })
    }
    const updated = await transitionStatus(id, body.event, body.payload ?? {})
    if (!updated) return NextResponse.json({ success: false, message: "Case not found.", data: null }, { status: 404 })
    const data = await getCaseData(id)
    return NextResponse.json({ success: true, message: "Case workflow updated.", data })
  } catch (error) {
    if (error instanceof CaseProcessValidationError) {
      return NextResponse.json({ success: false, message: error.message, data: null }, { status: 400 })
    }
    console.error("Failed to update case workflow:", error)
    return NextResponse.json({ success: false, message: "Failed to update case workflow.", data: null }, { status: 500 })
  }
}

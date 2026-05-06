import { NextResponse } from "next/server"
import { createHearingData } from "@/lib/iris-data"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = await createHearingData({
      caseId: body.caseId,
      mediator: body.mediator,
      scheduledDate: body.scheduledDate,
      scheduledTime: body.scheduledTime,
      location: body.location,
    })

    if (!data) {
      return NextResponse.json({ success: false, message: "Case not found", data: null }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Mediation session scheduled", data }, { status: 201 })
  } catch (error) {
    console.error("Failed to schedule mediation:", error)
    return NextResponse.json({ success: false, message: "Failed to schedule mediation", data: null }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { agreementTypes, createHearingData, recordHearingOutcomeData } from "@/lib/iris-data"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.caseId || !body.scheduledDate || !body.scheduledTime || !body.location) {
      return NextResponse.json({ success: false, message: "Case, date, time, and location are required.", data: null }, { status: 400 })
    }

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

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const outcomeNotes = typeof body.outcomeNotes === "string" ? body.outcomeNotes.trim() : ""
    const agreementType = typeof body.agreementType === "string" ? body.agreementType : ""
    const followUpNeeded = Boolean(body.followUpNeeded)

    if (!body.hearingId || !outcomeNotes || !(agreementTypes as readonly string[]).includes(agreementType)) {
      return NextResponse.json(
        { success: false, message: "Hearing, outcome notes, and agreement type are required.", data: null },
        { status: 400 }
      )
    }

    if (followUpNeeded && (!body.followUpDate || !body.followUpTime || !body.followUpLocation)) {
      return NextResponse.json(
        { success: false, message: "Follow-up date, time, and location are required.", data: null },
        { status: 400 }
      )
    }

    const data = await recordHearingOutcomeData({
      hearingId: body.hearingId,
      outcomeNotes,
      agreementType: agreementType as (typeof agreementTypes)[number],
      followUpDate: followUpNeeded ? body.followUpDate : undefined,
      followUpTime: followUpNeeded ? body.followUpTime : undefined,
      followUpLocation: followUpNeeded ? body.followUpLocation : undefined,
    })

    if (!data) {
      return NextResponse.json({ success: false, message: "Mediation session not found", data: null }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Mediation outcome recorded", data })
  } catch (error) {
    console.error("Failed to record mediation outcome:", error)
    return NextResponse.json({ success: false, message: "Failed to record mediation outcome", data: null }, { status: 500 })
  }
}

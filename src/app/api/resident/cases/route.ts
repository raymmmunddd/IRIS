import { NextResponse } from "next/server"
import { createResidentCaseData, getResidentCasesData } from "@/lib/resident-data"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ success: false, message: "Resident email is required", data: [] }, { status: 400 })
    }

    const data = await getResidentCasesData(email)
    return NextResponse.json({ success: true, message: "Resident cases loaded", data })
  } catch (error) {
    console.error("Failed to load resident cases:", error)
    return NextResponse.json({ success: false, message: "Failed to load resident cases", data: [] }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = await createResidentCaseData({
      fullName: body.fullName,
      category: body.category,
      incidentDate: body.incidentDate,
      contact: body.contact,
      email: body.email,
      street: body.street,
      incidentLatitude: body.incidentLatitude,
      incidentLongitude: body.incidentLongitude,
      incidentAccuracy: body.incidentAccuracy,
      incidentLocation: body.incidentLocation,
      details: body.details,
    })

    return NextResponse.json({ success: true, message: "Resident report filed", data }, { status: 201 })
  } catch (error) {
    console.error("Failed to file resident report:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to file resident report", data: null },
      { status: 400 }
    )
  }
}

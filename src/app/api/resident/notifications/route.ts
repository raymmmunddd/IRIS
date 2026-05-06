import { NextResponse } from "next/server"
import { getResidentNotificationsData, markResidentNotificationsReadData } from "@/lib/resident-data"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const limit = searchParams.get("limit")

    if (!email) {
      return NextResponse.json({ success: false, message: "Resident email is required", data: [] }, { status: 400 })
    }

    const data = await getResidentNotificationsData(email, limit ? Number(limit) : undefined)
    return NextResponse.json({ success: true, message: "Resident notifications loaded", data })
  } catch (error) {
    console.error("Failed to load resident notifications:", error)
    return NextResponse.json({ success: false, message: "Failed to load resident notifications", data: [] }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()

    if (!body.email) {
      return NextResponse.json({ success: false, message: "Resident email is required", data: null }, { status: 400 })
    }

    const data = await markResidentNotificationsReadData(body.email)
    return NextResponse.json({ success: true, message: "Resident notifications marked read", data })
  } catch (error) {
    console.error("Failed to mark resident notifications read:", error)
    return NextResponse.json({ success: false, message: "Failed to mark resident notifications read", data: null }, { status: 500 })
  }
}

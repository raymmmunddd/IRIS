import { NextResponse } from "next/server"
import { markResidentNotificationReadData } from "@/lib/resident-data"

type Params = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!body.email) {
      return NextResponse.json({ success: false, message: "Resident email is required", data: null }, { status: 400 })
    }

    const data = await markResidentNotificationReadData(body.email, id)

    if (!data) {
      return NextResponse.json({ success: false, message: "Notification not found", data: null }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Resident notification marked read", data })
  } catch (error) {
    console.error("Failed to mark resident notification read:", error)
    return NextResponse.json({ success: false, message: "Failed to mark resident notification read", data: null }, { status: 500 })
  }
}

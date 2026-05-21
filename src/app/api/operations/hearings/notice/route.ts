import { NextResponse } from "next/server"
import { sendMediationNoticeData } from "@/lib/iris-data"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.hearingId) {
      return NextResponse.json({ success: false, message: "Hearing is required", data: null }, { status: 400 })
    }

    const data = await sendMediationNoticeData(body.hearingId)

    if (!data) {
      return NextResponse.json({ success: false, message: "Unable to send notice", data: null }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Notice sent to resident notifications", data })
  } catch (error) {
    console.error("Failed to send mediation notice:", error)
    return NextResponse.json({ success: false, message: "Failed to send notice", data: null }, { status: 500 })
  }
}

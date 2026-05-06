import { NextResponse } from "next/server"
import { getResidentChatThreadData, sendCaseChatMessageData } from "@/lib/case-chat-data"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get("caseId")
    const email = searchParams.get("email")

    if (!caseId || !email) {
      return NextResponse.json({ success: false, message: "Case ID and email are required", data: null }, { status: 400 })
    }

    const data = await getResidentChatThreadData({ caseId, email })
    if (!data) {
      return NextResponse.json({ success: false, message: "Chat is available only after officer assignment", data: null }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Resident chat loaded", data })
  } catch (error) {
    console.error("Failed to load resident chat:", error)
    return NextResponse.json({ success: false, message: "Failed to load resident chat", data: null }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = await sendCaseChatMessageData({
      caseId: body.caseId,
      email: body.email,
      role: "resident",
      message: body.message,
    })

    if (!data) {
      return NextResponse.json({ success: false, message: "Unable to send message", data: null }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Message sent", data }, { status: 201 })
  } catch (error) {
    console.error("Failed to send resident chat message:", error)
    return NextResponse.json({ success: false, message: "Failed to send message", data: null }, { status: 500 })
  }
}

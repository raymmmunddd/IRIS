import { NextResponse } from "next/server"
import { getOfficerChatThreadsData, sendCaseChatMessageData } from "@/lib/case-chat-data"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const data = await getOfficerChatThreadsData(searchParams.get("email"))
    return NextResponse.json({ success: true, message: "BPAT chat threads loaded", data })
  } catch (error) {
    console.error("Failed to load BPAT chat threads:", error)
    return NextResponse.json({ success: false, message: "Failed to load BPAT chat threads", data: [] }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = await sendCaseChatMessageData({
      caseId: body.caseId,
      email: body.email,
      role: "officer",
      message: body.message,
    })

    if (!data) {
      return NextResponse.json({ success: false, message: "Unable to send message", data: null }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Message sent", data }, { status: 201 })
  } catch (error) {
    console.error("Failed to send BPAT chat message:", error)
    return NextResponse.json({ success: false, message: "Failed to send message", data: null }, { status: 500 })
  }
}

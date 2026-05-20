import { NextResponse } from "next/server"
import { getAdminCaseChatThreadData, sendCaseChatMessageData } from "@/lib/case-chat-data"

type Params = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const data = await getAdminCaseChatThreadData(id)

    if (!data) {
      return NextResponse.json({ success: false, message: "Case chat not found", data: null }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Case chat loaded", data })
  } catch (error) {
    console.error("Failed to load case chat:", error)
    return NextResponse.json({ success: false, message: "Failed to load case chat", data: null }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = await sendCaseChatMessageData({
      caseId: id,
      email: body.email,
      role: "admin",
      message: body.message,
    })

    if (!data) {
      return NextResponse.json({ success: false, message: "Unable to send message", data: null }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Message sent", data }, { status: 201 })
  } catch (error) {
    console.error("Failed to send case chat message:", error)
    return NextResponse.json({ success: false, message: "Failed to send message", data: null }, { status: 500 })
  }
}

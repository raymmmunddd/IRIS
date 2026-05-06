import { NextResponse } from "next/server"
import { createAnnouncementData } from "@/lib/iris-data"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = await createAnnouncementData({
      title: body.title,
      content: body.content,
    })

    if (!data) {
      return NextResponse.json({ success: false, message: "Admin author not found", data: null }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Announcement created", data }, { status: 201 })
  } catch (error) {
    console.error("Failed to create announcement:", error)
    return NextResponse.json({ success: false, message: "Failed to create announcement", data: null }, { status: 500 })
  }
}

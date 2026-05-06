import { NextResponse } from "next/server"
import { deleteAnnouncementData, updateAnnouncementData } from "@/lib/iris-data"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()

    if (!body.title?.trim() || !body.content?.trim()) {
      return NextResponse.json({ success: false, message: "Title and content are required", data: null }, { status: 400 })
    }

    const data = await updateAnnouncementData(id, {
      title: body.title.trim(),
      content: body.content.trim(),
    })

    return NextResponse.json({ success: true, message: "Announcement updated", data })
  } catch (error) {
    console.error("Failed to update announcement:", error)
    return NextResponse.json({ success: false, message: "Failed to update announcement", data: null }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const data = await deleteAnnouncementData(id)
    return NextResponse.json({ success: true, message: "Announcement deleted", data })
  } catch (error) {
    console.error("Failed to delete announcement:", error)
    return NextResponse.json({ success: false, message: "Failed to delete announcement", data: null }, { status: 500 })
  }
}

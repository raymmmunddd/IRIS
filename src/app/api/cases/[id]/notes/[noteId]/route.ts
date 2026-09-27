import { NextResponse } from "next/server"
import { updateCaseNoteData } from "@/lib/iris-data"

type Params = { params: Promise<{ id: string; noteId: string }> }

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id, noteId } = await params
    const body = await request.json()
    const content = typeof body?.content === "string" ? body.content.trim() : ""
    if (!content || content.length > 2000) {
      return NextResponse.json({ success: false, message: "A note of 1 to 2,000 characters is required", data: null }, { status: 400 })
    }
    const data = await updateCaseNoteData(id, noteId, content)
    if (!data) return NextResponse.json({ success: false, message: "Case note not found", data: null }, { status: 404 })
    return NextResponse.json({ success: true, message: "Note updated", data })
  } catch (error) {
    console.error("Failed to update case note:", error)
    return NextResponse.json({ success: false, message: "Failed to update case note", data: null }, { status: 500 })
  }
}

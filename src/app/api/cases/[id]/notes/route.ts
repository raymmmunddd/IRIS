import { NextResponse } from "next/server"
import { createCaseNoteData, getCaseNotesData } from "@/lib/iris-data"

type Params = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const data = await getCaseNotesData(id)
    if (!data) return NextResponse.json({ success: false, message: "Case not found", data: [] }, { status: 404 })
    return NextResponse.json({ success: true, message: "Case notes loaded", data })
  } catch (error) {
    console.error("Failed to load case notes:", error)
    return NextResponse.json({ success: false, message: "Failed to load case notes", data: [] }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()
    const note = typeof body.note === "string" ? body.note.trim() : ""

    if (!note || note.length > 2000) {
      return NextResponse.json({ success: false, message: "A note of 1 to 2,000 characters is required", data: null }, { status: 400 })
    }

    const data = await createCaseNoteData(id, note)
    if (!data) {
      return NextResponse.json({ success: false, message: "Case or admin author not found", data: null }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Note saved", data }, { status: 201 })
  } catch (error) {
    console.error("Failed to save case note:", error)
    return NextResponse.json({ success: false, message: "Failed to save case note", data: null }, { status: 500 })
  }
}

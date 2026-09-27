import { NextResponse } from "next/server"
import { archiveCase, CaseProcessValidationError, unarchiveCase } from "@/lib/case-process"
import { getCaseData } from "@/lib/iris-data"

type Params = { params: Promise<{ id: string }> }

export async function POST(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const updated = await archiveCase(id)
    if (!updated) return NextResponse.json({ success: false, message: "Case not found.", data: null }, { status: 404 })
    return NextResponse.json({ success: true, message: "Case archived.", data: await getCaseData(id) })
  } catch (error) {
    if (error instanceof CaseProcessValidationError) {
      return NextResponse.json({ success: false, message: error.message, data: null }, { status: 400 })
    }
    console.error("Failed to archive case:", error)
    return NextResponse.json({ success: false, message: "Failed to archive case.", data: null }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const updated = await unarchiveCase(id)
    if (!updated) return NextResponse.json({ success: false, message: "Case not found.", data: null }, { status: 404 })
    return NextResponse.json({ success: true, message: "Case restored.", data: await getCaseData(id) })
  } catch (error) {
    console.error("Failed to restore case:", error)
    return NextResponse.json({ success: false, message: "Failed to restore case.", data: null }, { status: 500 })
  }
}

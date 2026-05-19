import { NextResponse } from "next/server"
import { deleteCaseData, getCaseData, updateCaseData } from "@/lib/iris-data"

type Params = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const data = await getCaseData(id)

    if (!data) {
      return NextResponse.json({ success: false, message: "Case not found", data: null }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Case loaded", data })
  } catch (error) {
    console.error("Failed to load case:", error)
    return NextResponse.json({ success: false, message: "Failed to load case", data: null }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = await updateCaseData(id, {
      status: body.status,
      assignedOfficer: body.assignedOfficer,
      action: body.action,
    })

    if (!data) {
      return NextResponse.json({ success: false, message: "Case not found", data: null }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Case updated", data })
  } catch (error) {
    console.error("Failed to update case:", error)
    return NextResponse.json({ success: false, message: "Failed to update case", data: null }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const data = await deleteCaseData(id)

    if (!data) {
      return NextResponse.json({ success: false, message: "Case not found", data: null }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Case deleted", data })
  } catch (error) {
    console.error("Failed to delete case:", error)
    return NextResponse.json({ success: false, message: "Failed to delete case", data: null }, { status: 500 })
  }
}

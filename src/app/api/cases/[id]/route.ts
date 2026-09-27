import { NextResponse } from "next/server"
import { getCaseData, updateCaseData } from "@/lib/iris-data"
import type { CaseStatus } from "@/lib/types"

const editableStatuses: CaseStatus[] = ["Mediation"]

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
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ success: false, message: "A case update object is required", data: null }, { status: 400 })
    }
    if (body.status !== undefined && (typeof body.status !== "string" || !editableStatuses.includes(body.status as CaseStatus))) {
      return NextResponse.json({ success: false, message: "Case status is invalid", data: null }, { status: 400 })
    }
    if (body.assignedOfficer !== undefined && typeof body.assignedOfficer !== "string") {
      return NextResponse.json({ success: false, message: "Assigned officer is invalid", data: null }, { status: 400 })
    }
    if (body.scheduledAt !== undefined && typeof body.scheduledAt !== "string") {
      return NextResponse.json({ success: false, message: "Scheduled date and time are invalid", data: null }, { status: 400 })
    }
    const data = await updateCaseData(id, {
      status: body.status,
      assignedOfficer: body.assignedOfficer,
      scheduledAt: body.scheduledAt,
    })

    if (!data) {
      return NextResponse.json({ success: false, message: "Case not found", data: null }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Case updated", data })
  } catch (error) {
    if (error instanceof Error && /Use the case workflow|Schedule a mediation hearing|mediation hearing can only start|Scheduled date and time are invalid/i.test(error.message)) {
      return NextResponse.json({ success: false, message: error.message, data: null }, { status: 400 })
    }
    console.error("Failed to update case:", error)
    return NextResponse.json({ success: false, message: "Failed to update case", data: null }, { status: 500 })
  }
}

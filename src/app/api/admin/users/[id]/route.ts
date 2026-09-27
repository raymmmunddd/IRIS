import { NextResponse } from "next/server"
import { updateUserStatusData } from "@/lib/iris-data"

type Params = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()
    if (!["Verified", "Suspended", "Pending"].includes(body.status)) {
      return NextResponse.json({ success: false, message: "Invalid user status", data: null }, { status: 400 })
    }
    const remarks = typeof body.remarks === "string" ? body.remarks.trim() : ""
    if (body.status === "Suspended" && !remarks) {
      return NextResponse.json({ success: false, message: "Remarks are required when suspending a user", data: null }, { status: 400 })
    }
    const data = await updateUserStatusData(id, body.status, remarks)
    if (!data) {
      return NextResponse.json({ success: false, message: "User not found", data: null }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: "User status updated", data })
  } catch (error) {
    console.error("Failed to update user status:", error)
    return NextResponse.json({ success: false, message: "Failed to update user status", data: null }, { status: 500 })
  }
}

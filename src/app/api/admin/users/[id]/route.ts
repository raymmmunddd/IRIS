import { NextResponse } from "next/server"
import { updateUserStatusData } from "@/lib/iris-data"

type Params = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = await updateUserStatusData(id, body.status)
    return NextResponse.json({ success: true, message: "User status updated", data })
  } catch (error) {
    console.error("Failed to update user status:", error)
    return NextResponse.json({ success: false, message: "Failed to update user status", data: null }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { markNotificationReadData } from "@/lib/iris-data"

type Params = {
  params: Promise<{ id: string }>
}

export async function PATCH(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const data = await markNotificationReadData(id)
    return NextResponse.json({ success: true, message: "Notification marked read", data })
  } catch (error) {
    console.error("Failed to mark notification read:", error)
    return NextResponse.json({ success: false, message: "Failed to mark notification read", data: null }, { status: 500 })
  }
}

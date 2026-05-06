import { NextResponse } from "next/server"
import { getNotificationsData, markAllNotificationsReadData } from "@/lib/iris-data"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit")
    const data = await getNotificationsData(limit ? Number(limit) : undefined)
    return NextResponse.json({ success: true, message: "Notifications loaded", data })
  } catch (error) {
    console.error("Failed to load notifications:", error)
    return NextResponse.json({ success: false, message: "Failed to load notifications", data: [] }, { status: 500 })
  }
}

export async function PATCH() {
  try {
    const data = await markAllNotificationsReadData()
    return NextResponse.json({ success: true, message: "Notifications marked read", data })
  } catch (error) {
    console.error("Failed to mark notifications read:", error)
    return NextResponse.json({ success: false, message: "Failed to mark notifications read", data: null }, { status: 500 })
  }
}

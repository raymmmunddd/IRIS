import { NextResponse } from "next/server"
import { getResidentAnnouncementsData } from "@/lib/resident-data"

export async function GET() {
  try {
    const data = await getResidentAnnouncementsData()
    return NextResponse.json({ success: true, message: "Resident announcements loaded", data })
  } catch (error) {
    console.error("Failed to load resident announcements:", error)
    return NextResponse.json({ success: false, message: "Failed to load resident announcements", data: [] }, { status: 500 })
  }
}

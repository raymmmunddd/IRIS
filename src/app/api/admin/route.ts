import { NextResponse } from "next/server"
import { getAdminData } from "@/lib/iris-data"

export async function GET() {
  try {
    const data = await getAdminData()
    return NextResponse.json({ success: true, message: "Admin data loaded", data })
  } catch (error) {
    console.error("Failed to load admin data:", error)
    return NextResponse.json({ success: false, message: "Failed to load admin data", data: null }, { status: 500 })
  }
}

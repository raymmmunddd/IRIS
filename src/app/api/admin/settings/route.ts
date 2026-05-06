import { NextResponse } from "next/server"
import {
  getAdminSettingsData,
  saveAdminAiConfigData,
  saveAdminCategoriesData,
  saveAdminPermissionsData,
} from "@/lib/admin-settings-data"

export async function GET() {
  try {
    const data = await getAdminSettingsData()
    return NextResponse.json({ success: true, message: "Admin settings loaded", data })
  } catch (error) {
    console.error("Failed to load admin settings:", error)
    return NextResponse.json({ success: false, message: "Failed to load admin settings", data: null }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    if (body.section === "aiConfig") {
      const data = await saveAdminAiConfigData(body.value)
      return NextResponse.json({ success: true, message: "AI settings saved", data })
    }

    if (body.section === "categories") {
      const data = await saveAdminCategoriesData(body.value)
      return NextResponse.json({ success: true, message: "Categories saved", data })
    }

    if (body.section === "permissions") {
      const data = await saveAdminPermissionsData(body.value)
      return NextResponse.json({ success: true, message: "Permissions saved", data })
    }

    return NextResponse.json({ success: false, message: "Invalid settings section", data: null }, { status: 400 })
  } catch (error) {
    console.error("Failed to save admin settings:", error)
    return NextResponse.json({ success: false, message: "Failed to save admin settings", data: null }, { status: 500 })
  }
}

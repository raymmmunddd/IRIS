import { NextResponse } from "next/server"
import { getAdminData } from "@/lib/iris-data"

function readNumber(value: string | null) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const data = await getAdminData({
      usersPage: readNumber(url.searchParams.get("usersPage")),
      usersLimit: readNumber(url.searchParams.get("usersLimit")),
      announcementsPage: readNumber(url.searchParams.get("announcementsPage")),
      announcementsLimit: readNumber(url.searchParams.get("announcementsLimit")),
      auditLogsPage: readNumber(url.searchParams.get("auditLogsPage")),
      auditLogsLimit: readNumber(url.searchParams.get("auditLogsLimit")),
    })
    return NextResponse.json({ success: true, message: "Admin data loaded", data })
  } catch (error) {
    console.error("Failed to load admin data:", error)
    return NextResponse.json({ success: false, message: "Failed to load admin data", data: null }, { status: 500 })
  }
}

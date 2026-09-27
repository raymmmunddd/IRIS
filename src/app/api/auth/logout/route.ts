import { NextResponse } from "next/server"
import { clearAdminSessionCookie } from "@/lib/admin-session"

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Signed out.", data: null })
  clearAdminSessionCookie(response)
  return response
}

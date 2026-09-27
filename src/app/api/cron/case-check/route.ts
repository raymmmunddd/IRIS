import { timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import { checkOverdueCases } from "@/lib/case-process"
import { isBusinessDay, todayInManila } from "@/lib/business-days"

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ success: false, message: "Case check cron is not configured.", data: null }, { status: 503 })
  }

  const authorization = request.headers.get("authorization") ?? ""
  const expected = Buffer.from(`Bearer ${secret}`)
  const received = Buffer.from(authorization)
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return NextResponse.json({ success: false, message: "Unauthorized.", data: null }, { status: 401 })
  }

  try {
    const today = todayInManila()
    if (!isBusinessDay(today)) {
      return NextResponse.json({ success: true, message: "Weekend check skipped.", data: { followUpCases: [] } })
    }
    const followUpCases = await checkOverdueCases()
    return NextResponse.json({ success: true, message: "Case deadlines checked.", data: { followUpCases } })
  } catch (error) {
    console.error("Failed to check case deadlines:", error)
    return NextResponse.json({ success: false, message: "Failed to check case deadlines.", data: null }, { status: 500 })
  }
}

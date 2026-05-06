import { NextResponse } from "next/server"
import { requestCaseInfoData } from "@/lib/iris-data"

type Params = {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()
    const message = typeof body.message === "string" ? body.message.trim() : ""

    if (!message) {
      return NextResponse.json({ success: false, message: "Message is required", data: null }, { status: 400 })
    }

    const data = await requestCaseInfoData(id, message)
    if (!data) {
      return NextResponse.json({ success: false, message: "Case not found", data: null }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Information request sent", data }, { status: 201 })
  } catch (error) {
    console.error("Failed to request case information:", error)
    return NextResponse.json({ success: false, message: "Failed to request information", data: null }, { status: 500 })
  }
}

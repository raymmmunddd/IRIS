import { NextResponse } from "next/server"
import { createOfficerData } from "@/lib/iris-data"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = await createOfficerData({
      fullName: body.fullName,
      email: body.email,
    })
    return NextResponse.json({ success: true, message: "Officer created", data }, { status: 201 })
  } catch (error) {
    console.error("Failed to create officer:", error)
    return NextResponse.json({ success: false, message: "Failed to create officer", data: null }, { status: 500 })
  }
}

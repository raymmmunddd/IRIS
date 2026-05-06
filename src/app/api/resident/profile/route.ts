import { NextResponse } from "next/server"
import { getResidentProfileData, updateResidentProfileData } from "@/lib/resident-data"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ success: false, message: "Resident email is required", data: null }, { status: 400 })
    }

    const data = await getResidentProfileData(email)
    return NextResponse.json({ success: true, message: "Resident profile loaded", data })
  } catch (error) {
    console.error("Failed to load resident profile:", error)
    return NextResponse.json({ success: false, message: "Failed to load resident profile", data: null }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()

    if (!body.email) {
      return NextResponse.json({ success: false, message: "Resident email is required", data: null }, { status: 400 })
    }

    const data = await updateResidentProfileData(body.email, {
      fullName: body.fullName,
      phone: body.phone,
      street: body.street,
    })

    if (!data) {
      return NextResponse.json({ success: false, message: "Resident profile not found", data: null }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Resident profile saved", data })
  } catch (error) {
    console.error("Failed to save resident profile:", error)
    return NextResponse.json({ success: false, message: "Failed to save resident profile", data: null }, { status: 500 })
  }
}

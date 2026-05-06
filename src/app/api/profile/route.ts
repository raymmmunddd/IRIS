import { NextResponse } from "next/server"
import { getAdminProfileData, updateAdminProfileData } from "@/lib/admin-account-data"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required", data: null }, { status: 400 })
    }

    const data = await getAdminProfileData(email)
    if (!data) {
      return NextResponse.json({ success: false, message: "Profile not found", data: null }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Profile loaded", data })
  } catch (error) {
    console.error("Failed to load profile:", error)
    return NextResponse.json({ success: false, message: "Failed to load profile", data: null }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    if (!body.email) {
      return NextResponse.json({ success: false, message: "Email is required", data: null }, { status: 400 })
    }

    const data = await updateAdminProfileData(body.email, {
      fullName: body.fullName,
      phone: body.phone,
      address: body.address,
      bio: body.bio,
      photoUrl: body.photoUrl,
      email: body.nextEmail,
    })

    if (!data) {
      return NextResponse.json({ success: false, message: "Profile not found", data: null }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Profile updated", data })
  } catch (error) {
    console.error("Failed to update profile:", error)
    return NextResponse.json({ success: false, message: "Failed to update profile", data: null }, { status: 500 })
  }
}

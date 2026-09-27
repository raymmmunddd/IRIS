import { NextRequest, NextResponse } from "next/server"
import { UserRole, UserStatus } from "@/generated/prisma/client"
import { getAdminSessionUserId } from "@/lib/admin-session"
import { prisma } from "@/lib/prisma"

type Params = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const administratorId = getAdminSessionUserId(request)
    if (!administratorId) return NextResponse.json({ success: false, message: "An administrator session is required.", data: null }, { status: 401, headers: { "Cache-Control": "no-store" } })

    const administrator = await prisma.user.findFirst({
      where: {
        id: administratorId,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        isArchived: false,
      },
      select: { id: true },
    })
    if (!administrator) {
      return NextResponse.json({ success: false, message: "An active administrator account is required.", data: null }, { status: 403, headers: { "Cache-Control": "no-store" } })
    }

    const identity = await prisma.residentIdentity.findUnique({
      where: { userId: id },
      select: { governmentIdImage: true, governmentIdMimeType: true },
    })
    if (!identity) {
      return NextResponse.json({ success: false, message: "Government ID image not found.", data: null }, { status: 404, headers: { "Cache-Control": "no-store" } })
    }

    return NextResponse.json({
      success: true,
      message: "Government ID loaded.",
      data: {
        imageBase64: Buffer.from(identity.governmentIdImage).toString("base64"),
        mimeType: identity.governmentIdMimeType,
      },
    }, { headers: { "Cache-Control": "no-store, private" } })
  } catch (error) {
    console.error("Failed to load government ID:", error)
    return NextResponse.json({ success: false, message: "Failed to load government ID.", data: null }, { status: 500, headers: { "Cache-Control": "no-store" } })
  }
}

import { NextResponse } from "next/server"
import { UserRole } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const email = new URL(request.url).searchParams.get("email")?.trim().toLowerCase()
    if (!email) {
      return NextResponse.json({ success: false, message: "Account email is required", data: null }, { status: 400 })
    }

    const viewer = await prisma.user.findFirst({
      where: { email, isArchived: false },
      select: { id: true, role: true },
    })
    if (!viewer) {
      return NextResponse.json({ success: false, message: "Account was not found", data: null }, { status: 404 })
    }

    const evidence = await prisma.evidence.findUnique({
      where: { id },
      select: {
        fileData: true,
        fileType: true,
        fileName: true,
        case: { select: { complainantId: true } },
      },
    })
    if (!evidence?.fileData || (viewer.role === UserRole.RESIDENT && evidence.case.complainantId !== viewer.id)) {
      return NextResponse.json({ success: false, message: "Evidence was not found", data: null }, { status: 404 })
    }

    const fileName = (evidence.fileName || "evidence-image").replace(/[\r\n"\\]/g, "_")
    return new Response(evidence.fileData, {
      headers: {
        "Content-Type": evidence.fileType,
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    })
  } catch (error) {
    console.error("Failed to load case evidence:", error)
    return NextResponse.json({ success: false, message: "Failed to load evidence", data: null }, { status: 500 })
  }
}

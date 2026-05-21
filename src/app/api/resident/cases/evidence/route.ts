import { NextResponse } from "next/server"
import { attachResidentCaseEvidenceData } from "@/lib/case-chat-data"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ success: false, message: "Evidence file is required", data: null }, { status: 400 })
    }

    const data = await attachResidentCaseEvidenceData({
      caseId: String(formData.get("caseId") ?? ""),
      email: String(formData.get("email") ?? ""),
      file,
      requireAssigned: false,
      addChatMessage: false,
    })

    if (!data) {
      return NextResponse.json({ success: false, message: "Unable to attach evidence to this case", data: null }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Evidence attached", data }, { status: 201 })
  } catch (error) {
    console.error("Failed to attach resident case evidence:", error)
    return NextResponse.json({ success: false, message: "Failed to attach evidence", data: null }, { status: 500 })
  }
}

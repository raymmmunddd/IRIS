import { NextResponse } from "next/server"
import { getCasesData } from "@/lib/iris-data"

function readNumber(value: string | null) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const data = await getCasesData({
      page: readNumber(searchParams.get("page")),
      limit: readNumber(searchParams.get("limit")),
      tab: searchParams.get("tab") as "pending" | "active" | "archive" | undefined,
      status: searchParams.get("status") as never,
      category: searchParams.get("category") as never,
      priority: searchParams.get("priority") as never,
      search: searchParams.get("search") ?? "",
      sort: searchParams.get("sort") as "Newest" | "Oldest" | "Priority" | undefined,
    })
    return NextResponse.json({ success: true, message: "Cases loaded", data })
  } catch (error) {
    console.error("Failed to load cases:", error)
    return NextResponse.json({ success: false, message: "Failed to load cases", data: [] }, { status: 500 })
  }
}

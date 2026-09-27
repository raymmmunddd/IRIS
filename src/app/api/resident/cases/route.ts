import { NextResponse } from "next/server"
import { createResidentCaseData, getResidentCasesData } from "@/lib/resident-data"
import { CaseProcessValidationError } from "@/lib/case-process"
import type { CaseCategory } from "@/lib/types"

const MAX_EVIDENCE_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])
const CASE_CATEGORIES: CaseCategory[] = [
  "Violence or Threats", "Harassment & Abuse", "Fraud & Scams", "Public Disturbance",
  "Property & Theft", "Community Dispute", "Child & Vulnerable Protection",
]

class InvalidReportInput extends Error {}

function imageSignatureMatches(fileType: string, bytes: Uint8Array) {
  const startsWith = (...signature: number[]) => signature.every((byte, index) => bytes[index] === byte)
  if (fileType === "image/jpeg") return startsWith(0xff, 0xd8, 0xff)
  if (fileType === "image/png") return startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)
  if (fileType === "image/gif") return new TextDecoder().decode(bytes.slice(0, 6)).match(/^GIF8[79]a$/) !== null
  if (fileType === "image/webp") {
    return new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF"
      && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP"
  }
  return false
}

async function validateEvidenceFiles(formData: FormData) {
  const evidenceFiles = []
  for (const value of formData.getAll("evidence")) {
    if (typeof value === "string") throw new InvalidReportInput("Evidence uploads must be image files.")
    if (!ALLOWED_IMAGE_TYPES.has(value.type)) {
      throw new InvalidReportInput("Only JPG, JPEG, PNG, WEBP, or GIF images can be uploaded.")
    }
    if (value.size === 0 || value.size > MAX_EVIDENCE_FILE_SIZE) {
      throw new InvalidReportInput("Each evidence image must be greater than 0 bytes and no larger than 5 MB.")
    }

    const fileData = new Uint8Array(await value.arrayBuffer()) as Uint8Array<ArrayBuffer>
    if (!imageSignatureMatches(value.type, fileData)) {
      throw new InvalidReportInput(`${value.name || "This file"} does not match its declared image type.`)
    }
    const fileName = (value.name || "evidence-image")
      .replace(/[\u0000-\u001f\u007f/\\]/g, "_")
      .slice(0, 255)
    evidenceFiles.push({ fileName, fileType: value.type, fileData })
  }
  return evidenceFiles
}

function requiredField(formData: FormData, key: string) {
  const value = formData.get(key)
  if (typeof value !== "string") return ""
  return value.trim()
}

function requiredBodyField(body: Record<string, unknown>, key: string, maximumLength?: number) {
  const value = body[key]
  if (typeof value !== "string" || !value.trim()) throw new InvalidReportInput(`${key} is required.`)
  if (maximumLength != null && value.trim().length > maximumLength) {
    throw new InvalidReportInput(`${key} must be ${maximumLength} characters or fewer.`)
  }
  return value.trim()
}

function optionalBodyNumber(body: Record<string, unknown>, key: string) {
  const value = body[key]
  if (value == null || value === "") return null
  if (typeof value !== "number" || !Number.isFinite(value)) throw new InvalidReportInput(`${key} must be a number.`)
  return value
}

function optionalNumber(formData: FormData, key: string) {
  const value = formData.get(key)
  if (value == null || value === "") return null
  if (typeof value !== "string") throw new InvalidReportInput(`${key} must be a number.`)
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) throw new InvalidReportInput(`${key} must be a number.`)
  return parsed
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ success: false, message: "Resident email is required", data: [] }, { status: 400 })
    }

    const data = await getResidentCasesData(email)
    return NextResponse.json({ success: true, message: "Resident cases loaded", data })
  } catch (error) {
    console.error("Failed to load resident cases:", error)
    return NextResponse.json({ success: false, message: "Failed to load resident cases", data: [] }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const isMultipart = request.headers.get("content-type")?.includes("multipart/form-data")
    let body: Record<string, unknown>
    let evidenceFiles: Awaited<ReturnType<typeof validateEvidenceFiles>> = []

    if (isMultipart) {
      const formData = await request.formData()
      evidenceFiles = await validateEvidenceFiles(formData)
      body = {
        fullName: requiredField(formData, "fullName"),
        respondentName: requiredField(formData, "respondentName"),
        respondentAddress: requiredField(formData, "respondentAddress"),
        category: requiredField(formData, "category"),
        otherCategory: requiredField(formData, "otherCategory"),
        type: requiredField(formData, "type"),
        incidentDate: requiredField(formData, "incidentDate"),
        contact: requiredField(formData, "contact"),
        email: requiredField(formData, "email"),
        street: requiredField(formData, "street"),
        incidentLocation: requiredField(formData, "incidentLocation"),
        incidentLatitude: optionalNumber(formData, "incidentLatitude"),
        incidentLongitude: optionalNumber(formData, "incidentLongitude"),
        incidentAccuracy: optionalNumber(formData, "incidentAccuracy"),
        details: requiredField(formData, "details"),
      }
    } else {
      const parsed = await request.json()
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new InvalidReportInput("Report details must be sent as an object.")
      }
      body = parsed as Record<string, unknown>
    }

    const categoryChoice = requiredBodyField(body, "category")
    let category = categoryChoice
    if (categoryChoice === "Other") {
      category = requiredBodyField(body, "otherCategory")
      if (category.length > 80) throw new InvalidReportInput("The specified category must be 80 characters or fewer.")
    }
    if (categoryChoice !== "Other" && !CASE_CATEGORIES.includes(categoryChoice as CaseCategory)) {
      throw new InvalidReportInput("Choose a valid case category.")
    }

    const data = await createResidentCaseData({
      fullName: requiredBodyField(body, "fullName"),
      respondentName: requiredBodyField(body, "respondentName"),
      respondentAddress: requiredBodyField(body, "respondentAddress"),
      category,
      type: requiredBodyField(body, "type", 100),
      incidentDate: requiredBodyField(body, "incidentDate"),
      contact: requiredBodyField(body, "contact"),
      email: requiredBodyField(body, "email"),
      street: requiredBodyField(body, "street"),
      incidentLocation: typeof body.incidentLocation === "string" ? body.incidentLocation : undefined,
      incidentLatitude: optionalBodyNumber(body, "incidentLatitude"),
      incidentLongitude: optionalBodyNumber(body, "incidentLongitude"),
      incidentAccuracy: optionalBodyNumber(body, "incidentAccuracy"),
      details: requiredBodyField(body, "details"),
      evidenceFiles,
    })

    return NextResponse.json({ success: true, message: "Resident report filed", data }, { status: 201 })
  } catch (error) {
    if (error instanceof InvalidReportInput || error instanceof CaseProcessValidationError) {
      return NextResponse.json({ success: false, message: error.message, data: null }, { status: 400 })
    }
    if (error instanceof Error && /evidence|incident date|coordinates|missing required|report type/i.test(error.message)) {
      return NextResponse.json({ success: false, message: error.message, data: null }, { status: 400 })
    }
    console.error("Failed to file resident report:", error)
    return NextResponse.json({ success: false, message: "Failed to file resident report", data: null }, { status: 500 })
  }
}

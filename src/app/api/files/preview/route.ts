import { readFile } from "node:fs/promises"
import path from "node:path"
import { inflateRawSync } from "node:zlib"
import { NextResponse } from "next/server"

function safeUploadPath(url: string) {
  const cleanUrl = decodeURIComponent(url.split("?")[0] ?? "")
  if (!cleanUrl.startsWith("/uploads/evidence/")) return null

  const fileName = path.basename(cleanUrl)
  return {
    url: new URL(`../../../../../public/uploads/evidence/${encodeURIComponent(fileName)}`, import.meta.url),
    ext: path.extname(fileName).toLowerCase(),
  }
}

function extractZipFile(buffer: Buffer, targetName: string) {
  const eocdSignature = 0x06054b50
  let eocdOffset = -1

  for (let i = buffer.length - 22; i >= 0; i -= 1) {
    if (buffer.readUInt32LE(i) === eocdSignature) {
      eocdOffset = i
      break
    }
  }

  if (eocdOffset < 0) return null

  const entries = buffer.readUInt16LE(eocdOffset + 10)
  let centralOffset = buffer.readUInt32LE(eocdOffset + 16)

  for (let i = 0; i < entries; i += 1) {
    if (buffer.readUInt32LE(centralOffset) !== 0x02014b50) return null

    const method = buffer.readUInt16LE(centralOffset + 10)
    const compressedSize = buffer.readUInt32LE(centralOffset + 20)
    const fileNameLength = buffer.readUInt16LE(centralOffset + 28)
    const extraLength = buffer.readUInt16LE(centralOffset + 30)
    const commentLength = buffer.readUInt16LE(centralOffset + 32)
    const localOffset = buffer.readUInt32LE(centralOffset + 42)
    const fileName = buffer.toString("utf8", centralOffset + 46, centralOffset + 46 + fileNameLength)

    if (fileName === targetName) {
      const localNameLength = buffer.readUInt16LE(localOffset + 26)
      const localExtraLength = buffer.readUInt16LE(localOffset + 28)
      const dataStart = localOffset + 30 + localNameLength + localExtraLength
      const compressed = buffer.subarray(dataStart, dataStart + compressedSize)
      if (method === 0) return compressed
      if (method === 8) return inflateRawSync(compressed)
      return null
    }

    centralOffset += 46 + fileNameLength + extraLength + commentLength
  }

  return null
}

function docxToText(buffer: Buffer) {
  const xml = extractZipFile(buffer, "word/document.xml")
  if (!xml) return ""

  return xml
    .toString("utf8")
    .replace(/<w:tab\/>/g, "\t")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function legacyDocToText(buffer: Buffer) {
  return buffer
    .toString("latin1")
    .replace(/[^\x20-\x7E\r\n\t]+/g, " ")
    .split(/\s{2,}/)
    .map((part) => part.trim())
    .filter((part) => part.length > 12 && /[A-Za-z]{3}/.test(part))
    .slice(0, 80)
    .join("\n")
    .trim()
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fileUrl = searchParams.get("url") ?? ""
    const filePath = safeUploadPath(fileUrl)

    if (!filePath) {
      return NextResponse.json({ success: false, message: "File is not previewable", data: null }, { status: 400 })
    }

    const buffer = await readFile(filePath.url)
    let text = ""

    if (filePath.ext === ".txt") {
      text = buffer.toString("utf8")
    } else if (filePath.ext === ".docx") {
      text = docxToText(buffer)
    } else if (filePath.ext === ".doc") {
      text = legacyDocToText(buffer)
    } else {
      return NextResponse.json({ success: false, message: "Preview is only available for TXT and Word files", data: null }, { status: 415 })
    }

    return NextResponse.json({
      success: true,
      message: "Preview loaded",
      data: { text: text || "No readable text found in this document." },
    })
  } catch (error) {
    console.error("Failed to preview file:", error)
    return NextResponse.json({ success: false, message: "Failed to preview file", data: null }, { status: 500 })
  }
}

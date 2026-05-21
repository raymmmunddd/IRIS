"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, FileText, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { EvidenceFile } from "@/lib/types"

interface EvidenceViewerProps {
  onClose: () => void
  files?: EvidenceFile[]
  initialIndex?: number
}

export function EvidenceViewer({ onClose, files: providedFiles, initialIndex = 0 }: EvidenceViewerProps) {
  const files = providedFiles ?? []
  const [currentIndex, setCurrentIndex] = useState(Math.min(initialIndex, files.length - 1))
  const [zoom, setZoom] = useState(1)
  const [documentPreview, setDocumentPreview] = useState<{ url: string; text: string } | null>(null)
  const safeIndex = Math.min(Math.max(currentIndex, 0), Math.max(files.length - 1, 0))
  const current = files[safeIndex]
  const filePath = current?.url.split("?")[0] ?? ""
  const canFrameDocument = /\.(pdf)$/i.test(filePath)
  const canExtractText = /\.(txt|doc|docx)$/i.test(filePath)
  const isWordFile = /\.(doc|docx)$/i.test(filePath)

  const goNext = () => {
    if (!files.length) return
    setCurrentIndex((i) => (i + 1) % files.length)
    setZoom(1)
  }

  const goPrev = () => {
    if (!files.length) return
    setCurrentIndex((i) => (i - 1 + files.length) % files.length)
    setZoom(1)
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight" && files.length) {
        setCurrentIndex((i) => (i + 1) % files.length)
        setZoom(1)
      }
      if (e.key === "ArrowLeft" && files.length) {
        setCurrentIndex((i) => (i - 1 + files.length) % files.length)
        setZoom(1)
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose, files.length])

  useEffect(() => {
    if (!current || !canExtractText) return

    let cancelled = false
    fetch(`/api/files/preview?url=${encodeURIComponent(current.url)}`)
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled && result.success) setDocumentPreview({ url: current.url, text: result.data.text })
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [current, canExtractText])

  if (!current) return null

  return (
    <div className="fixed inset-0 z-[60] flex flex-col">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/80 backdrop-blur-sm" onClick={onClose} />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between bg-primary/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3 min-w-0">
          {current.type === "image" ? (
            <ImageIcon className="h-4 w-4 shrink-0 text-primary-foreground/70" />
          ) : (
            <FileText className="h-4 w-4 shrink-0 text-primary-foreground/70" />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-primary-foreground">{current.name}</p>
            <p className="text-xs text-primary-foreground/60">{current.size} &middot; {current.uploadedAt}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="mr-2 rounded-md bg-primary-foreground/10 px-2 py-0.5 text-xs font-medium text-primary-foreground">
            {safeIndex + 1} / {files.length}
          </span>
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            className="rounded-md p-1.5 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-xs font-medium text-primary-foreground/70">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            className="rounded-md p-1.5 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <div className="mx-2 h-5 w-px bg-primary-foreground/20" />
          <a
            href={current.url}
            download={current.name}
            className="rounded-md p-1.5 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
            aria-label="Download file"
          >
            <Download className="h-4 w-4" />
          </a>
          <button
            onClick={onClose}
            className="ml-1 rounded-md p-1.5 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
            aria-label="Close viewer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main viewport */}
      <div className="relative z-10 flex flex-1 items-center justify-center overflow-hidden">
        {/* Prev button */}
        {files.length > 1 && (
          <button
            onClick={goPrev}
            className="absolute left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-card/90 text-card-foreground shadow-lg backdrop-blur-sm transition-all hover:bg-card hover:scale-105"
            aria-label="Previous file"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Image display */}
        <div className="flex items-center justify-center overflow-auto p-8" style={{ maxHeight: "calc(100vh - 140px)", maxWidth: "100vw" }}>
          {current.type === "image" ? (
            <img
              src={current.url}
              alt={current.name}
              className="rounded-lg shadow-2xl transition-transform duration-200"
              style={{ transform: `scale(${zoom})`, maxHeight: "calc(100vh - 180px)", objectFit: "contain" }}
              draggable={false}
            />
          ) : canFrameDocument ? (
            <iframe
              src={current.url}
              title={current.name}
              className="h-[min(72vh,760px)] w-[min(86vw,980px)] rounded-lg bg-card shadow-2xl"
            />
          ) : canExtractText ? (
            <div className="h-[min(72vh,760px)] w-[min(86vw,860px)] overflow-auto rounded-lg bg-card p-6 text-card-foreground shadow-2xl">
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{isWordFile ? "Word document preview" : "Text preview"}</p>
                  <p className="text-xs text-muted-foreground">{current.name}</p>
                </div>
                <a
                  href={current.url}
                  download={current.name}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </a>
              </div>
              {documentPreview?.url !== current.url ? (
                <div className="space-y-2">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
                </div>
              ) : (
                <pre className="whitespace-pre-wrap break-words text-sm leading-6">{documentPreview?.text || "Preview unavailable for this file."}</pre>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-card p-10 shadow-2xl">
              <FileText className="h-16 w-16 text-muted-foreground" />
              <p className="text-sm font-medium text-card-foreground">{current.name}</p>
              <p className="max-w-sm text-center text-xs text-muted-foreground">
                {isWordFile ? "Preview is unavailable for this file. Download it to open in Word." : current.size}
              </p>
              <a
                href={current.url}
                download={current.name}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Download File
              </a>
            </div>
          )}
        </div>

        {/* Next button */}
        {files.length > 1 && (
          <button
            onClick={goNext}
            className="absolute right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-card/90 text-card-foreground shadow-lg backdrop-blur-sm transition-all hover:bg-card hover:scale-105"
            aria-label="Next file"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      {files.length > 1 && (
        <div className="relative z-10 flex items-center justify-center gap-2 bg-primary/95 px-4 py-3 backdrop-blur-sm">
          {files.map((file, index) => (
            <button
              key={file.id + "-" + index}
              onClick={() => { setCurrentIndex(index); setZoom(1) }}
              className={cn(
                "relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                index === safeIndex
                  ? "border-accent ring-2 ring-accent/30 scale-110"
                  : "border-primary-foreground/20 opacity-60 hover:opacity-100 hover:border-primary-foreground/40"
              )}
            >
              {file.type === "image" ? (
                <img
                  src={file.thumbnail}
                  alt={file.name}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

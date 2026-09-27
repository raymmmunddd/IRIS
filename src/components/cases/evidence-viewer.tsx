"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  FileText,
  Image as ImageIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { EvidenceFile } from "@/lib/types"
import { getAuthUser } from "@/lib/auth"
import { ExternalLink } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface EvidenceViewerProps {
  onClose: () => void
  files?: EvidenceFile[]
  initialIndex?: number
}

const mockEvidenceFiles: EvidenceFile[] = [
  {
    id: "1",
    name: "Scene-Photo-01.jpg",
    type: "image" as const,
    size: "2.4 MB",
    uploadedAt: "2024-02-15 10:30 AM",
    url: "https://images.unsplash.com/photo-1579274455863-834f5619b7d2?w=1200&h=800&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1579274455863-834f5619b7d2?w=100&h=100&fit=crop",
  },
  {
    id: "2",
    name: "Witness-Statement.pdf",
    type: "document" as const,
    size: "450 KB",
    uploadedAt: "2024-02-15 11:00 AM",
    url: "#",
    thumbnail: "",
  },
  {
    id: "3",
    name: "Scene-Photo-02.jpg",
    type: "image" as const,
    size: "3.1 MB",
    uploadedAt: "2024-02-15 11:15 AM",
    url: "https://images.unsplash.com/photo-1516534775068-bb4d910b3d82?w=1200&h=800&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1516534775068-bb4d910b3d82?w=100&h=100&fit=crop",
  },
  {
    id: "4",
    name: "Incident-Report.pdf",
    type: "document" as const,
    size: "680 KB",
    uploadedAt: "2024-02-15 02:30 PM",
    url: "#",
    thumbnail: "",
  },
  {
    id: "5",
    name: "Scene-Photo-03.jpg",
    type: "image" as const,
    size: "2.8 MB",
    uploadedAt: "2024-02-16 09:00 AM",
    url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=800&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=100&h=100&fit=crop",
  },
]

export function EvidenceViewer({ onClose, files: providedFiles, initialIndex = 0 }: EvidenceViewerProps) {
  const files = providedFiles?.length ? providedFiles : mockEvidenceFiles

  const safeInitialIndex =
    files.length > 0
      ? Math.min(initialIndex, files.length - 1)
      : 0

  const [currentIndex, setCurrentIndex] = useState(safeInitialIndex)
  const [zoom, setZoom] = useState(1)
  const [isClosing, setIsClosing] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const closeViewer = useCallback(() => {
    if (closeTimer.current) return
    setIsClosing(true)
    closeTimer.current = setTimeout(onClose, 180)
  }, [onClose])

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  const current = files[currentIndex] ?? files[0]

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (files.length ? (i + 1) % files.length : 0))
    setZoom(1)
  }, [files.length])

  const goPrev = useCallback(() => {
    setCurrentIndex((i) =>
      files.length ? (i - 1 + files.length) % files.length : 0
    )
    setZoom(1)
  }, [files.length])

  const getExternalUrl = (file: {
    url?: string
    fileUrl?: string
  }) => {
    const url = file.url ?? file.fileUrl ?? "#"
    if (!url.startsWith("/api/evidence/")) return url
    const email = getAuthUser()?.email
    return email ? `${url}?email=${encodeURIComponent(email)}` : "#"
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey) return

    e.preventDefault()

    setZoom((prev) => {
      const next = prev + (e.deltaY < 0 ? 0.1 : -0.1)
      return Math.min(3, Math.max(0.25, next))
    })
  }

  const extension = current.name.split(".").pop()?.toLowerCase()

  const isPDF = extension === "pdf"

  const isWord =
      extension === "doc" ||
      extension === "docx"

  const isExcel =
      extension === "xls" ||
      extension === "xlsx"

  const isPowerpoint =
      extension === "ppt" ||
      extension === "pptx"

  const [paperSize, setPaperSize] = useState<"A4" | "Legal">("A4")

  const zoomLevels = [
    25,
    50,
    75,
    100,
    125,
    150,
    175,
    200,
    300,
  ]

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeViewer()
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [closeViewer, goNext, goPrev])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Evidence viewer: ${current.name}`}
      className={`fixed inset-0 z-[60] motion-reduce:animate-none ${isClosing ? "animate-out fade-out duration-200" : "animate-in fade-in duration-200"}`}
    >
      {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/70"
          onClick={closeViewer}
        />
        <div
          className={`relative z-20 flex h-full flex-col motion-reduce:animate-none ${isClosing ? "animate-out slide-out-to-bottom-2 duration-200" : "animate-in slide-in-from-bottom-2 duration-200"}`}
          onClick={(e) => e.stopPropagation()}
        >

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
            {currentIndex + 1} / {files.length}
          </span>
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            className="rounded-md p-1.5 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <Select
            value={`${Math.round(zoom * 100)}`}
            onValueChange={(value) => {
              setZoom(Number(value) / 100)
            }}
          >
            <SelectTrigger className="w-24 h-8 border-0 bg-primary-foreground/10 text-primary-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {zoomLevels.map(level => (
                    <SelectItem
                        key={level}
                        value={String(level)}
                    >
                        {level}%
                    </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            className="rounded-md p-1.5 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <div className="mx-2 h-5 w-px bg-primary-foreground/20" />
            <a
              href={getExternalUrl(current)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md p-1.5 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
              aria-label="Open externally"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          <button
            onClick={closeViewer}
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
        <div
          onWheel={handleWheel}
          className="
            flex
            flex-1
            items-center
            justify-center
            overflow-auto
            p-8
            select-none
          "
        >
        {current.type === "image" ? (
          <img
            src={current.url}
            alt={current.name}
            draggable={false}
            decoding="async"
            className="max-w-none transition-transform duration-150"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center center",
            }}
          />
        ) : isPDF ? (
          <div className="w-full h-full rounded-xl overflow-hidden bg-white">
            <iframe
              src={getExternalUrl(current)}
              title={current.name}
              className="w-full h-full border-0"
            />
          </div>
        ) : isWord || isExcel || isPowerpoint ? (
          <div className="w-full h-full rounded-xl overflow-hidden bg-white">
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                getExternalUrl(current)
              )}`}
              title={current.name}
              className="w-full h-full border-0"
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-300 overflow-auto p-10">

            <div
              className="bg-white shadow-2xl"
              style={{
                width: "794px",
                minHeight: "1123px",
                transform: `scale(${zoom})`,
                transformOrigin: "top center",
              }}
            >

              {/* Render PDF */}

              {isPDF ? (
                <iframe
                  src={getExternalUrl(current)}
                  className="w-full h-[1123px]"
                />
              ) : (

                <div className="p-10 space-y-6">

                  <h1 className="text-3xl font-bold">
                    {current.name}
                  </h1>

                  <p className="text-muted-foreground">
                    Document Preview
                  </p>

                  <hr />

                  <p>
                    This represents an A4 page preview.
                  </p>

                  <p>
                    DOCX, XLSX and PPTX cannot be rendered directly by the browser.
                  </p>

                  <p>
                    During development this placeholder simulates an actual document page.
                  </p>

                </div>

              )}

            </div>

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
                index === currentIndex
                  ? "border-accent ring-2 ring-accent/30 scale-110"
                  : "border-primary-foreground/20 opacity-60 hover:opacity-100 hover:border-primary-foreground/40"
              )}
            >
              {file.type === "image" ? (
                <img
                  src={file.thumbnail}
                  alt={file.name}
                  loading="lazy"
                  decoding="async"
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
  </div>
  )
}

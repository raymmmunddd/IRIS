"use client"

import { useState, useCallback, useEffect } from "react"
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, FileText, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EvidenceViewerProps {
  onClose: () => void
}

const mockEvidenceFiles = [
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

export function EvidenceViewer({ onClose }: EvidenceViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const files = mockEvidenceFiles
  const current = files[currentIndex]

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % files.length)
    setZoom(1)
  }, [files.length])

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + files.length) % files.length)
    setZoom(1)
  }, [files.length])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose, goNext, goPrev])

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
            {currentIndex + 1} / {files.length}
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
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-card p-10 shadow-2xl">
              <FileText className="h-16 w-16 text-muted-foreground" />
              <p className="text-sm font-medium text-card-foreground">{current.name}</p>
              <p className="text-xs text-muted-foreground">{current.size}</p>
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
                index === currentIndex
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

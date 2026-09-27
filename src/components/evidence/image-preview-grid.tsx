"use client"

import Image from "next/image"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type ImagePreviewItem = {
  id: string
  name: string
  src: string
  details?: string
  fit?: "cover" | "contain"
}

type ImagePreviewCardProps = {
  item: ImagePreviewItem
  onPreview?: () => void
  onRemove?: () => void
  disabled?: boolean
}

export function ImagePreviewCard({ item, onPreview, onRemove, disabled = false }: ImagePreviewCardProps) {
  const image = (
    <Image
      src={item.src}
      alt={`Preview of ${item.name}`}
      fill
      unoptimized
      sizes="(max-width: 768px) 100vw, 33vw"
      className={cn(item.fit === "contain" ? "object-contain p-2" : "object-cover")}
    />
  )

  return (
    <li className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="relative aspect-[4/3] bg-muted">
        {onPreview ? (
          <button type="button" onClick={onPreview} aria-label={`Preview ${item.name}`} className="group relative block h-full w-full cursor-zoom-in">
            {image}
            <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white">Preview</span>
          </button>
        ) : image}
        {onRemove && <button type="button" aria-label={`Remove ${item.name}`} disabled={disabled} onClick={onRemove} className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow hover:text-destructive disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>}
      </div>
      <div className="px-3 py-2">
        <span className="block truncate text-sm font-medium">{item.name}</span>
        {item.details && <span className="block truncate text-xs text-muted-foreground">{item.details}</span>}
      </div>
    </li>
  )
}

type ImagePreviewGridProps = {
  items: ImagePreviewItem[]
  onPreview?: (index: number) => void
  onRemove?: (index: number) => void
  disabled?: boolean
  className?: string
}

export function ImagePreviewGrid({ items, onPreview, onRemove, disabled = false, className }: ImagePreviewGridProps) {
  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((item, index) => (
        <ImagePreviewCard
          key={item.id}
          item={item}
          onPreview={onPreview ? () => onPreview(index) : undefined}
          onRemove={onRemove ? () => onRemove(index) : undefined}
          disabled={disabled}
        />
      ))}
    </ul>
  )
}

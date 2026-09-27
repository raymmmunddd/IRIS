"use client"

import { ChevronDown, Download, FileCode2, FileSpreadsheet } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type ExportMenuProps = {
  label?: string
  disabled?: boolean
  className?: string
  onCsv: () => void
  onHtml: () => void
}

export function ExportMenu({
  label = "Export",
  disabled = false,
  className,
  onCsv,
  onHtml,
}: ExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" disabled={disabled} className={cn("gap-2", className)}>
          <Download className="h-4 w-4" />
          {label}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 border border-slate-200 bg-white text-slate-900 shadow-lg">
        <DropdownMenuItem onSelect={onCsv} className="cursor-pointer">
          <FileSpreadsheet className="h-4 w-4" />
          Export CSV
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onHtml} className="cursor-pointer">
          <FileCode2 className="h-4 w-4" />
          Export PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

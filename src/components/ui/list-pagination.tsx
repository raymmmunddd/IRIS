"use client"

import { Button } from "@/components/ui/button"

type ListPaginationProps = {
  page: number
  pageCount: number
  pageSize: number
  totalItems: number
  itemLabel: string
  onPageChange: (page: number) => void
}

export function ListPagination({ page, pageCount, pageSize, totalItems, itemLabel, onPageChange }: ListPaginationProps) {
  if (totalItems === 0) return null

  const safePageCount = Math.max(1, pageCount)
  const visiblePage = Math.min(Math.max(1, page), safePageCount)
  const firstItem = (visiblePage - 1) * pageSize + 1
  const lastItem = Math.min(visiblePage * pageSize, totalItems)

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
      <p className="text-sm text-muted-foreground">Showing {firstItem}–{lastItem} of {totalItems} {itemLabel}</p>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, visiblePage - 1))} disabled={visiblePage <= 1}>Previous</Button>
        <span className="min-w-20 text-center text-sm text-muted-foreground">Page {visiblePage} of {safePageCount}</span>
        <Button type="button" variant="outline" size="sm" onClick={() => onPageChange(Math.min(safePageCount, visiblePage + 1))} disabled={visiblePage >= safePageCount}>Next</Button>
      </div>
    </div>
  )
}

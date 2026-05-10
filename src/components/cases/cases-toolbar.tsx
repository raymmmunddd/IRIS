"use client"

import { SlidersHorizontal, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function CasesToolbar({
  activeTab,
  setActiveTab,
  onApprove,
  onReject,
}: any) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {["active", "archive"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium capitalize",
              activeTab === tab
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-md hover:bg-muted">
          <SlidersHorizontal className="h-4 w-4" />
        </button>

        <button
          onClick={onApprove}
          className="flex items-center gap-1 px-3 py-2 text-sm bg-green-600 text-white rounded-md"
        >
          <Check className="h-4 w-4" /> Approve
        </button>

        <button
          onClick={onReject}
          className="flex items-center gap-1 px-3 py-2 text-sm bg-red-600 text-white rounded-md"
        >
          <X className="h-4 w-4" /> Reject
        </button>
      </div>
    </div>
  )
}
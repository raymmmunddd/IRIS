import { MapPin, TrendingUp, Calendar } from "lucide-react"

interface KeyInsightsProps {
  data?: {
    topStreet: string
    topStreetCount: number
    topCategory: string
    topCategoryCount: number
  }
}

export function KeyInsights({ data }: KeyInsightsProps) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-semibold leading-none tracking-tight">Key Insights</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1 border-l-4 border-blue-500 pl-4 py-1">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Most Active Street
            </span>
            <span className="text-xl font-bold text-blue-600">{data?.topStreet ?? "Rizal Avenue"}</span>
            <span className="text-xs text-muted-foreground">{data?.topStreetCount ?? 156} cases this period</span>
        </div>
        <div className="flex flex-col gap-1 border-l-4 border-green-500 pl-4 py-1">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Top Category
            </span>
            <span className="text-xl font-bold text-green-600">{data?.topCategory ?? "Public Disturbance"}</span>
            <span className="text-xs text-muted-foreground">{data?.topCategoryCount ?? 312} cases reported</span>
        </div>
        <div className="flex flex-col gap-1 border-l-4 border-purple-500 pl-4 py-1">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Peak Period
            </span>
            <span className="text-xl font-bold text-purple-600">Weekends</span>
            <span className="text-xs text-muted-foreground">45% of all cases</span>
        </div>
      </div>
    </div>
  )
}

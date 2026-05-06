"use client"

import { useMemo, useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Bar,
  BarChart,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts"
import { cn } from "@/lib/utils"

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

type MonthlyTrendItem = {
  month: string
  cases: number
  violence?: number
  harassment?: number
  fraud?: number
  disturbance?: number
  property?: number
  community?: number
  child?: number
}

const casesData: MonthlyTrendItem[] = [
  { month: "Jan", cases: 186 },
  { month: "Feb", cases: 215 },
  { month: "Mar", cases: 298 },
  { month: "Apr", cases: 262 },
  { month: "May", cases: 340 },
  { month: "Jun", cases: 312 },
  { month: "Jul", cases: 378 },
  { month: "Aug", cases: 355 },
  { month: "Sep", cases: 410 },
  { month: "Oct", cases: 392 },
  { month: "Nov", cases: 438 },
  { month: "Dec", cases: 467 },
]

const categoryData = [
  { month: "Jan", violence: 32, harassment: 48, fraud: 28, disturbance: 22, property: 34, community: 14, child: 8 },
  { month: "Feb", violence: 38, harassment: 52, fraud: 35, disturbance: 28, property: 38, community: 16, child: 8 },
  { month: "Mar", violence: 55, harassment: 68, fraud: 48, disturbance: 38, property: 52, community: 24, child: 13 },
  { month: "Apr", violence: 42, harassment: 62, fraud: 45, disturbance: 35, property: 48, community: 20, child: 10 },
  { month: "May", violence: 60, harassment: 78, fraud: 55, disturbance: 45, property: 58, community: 28, child: 16 },
  { month: "Jun", violence: 52, harassment: 72, fraud: 50, disturbance: 42, property: 55, community: 26, child: 15 },
  { month: "Jul", violence: 65, harassment: 85, fraud: 58, disturbance: 48, property: 68, community: 32, child: 22 },
  { month: "Aug", violence: 58, harassment: 80, fraud: 56, disturbance: 45, property: 65, community: 30, child: 21 },
  { month: "Sep", violence: 72, harassment: 90, fraud: 62, disturbance: 52, property: 75, community: 35, child: 24 },
  { month: "Oct", violence: 68, harassment: 86, fraud: 60, disturbance: 50, property: 72, community: 34, child: 22 },
  { month: "Nov", violence: 75, harassment: 95, fraud: 68, disturbance: 56, property: 80, community: 38, child: 26 },
  { month: "Dec", violence: 80, harassment: 102, fraud: 72, disturbance: 60, property: 85, community: 40, child: 28 },
]

type FilterMode = "cases" | "category"

const categoryMeta = [
  { key: "violence", name: "Violence or Threats", shortName: "Violence/Threats", color: "#d64545" },
  { key: "harassment", name: "Harassment & Abuse", shortName: "Harassment", color: "#d99e04" },
  { key: "fraud", name: "Fraud & Scams", shortName: "Fraud/Scams", color: "#f2b705" },
  { key: "disturbance", name: "Public Disturbance", shortName: "Public Disturb.", color: "#0ea5e9" },
  { key: "property", name: "Property & Theft", shortName: "Property/Theft", color: "#1e4fa3" },
  { key: "community", name: "Community Dispute", shortName: "Community Disp.", color: "#7c3aed" },
  { key: "child", name: "Child & Vulnerable", shortName: "Child/Vulnerable", color: "#8b5cf6" },
]

interface MonthlyTrendChartProps {
  data?: MonthlyTrendItem[]
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const [filter, setFilter] = useState<FilterMode>("cases")
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()])
  const isMobile = useIsMobile()
  const chartHeight = isMobile ? 200 : 300
  const chartData = data?.length ? data : casesData
  const categoryChartData = data?.length ? data : categoryData

  const selectedCategoryMonth = useMemo(
    () => categoryChartData.find((item) => item.month === selectedMonth) ?? categoryChartData[categoryChartData.length - 1],
    [categoryChartData, selectedMonth]
  )

  const categoryBarData = categoryMeta.map((category) => {
    const amount = selectedCategoryMonth[category.key as keyof typeof selectedCategoryMonth]

    return {
      key: category.key,
      fullName: category.name,
      shortName: category.shortName,
      value: typeof amount === "number" ? amount : 0,
      color: category.color,
    }
  })

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-3 sm:p-5">
      <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="text-sm sm:text-base font-semibold text-card-foreground">Monthly Trend</h3>
        <div className="flex items-center gap-2">
          {(["cases", "category"] as FilterMode[]).map((mode) => {
            const labels = { "cases": "Cases", "category": "Category" } as Record<FilterMode, string>
            return (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={cn(
                  "rounded-lg border px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium transition-colors capitalize",
                  filter === mode
                    ? "border-[var(--chart-main)] bg-[var(--chart-main)] text-white"
                    : "border-border bg-card text-card-foreground hover:bg-muted"
                )}
              >
                {labels[mode]}
              </button>
            )
          })}
        </div>
      </div>

      {filter === "category" && (
        <div className="mb-3 sm:mb-4 flex flex-wrap items-center gap-1.5 sm:gap-2">
          {months.map((month) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(month)}
              className={cn(
                "rounded-lg border px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium transition-colors",
                selectedMonth === month
                  ? "border-[var(--chart-main)] bg-[color-mix(in_srgb,var(--chart-main)_12%,transparent)] text-[var(--chart-main)]"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-card-foreground"
              )}
            >
              {month}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height={chartHeight}>
          {filter === "cases" ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--card)",
                  fontSize: "12px",
                  color: "var(--card-foreground)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="cases"
                name="Cases"
                stroke="var(--chart-main)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "var(--chart-main)", strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
              />
            </LineChart>
          ) : (
            <BarChart
              data={categoryBarData}
              layout="vertical"
              margin={{ top: 4, right: 24, bottom: 6, left: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                type="category"
                dataKey="shortName"
                width={122}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <Tooltip
                cursor={{ fill: "color-mix(in srgb,var(--muted) 35%, transparent)" }}
                formatter={(value: number, _name, payload) => [`${value} cases`, payload?.payload?.fullName]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--card)",
                  fontSize: "12px",
                  color: "var(--card-foreground)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {categoryBarData.map((item) => (
                  <Cell key={item.key} fill={item.color} />
                ))}
                <LabelList dataKey="value" position="right" className="fill-muted-foreground text-[11px]" />
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

"use client"

import { useMemo } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type CategoryChartItem = {
  name: string
  shortName?: string
  value: number
  color?: string
  dotClass?: string
}

const fallbackData: Required<CategoryChartItem>[] = [
  { name: "Violence or Threats", shortName: "Violence/Threats", value: 24.6, color: "var(--tertiary)", dotClass: "bg-[var(--tertiary)]" },
  { name: "Harassment & Abuse", shortName: "Harassment", value: 18.2, color: "#d99e04", dotClass: "bg-[#d99e04]" },
  { name: "Fraud & Scams", shortName: "Fraud/Scams", value: 15.8, color: "var(--secondary)", dotClass: "bg-[var(--secondary)]" },
  { name: "Public Disturbance", shortName: "Public Disturb.", value: 12.1, color: "#22c55e", dotClass: "bg-[#22c55e]" },
  { name: "Property & Theft", shortName: "Property/Theft", value: 17.5, color: "#1e4fa3", dotClass: "bg-[#1e4fa3]" },
  { name: "Community Dispute", shortName: "Community Disp.", value: 7.3, color: "#7c3aed", dotClass: "bg-[#7c3aed]" },
  { name: "Child & Vulnerable", shortName: "Child/Vulnerable", value: 4.5, color: "#8b5cf6", dotClass: "bg-[#8b5cf6]" },
]

const colors = ["var(--tertiary)", "#d99e04", "var(--secondary)", "#22c55e", "#1e4fa3", "#7c3aed", "#8b5cf6"]

interface IncidentCategoryChartProps {
  data?: CategoryChartItem[]
}

export function IncidentCategoryChart({ data }: IncidentCategoryChartProps) {
  const isMobile = useIsMobile()
  const chartHeight = isMobile ? 180 : 260
  
  const chartData = (data?.length ? data : fallbackData).map((item, index) => ({
    ...item,
    shortName: item.shortName ?? item.name,
    color: item.color ?? colors[index % colors.length],
    dotClass: item.dotClass ?? "",
  }))

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-3 sm:p-5 transition-all duration-300 hover:shadow-md">
      <h3 className="mb-3 sm:mb-4 text-sm sm:text-base font-semibold text-card-foreground">
        Incident Category
        <span className="ml-2 text-[10px] sm:text-xs font-normal text-muted-foreground">(This Week)</span>
      </h3>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 4, right: 20, bottom: 6, left: 8 }}
              >
                <XAxis type="number" hide domain={[0, 30]} />
                <YAxis
                  type="category"
                  dataKey="shortName"
                  width={116}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <Tooltip
                  formatter={(value: number) => `${value}%`}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? "Category"}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-card)",
                    fontSize: "12px",
                    color: "var(--color-card-foreground)",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
                    padding: "8px 12px",
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[0, 6, 6, 0]}
                  isAnimationActive={true}
                  animationDuration={600}
                >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                  <LabelList dataKey="value" position="right" formatter={(value: number) => `${value}%`} className="fill-muted-foreground text-[11px]" />
                </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 sm:mt-3 flex flex-wrap gap-x-2 sm:gap-x-3 gap-y-1">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-1 sm:gap-1.5">
              <div className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ${item.dotClass}`} style={{ backgroundColor: item.dotClass ? undefined : item.color }} />
              <span className="text-[9px] sm:text-[10px] text-muted-foreground" title={item.name}>
                {item.shortName}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

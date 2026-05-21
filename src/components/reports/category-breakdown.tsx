"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

type CategoryBreakdownItem = {
  name: string
  value: number
  color?: string
}

const fallbackData = [
  { name: "Violence or Threats", value: 24.6, color: "var(--tertiary)" },
  { name: "Harassment & Abuse", value: 18.2, color: "#d99e04" },
  { name: "Fraud & Scams", value: 15.8, color: "var(--secondary)" },
  { name: "Public Disturbance", value: 12.1, color: "#22c55e" },
  { name: "Property & Theft", value: 17.5, color: "#1e4fa3" },
  { name: "Community Dispute", value: 7.3, color: "#7c3aed" },
  { name: "Child & Vulnerable", value: 4.5, color: "#8b5cf6" },
]

const colors = ["var(--tertiary)", "#d99e04", "var(--secondary)", "#22c55e", "#1e4fa3", "#7c3aed", "#8b5cf6"]

interface CategoryBreakdownProps {
  data?: CategoryBreakdownItem[]
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const isMobile = useIsMobile()
  const chartHeight = isMobile ? 180 : 200
  
  const chartData = (data?.length ? data : fallbackData).map((item, index) => ({
    ...item,
    color: item.color ?? colors[index % colors.length],
  }))

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-3 sm:p-5 transition-all duration-300 hover:shadow-md">
      <h3 className="mb-3 sm:mb-4 text-sm sm:text-base font-semibold text-card-foreground">
        Category Breakdown
        <span className="ml-2 text-[10px] sm:text-xs font-normal text-muted-foreground">(This Week)</span>
      </h3>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex flex-1 min-h-0 items-center justify-center">
          <ResponsiveContainer width={isMobile ? "100%" : "86%"} height={chartHeight}>
            <PieChart margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 30 : 40}
                outerRadius={isMobile ? 60 : 75}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
                label={({ value }) => `${value}%`}
                labelLine={false}
                isAnimationActive={true}
                animationDuration={600}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${value}%`}
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
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 sm:mt-3 flex flex-wrap gap-x-2 sm:gap-x-3 gap-y-1">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-1">
              <div
                className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[9px] sm:text-[10px] text-muted-foreground line-clamp-1">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useMemo } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList, Cell } from "recharts"

const daysFull = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const daysShort = ["M", "T", "W", "Th", "F", "S", "S"]

// Weekly sample data (per-category). The tracker will sum these into daily totals.
type DayEntry = { day: string; [key: string]: number | string }

const fallbackData: DayEntry[] = [
  { day: "Monday", physical: 4, threats: 3, property: 4, theft: 3, family: 1, publicOrder: 2, privacy: 1, morality: 1 },
  { day: "Tuesday", physical: 3, threats: 2, property: 5, theft: 4, family: 2, publicOrder: 1, privacy: 1, morality: 1 },
  { day: "Wednesday", physical: 5, threats: 3, property: 4, theft: 3, family: 2, publicOrder: 2, privacy: 1, morality: 1 },
  { day: "Thursday", physical: 2, threats: 3, property: 3, theft: 2, family: 1, publicOrder: 2, privacy: 1, morality: 1 },
  { day: "Friday", physical: 6, threats: 5, property: 5, theft: 4, family: 2, publicOrder: 3, privacy: 2, morality: 1 },
  { day: "Saturday", physical: 3, threats: 2, property: 4, theft: 3, family: 1, publicOrder: 2, privacy: 1, morality: 1 },
  { day: "Sunday", physical: 2, threats: 2, property: 3, theft: 2, family: 1, publicOrder: 1, privacy: 1, morality: 1 },
]

const TRACKER_COLOR = { base: "#D4A017", light: "#F4C95D", dark: "#B3860F" }

export function IncidentCategoryChart({ height }: { height?: number }) {
  // Sum category values into a single `total` per day
  const chartData = useMemo(() => {
    return fallbackData.map((d) => ({
      day: d.day,
      total: Object.keys(d)
        .filter((k) => k !== "day")
        .reduce((sum, k) => sum + Number((d as DayEntry)[k] ?? 0), 0),
    }))
  }, [])

  const isMobile = useIsMobile()
  const defaultHeight = isMobile ? 200 : 300
  const effectiveHeight = typeof height === "number" ? height : defaultHeight

  const renderTotalLabel = (props: { x: number; y: number; width: number; value: number }) => {
    const { x, y, width, value } = props
    return (
      <text x={x + width / 2} y={y - 6} fill="var(--foreground)" fontSize={10} textAnchor="middle" fontWeight={600}>
        {value}
      </text>
    )
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border/50 bg-card p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all">
      {/* Header */}
      <h3 className="mb-3 text-sm sm:text-base font-semibold text-card-foreground">Weekly Case Tracker</h3>
        <div className="flex-1 min-h-0 w-full" style={{ height: effectiveHeight }}>
          <ResponsiveContainer key={effectiveHeight} width="100%" height={effectiveHeight}>
            <BarChart data={chartData} margin={{ top: 28, right: 0, left: 0, bottom: 0 }} barCategoryGap={6} barGap={4}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                interval={0}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(value) => {
                  const index = daysFull.indexOf(value)
                  return daysShort[index] ?? value
                }}
                padding={{ left: 6, right: 6 }}
              />

              <YAxis hide />
                <Tooltip
                  cursor={{
                    fill: "color-mix(in srgb,var(--muted) 30%, transparent)",
                  }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null

                    const totalCases = Number(payload[0].value ?? 0)

                    const weekTotal = chartData.reduce(
                      (sum, day) => sum + day.total,
                      0
                    )

                    const percentage =
                      weekTotal > 0
                        ? ((totalCases / weekTotal) * 100).toFixed(1)
                        : "0"

                    const highest = Math.max(...chartData.map((d) => d.total))
                    const isHighest = totalCases === highest

                    return (
                      <div className="rounded-xl border border-border bg-card p-3 shadow-xl text-[12px] min-w-[180px]">

                        {/* Header */}
                        <div className="mb-2 flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: TRACKER_COLOR.base }}
                          />
                          <span className="font-semibold text-card-foreground">
                            📅 {label}
                          </span>
                        </div>

                        <div className="mb-2 border-b border-border" />

                        {/* Total */}
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Total cases
                          </span>

                          <span className="font-semibold text-card-foreground">
                            {totalCases}
                          </span>
                        </div>

                        {/* Percentage */}
                        <div className="mt-2 text-[11px] text-muted-foreground">
                          {percentage}% of this week's incidents
                        </div>

                        {/* Highest day */}
                        {isHighest && (
                          <div className="mt-1 text-[11px] text-amber-500">
                            🔥 Highest incident day this week
                          </div>
                        )}
                      </div>
                    )
                  }}
                />

              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {chartData.map((_, idx) => (
                  <Cell key={`c-${idx}`} fill={idx % 2 === 0 ? TRACKER_COLOR.base : TRACKER_COLOR.light} />
                ))}
                <LabelList dataKey="total" position="top" content={renderTotalLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: TRACKER_COLOR.base }} />
          <span className="text-[10px] text-muted-foreground">Weekly cases</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: TRACKER_COLOR.light }} />
          <span className="text-[10px] text-muted-foreground">Weekly cases</span>
        </div>
      </div>
    </div>
  )
}
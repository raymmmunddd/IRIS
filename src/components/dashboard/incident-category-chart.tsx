"use client"

import { useMemo } from "react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const daysFull = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

const daysShort = ["M", "T", "W", "Th", "F", "S", "S"]

const categoryMeta = [
  { key: "violence", name: "Violence or Threats", indicator: "#ef4444" },
  { key: "harassment", name: "Harassment & Abuse", indicator: "#f59e0b" },
  { key: "fraud", name: "Fraud & Scams", indicator: "#eab308" },
  { key: "disturbance", name: "Public Disturbance", indicator: "#06b6d4" },
  { key: "property", name: "Property & Theft", indicator: "#1e40af" },
  { key: "community", name: "Community Dispute", indicator: "#22c55e" },
  { key: "child", name: "Child & Vulnerable", indicator: "#8b5cf6" },
]

const fallbackData = [
  { day: "Monday", violence: 4, harassment: 3, fraud: 2, disturbance: 2, property: 3, community: 1, child: 1 },
  { day: "Tuesday", violence: 3, harassment: 4, fraud: 3, disturbance: 2, property: 2, community: 1, child: 1 },
  { day: "Wednesday", violence: 5, harassment: 3, fraud: 2, disturbance: 3, property: 2, community: 2, child: 1 },
  { day: "Thursday", violence: 2, harassment: 3, fraud: 2, disturbance: 2, property: 3, community: 1, child: 1 },
  { day: "Friday", violence: 6, harassment: 4, fraud: 3, disturbance: 3, property: 4, community: 2, child: 2 },
  { day: "Saturday", violence: 3, harassment: 2, fraud: 2, disturbance: 2, property: 3, community: 1, child: 1 },
  { day: "Sunday", violence: 2, harassment: 2, fraud: 1, disturbance: 1, property: 2, community: 1, child: 1 },
]

export function IncidentCategoryChart() {
  const chartData = useMemo(() => fallbackData, [])

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border/50 bg-card p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all">

      {/* Header */}
      <h3 className="mb-3 text-sm sm:text-base font-semibold text-card-foreground">
        Weekly Incident Activity
      </h3>

      {/* Chart */}
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            barCategoryGap={0}
            barGap={0}
          >
            <defs>
              {categoryMeta.map((c) => (
                <linearGradient
                  key={c.key}
                  id={c.key}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={c.indicator} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={c.indicator} stopOpacity={0.35} />
                </linearGradient>
              ))}
            </defs>
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
              padding={{ left: 0, right: 0 }}
            />

            <YAxis hide />

            {/* Tooltip */}
            <Tooltip
              cursor={{
                fill: "color-mix(in srgb,var(--muted) 18%, transparent)",
              }}
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null

                const fullDay = daysFull.find((d) => d === label) ?? label

                return (
                  <div
                    className="rounded-lg border border-border bg-card p-3 shadow-lg"
                    style={{
                      fontSize: "12px",
                      color: "var(--card-foreground)",
                    }}
                  >
                    {/* BOLD TITLE */}
                    <div className="mb-2 font-semibold text-sm">
                      📅 {fullDay}
                    </div>

                    {/* ITEMS */}
                    <div className="space-y-1">
                      {payload.map((entry: any) => {
                        const meta = categoryMeta.find((c) => c.key === entry.dataKey)

                        return (
                          <div key={entry.dataKey} className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">
                              {meta?.name ?? entry.name}
                            </span>
                            <span className="font-medium">
                              {entry.value} cases
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              }}
            />

            {/* Incident Bars */}
            {categoryMeta.map((c, idx) => (
              <Bar
                key={c.key}
                dataKey={c.key}
                stackId="stack"
                fill={`url(#${c.key})`}
                barSize={42}
                radius={
                  idx === categoryMeta.length - 1 ? [10, 10, 0, 0] : 0
                }
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
        {categoryMeta.map((c) => (
          <div key={c.key} className="flex items-center gap-1.5">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: c.indicator }}
            />
            <span className="text-[10px] text-muted-foreground">
              {c.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
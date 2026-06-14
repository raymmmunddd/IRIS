"use client"

import { useMemo } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList
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
  {
    key: "violence",
    name: "Violence or Threats",
    start: "#ef4444",
    end: "#fca5a5",
    indicator: "#ef4444",
  },
  {
    key: "harassment",
    name: "Harassment & Abuse",
    start: "#f59e0b",
    end: "#fde68a",
    indicator: "#f59e0b",
  },
  {
    key: "fraud",
    name: "Fraud & Scams",
    start: "#eab308",
    end: "#fef9c3",
    indicator: "#eab308",
  },
  {
    key: "disturbance",
    name: "Public Disturbance",
    start: "#3b82f6",
    end: "#bfdbfe",
    indicator: "#3b82f6",
  },
  {
    key: "property",
    name: "Property & Theft",
    start: "#1e3a8a",
    end: "#93c5fd",
    indicator: "#1e3a8a",
  },
  {
    key: "community",
    name: "Community Dispute",
    start: "#22c55e",
    end: "#bbf7d0",
    indicator: "#22c55e",
  },
  {
    key: "child",
    name: "Child & Vulnerable",
    start: "#8b5cf6",
    end: "#c4b5fd",
    indicator: "#8b5cf6",
  },
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

export function IncidentCategoryChart({ height }: { height?: number }) {
  const chartData = useMemo(() => {
    return fallbackData.map((d) => {
      const total = categoryMeta.reduce(
        (sum, c) => sum + (d[c.key as keyof typeof d] as number),
        0
      )

      return {
        ...d,
        __total: total,
      }
    })
  }, [])
  const isMobile = useIsMobile()
  const defaultHeight = isMobile ? 200 : 300
  const effectiveHeight = typeof height === "number" ? height : defaultHeight

  const totals = useMemo(() => {
    return fallbackData.map((d) => {
      const total =
        categoryMeta.reduce((sum, c) => sum + (d[c.key as keyof typeof d] as number), 0)

      return {
        day: d.day,
        total,
      }
    })
  }, [])
  const renderTotalLabel = (props: any) => {
    const { x, y, width, value } = props

    return (
      <text
        x={x + width / 2}
        y={y - 6}
        fill="var(--foreground)"
        fontSize={10}
        textAnchor="middle"
        fontWeight={600}
      >
        {value}
      </text>
    )
  }

  const getTotal = (entry: any) => {
    return categoryMeta.reduce((sum, c) => {
      return sum + (entry?.[c.key] || 0)
    }, 0)
  }

  return (
  <div className="flex h-full flex-col rounded-2xl border border-border/50 bg-card p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all">
    {/* Header */}
    <h3 className="mb-3 text-sm sm:text-base font-semibold text-card-foreground">
      Weekly Incident Activity
    </h3>

    {/* Chart wrapper MUST define flex space only */}
    <div className="flex-1 min-h-0 w-full" style={{ height: effectiveHeight }}>
      <ResponsiveContainer key={effectiveHeight} width="100%" height={effectiveHeight}>
        <BarChart
          data={chartData}
          margin={{ top: 28, right: 0, left: 0, bottom: 0 }}
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
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor={c.start} />
                    <stop offset="100%" stopColor={c.end} />
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
    if (!active || !payload?.length) return null

    const fullDay =
      daysFull.find((d) => d === label) ?? label

    const totalCases = payload.reduce(
      (sum: number, entry: any) =>
        sum + Number(entry.value ?? 0),
      0
    )

    const orderedCategories = [...categoryMeta]
      .reverse()
      .map((cat) => {
        const entry = payload.find(
          (p: any) => p.dataKey === cat.key
        )

        return {
          ...cat,
          value: Number(entry?.value ?? 0),
        }
      })
      .filter((item) => item.value > 0)

      const highestValue = Math.max(
        ...orderedCategories.map((c) => c.value)
      )

      const highestCategories = orderedCategories.filter(
        (c) => c.value === highestValue
      )

      const hasTie = highestCategories.length > 1

    return (
      <div
        className="rounded-lg border border-border bg-card p-3 shadow-lg"
        style={{
          fontSize: "12px",
          color: "var(--card-foreground)",
        }}
      >
        {/* Day */}
        <div className="mb-2 font-semibold text-sm">
          📅 {fullDay}
        </div>

        {/* Total */}
        <div className="mb-2 flex items-center justify-between border-b border-border pb-2">
          <span className="text-muted-foreground">
            Total incidents
          </span>

          <span className="font-semibold">
            {totalCases}
          </span>
        </div>

        {/* Categories in stack order (bottom → top) */}
        <div className="space-y-1">
          {orderedCategories.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: item.indicator,
                  }}
                />

                <span className="text-muted-foreground">
                  {item.name}
                </span>
              </div>

              <span className="font-medium">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {highestCategories.length > 0 && (
          <div className="mt-2 border-t border-border pt-2 text-[11px] text-muted-foreground">
            {hasTie ? (
              <>
                🔥 Highest contributors:
                <div className="mt-1">
                  {highestCategories.map((c) => c.name).join(", ")}
                </div>
              </>
            ) : (
              <>
                🔥 Highest contributor: {highestCategories[0].name}
              </>
            )}
          </div>
        )}
      </div>
    )
  }}
/>a

              {/* Incident Bars */}
{categoryMeta.map((c, idx) => (
  <Bar
    key={c.key}
    dataKey={c.key}
    stackId="stack"
    fill={`url(#${c.key})`}
    radius={idx === categoryMeta.length - 1 ? [10, 10, 0, 0] : 0}
  >
    {idx === categoryMeta.length - 1 && (
      <LabelList
        dataKey={(entry: any) => getTotal(entry)}
        position="top"
        content={(props: any) => {
          const { x, y, width, value } = props

          return (
            <text
              x={x + width / 2}
              y={y - 6}
              textAnchor="middle"
              fontSize={10}
              fontWeight={600}
              fill="var(--foreground)"
            >
              {value}
            </text>
          )
        }}
      />
    )}
  </Bar>
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
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
    key: "physical",
    name: "Physical Injury",
    start: "#DC2626",
    end: "#FCA5A5",
    indicator: "#EF4444",
  },
  {
    key: "threats",
    name: "Threats & Coercion",
    start: "#EA580C",
    end: "#FDBA74",
    indicator: "#F97316",
  },
  {
    key: "property",
    name: "Property & Land",
    start: "#2563EB",
    end: "#93C5FD",
    indicator: "#2563EB",
  },
  {
    key: "theft",
    name: "Theft, Fraud & Financial",
    start: "#CA8A04",
    end: "#FDE68A",
    indicator: "#EAB308",
  },
  {
    key: "family",
    name: "Family & Child Custody",
    start: "#7C3AED",
    end: "#C4B5FD",
    indicator: "#8B5CF6",
  },
  {
    key: "publicOrder",
    name: "Public Order",
    start: "#16A34A",
    end: "#BBF7D0",
    indicator: "#22C55E",
  },
  {
    key: "privacy",
    name: "Privacy & Reputation",
    start: "#DB2777",
    end: "#FBCFE8",
    indicator: "#EC4899",
  },
  {
    key: "morality",
    name: "Personal & Morality",
    start: "#475569",
    end: "#CBD5E1",
    indicator: "#64748B",
  },
]

const fallbackData = [
  {
    day: "Monday",
    physical: 4,
    threats: 3,
    property: 4,
    theft: 3,
    family: 1,
    publicOrder: 2,
    privacy: 1,
    morality: 1,
  },
  {
    day: "Tuesday",
    physical: 3,
    threats: 2,
    property: 5,
    theft: 4,
    family: 2,
    publicOrder: 1,
    privacy: 1,
    morality: 1,
  },
  {
    day: "Wednesday",
    physical: 5,
    threats: 3,
    property: 4,
    theft: 3,
    family: 2,
    publicOrder: 2,
    privacy: 1,
    morality: 1,
  },
  {
    day: "Thursday",
    physical: 2,
    threats: 3,
    property: 3,
    theft: 2,
    family: 1,
    publicOrder: 2,
    privacy: 1,
    morality: 1,
  },
  {
    day: "Friday",
    physical: 6,
    threats: 5,
    property: 5,
    theft: 4,
    family: 2,
    publicOrder: 3,
    privacy: 2,
    morality: 1,
  },
  {
    day: "Saturday",
    physical: 3,
    threats: 2,
    property: 4,
    theft: 3,
    family: 1,
    publicOrder: 2,
    privacy: 1,
    morality: 1,
  },
  {
    day: "Sunday",
    physical: 2,
    threats: 2,
    property: 3,
    theft: 2,
    family: 1,
    publicOrder: 1,
    privacy: 1,
    morality: 1,
  },
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
                    x2="0"
                    y2="1"
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
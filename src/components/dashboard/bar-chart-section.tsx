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
    Area,
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

  const CASES_COLOR = "var(--chart-main)"

  const categoryMeta = [
    {
      key: "violence",
      name: "Violence or Threats",
      shortName: "Violence/Threats",
      gradient: "url(#violence)",
      indicator: "#ef4444",
    },
    {
      key: "harassment",
      name: "Harassment & Abuse",
      shortName: "Harassment",
      gradient: "url(#harassment)",
      indicator: "#f59e0b",
    },
    {
      key: "fraud",
      name: "Fraud & Scams",
      shortName: "Fraud/Scams",
      gradient: "url(#fraud)",
      indicator: "#eab308",
    },
    {
      key: "disturbance",
      name: "Public Disturbance",
      shortName: "Public Disturb.",
      gradient: "url(#disturbance)",
      indicator: "#3b82f6", // changed
    },
    {
      key: "property",
      name: "Property & Theft",
      shortName: "Property/Theft",
      gradient: "url(#property)",
      indicator: "#1e3a8a",
    },
    {
      key: "community",
      name: "Community Dispute",
      shortName: "Community Disp.",
      gradient: "url(#community)",
      indicator: "#22c55e",
    },
    {
      key: "child",
      name: "Child & Vulnerable",
      shortName: "Child/Vulnerable",
      gradient: "url(#child)",
      indicator: "#8b5cf6",
    },
  ]
  interface MonthlyTrendChartProps {
    data?: MonthlyTrendItem[]
    height?: number
    onFilterChange?: (mode: FilterMode) => void
  }

  export function MonthlyTrendChart({ data, height, onFilterChange }: MonthlyTrendChartProps) {
    const [filter, setFilter] = useState<FilterMode>("cases")
    const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()])
    const isMobile = useIsMobile()
    const defaultHeight = isMobile ? 200 : 300
    const effectiveHeight = typeof height === "number" ? height : defaultHeight
    const chartData = data?.length ? data : casesData

    const currentMonthIndex = new Date().getMonth()

    const visibleMonths = useMemo(
      () => months.slice(0, currentMonthIndex + 1),
      [currentMonthIndex]
    )

    const processedChartData = useMemo(() => {
      const currentMonthIndex = new Date().getMonth()

      return chartData
        .reduce<
          (MonthlyTrendItem & { actualCases: number })[]
        >((acc, item, index) => {
          const previousValue =
            acc.length > 0 ? acc[acc.length - 1].cases : item.cases

          const actualCases = item.cases ?? 0

          const isFutureMonth = index > currentMonthIndex
          const isCurrentMissing =
            index === currentMonthIndex && actualCases === 0

          const resolvedCases =
            isFutureMonth || isCurrentMissing
              ? previousValue
              : actualCases

          acc.push({
            ...item,
            actualCases,
            cases: resolvedCases,
          })

          return acc
        }, [])
        .filter((item) => visibleMonths.includes(item.month))
      }, [chartData, currentMonthIndex, visibleMonths])

      const categoryChartData = (data?.length ? data : categoryData).filter(
        (item) => visibleMonths.includes(item.month)
      )

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
      gradient: category.gradient,
      indicator: category.indicator,
    }
    })

    const lineChartHeight = effectiveHeight
    const filterModes: FilterMode[] = ["cases", "category"]
    const labelsMap: Record<FilterMode, string> = { cases: "Cases", category: "Category" }

    const getTrend = (current: number, prev?: number) => {
      if (!prev) return null
      const diff = current - prev
      const percent = ((diff / prev) * 100).toFixed(1)

      if (diff > 0) return `+${percent}% higher than previous`
      if (diff < 0) return `${percent}% lower than previous`
      return "No change from previous"
    }

    return (
      <div
        className="
          flex h-full flex-col
          rounded-2xl
          border border-border/50
          bg-card
          p-4 sm:p-6
          shadow-sm
          transition-all duration-300
          hover:shadow-lg
        "
      >
        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-sm sm:text-base font-semibold text-card-foreground">Monthly Trend</h3>
          <div className="flex items-center gap-2">
            {filterModes.map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setFilter(mode)
                  onFilterChange?.(mode)
                }}
                className={cn(
                  "rounded-lg border px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium transition-colors capitalize",
                  filter === mode
                    ? "border-[var(--chart-main)] bg-[var(--chart-main)] text-white"
                    : "border-border bg-card text-card-foreground hover:bg-muted"
                )}
              >
                {labelsMap[mode]}
              </button>
            ))}
          </div>
        </div>

        {filter === "category" && (
          <div className="mb-3 sm:mb-4 flex flex-wrap items-center gap-1.5 sm:gap-2">
            {visibleMonths.map((month) => (
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

      <div className="flex-1 min-h-0 w-full" style={{ height: lineChartHeight }}>
        <ResponsiveContainer key={`${filter}-${lineChartHeight}`} width="100%" height={lineChartHeight}>
            {filter === "cases" ? (
              <LineChart
                data={processedChartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -35,
                  bottom: 0,
                }}
              >
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
                  cursor={{
                    stroke: "var(--chart-main)",
                    strokeDasharray: "4 4",
                    strokeWidth: 1.5,
                  }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null

                    const data = payload[0].payload

                    const actual = data.actualCases
                    const display = data.cases

                    const index = chartData.findIndex((d) => d.month === label)
                    const prev = chartData[index - 1]?.cases

                    const trend = actual > 0 ? getTrend(actual, prev) : null
                    const isFuture = actual === 0 && index > new Date().getMonth()

                    return (
                      <div className="rounded-lg border border-border bg-card p-3 shadow-lg text-[12px]">
                        
                        {/* HEADER */}
                        <div className="mb-1 font-semibold">
                          📅 {label}
                        </div>

                        {/* VALUE */}
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">
                            Total cases
                          </span>

                          <span className="font-semibold">
                            {actual > 0 ? actual : 0}
                          </span>
                        </div>

                        {/* FUTURE MONTH INDICATOR */}
                        {isFuture && (
                          <div className="mt-1 text-[11px] text-amber-500">
                            📌 No recorded data yet. (Unavailable)
                          </div>
                        )}

                        {/* TREND ONLY FOR REAL DATA */}
                        {trend && (
                          <div className="mt-1 text-[11px] text-muted-foreground">
                            {trend}
                          </div>
                        )}
                      </div>
                    )
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cases"
                  stroke="none"
                  fill="url(#casesFill)"
                />
                <Line
                  type="monotone"
                  dataKey="cases"
                  name="Cases"
                  stroke={CASES_COLOR}
                  strokeWidth={2.5}
                  dot={{
                    r: 3,
                    fill: CASES_COLOR,
                    strokeWidth: 0,
                  }}
                  activeDot={{
                    r: 5,
                    fill: CASES_COLOR,
                    stroke: "var(--card)",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            ) : (
              <BarChart
                data={categoryBarData}
                layout="vertical"
                margin={{ top: 4, right: 24, bottom: 6, left: 8 }}
              >
                <defs>
                  {/* Violence & Threats */}
                  <linearGradient id="violence" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#fca5a5" />
                  </linearGradient>

                  {/* Harassment & Abuse */}
                  <linearGradient id="harassment" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fde68a" />
                  </linearGradient>

                  {/* Fraud & Scams */}
                  <linearGradient id="fraud" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#fef9c3" />
                  </linearGradient>

                  {/* Public Disturbance */}
                  <linearGradient id="disturbance" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#bfdbfe" />
                  </linearGradient>

                  {/* Property & Theft */}
                  <linearGradient id="property" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#1e3a8a" />
                    <stop offset="100%" stopColor="#93c5fd" />
                  </linearGradient>

                  {/* Community Dispute */}
                  <linearGradient id="community" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#bbf7d0" />
                  </linearGradient>

                  {/* Child & Vulnerable */}
                  <linearGradient id="child" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#c4b5fd" />
                  </linearGradient>
                </defs>
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
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null

                  const category = categoryBarData.find(
                    (c) => c.shortName === label
                  )

                  const itemValue = category?.value ?? 0

                    const monthTotal = categoryBarData.reduce(
                      (sum, c) => sum + c.value,
                      0
                    )

                    const percentage =
                      monthTotal > 0
                        ? ((itemValue / monthTotal) * 100).toFixed(1)
                        : "0"

                    const highestValue = Math.max(
                      ...categoryBarData.map((c) => c.value)
                    )

                    const monthHasData = highestValue > 0

                    const isHighest =
                      monthHasData &&
                      category?.value === highestValue

                    return (
                    <div className="rounded-lg border border-border bg-card p-3 shadow-lg text-[12px]">
                      <div className="mb-2 font-semibold">
                        📅 {selectedMonth}
                      </div>

                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full border border-white/30 shadow-sm"
                        style={{
                          backgroundColor: category?.indicator,
                        }}
                      />

                      <span className="font-medium text-card-foreground">
                        {category?.fullName}
                      </span>
                    </div>

                      <div className="mt-2 flex items-center justify-between gap-4">
                        <span className="text-muted-foreground">
                          Total cases
                        </span>

                        <span className="font-semibold">
                          {itemValue}
                        </span>
                      </div>

                      <div className="mt-2 text-[11px] text-muted-foreground">
                        {percentage}% of all incidents
                      </div>

                      {isHighest && (
                        <div className="mt-1 text-[11px] text-amber-500">
                          🔥 Highest category this month
                        </div>
                      )}
                    </div>
                  )
                  }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {categoryBarData.map((item) => (
                    <Cell
                      key={item.key}
                      fill={item.gradient}
                    />
                  ))}
                  <LabelList dataKey="value" position="right" className="fill-muted-foreground text-[11px]" />
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
          {filter === "cases" && (
            <div className="mt-3 flex justify-center">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: CASES_COLOR,
                  }}
                />
                <span className="text-[10px] text-muted-foreground">
                  Total Incident Cases
                </span>
              </div>
            </div>
          )}
          {filter === "category" && (
            <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1">
              {categoryBarData.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center gap-2"
                >
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: item.indicator,
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                  {item.fullName}
                </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

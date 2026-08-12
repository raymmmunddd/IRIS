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
    ShieldAlert,
    TriangleAlert,
    Home,
    Landmark,
    Users,
    HandCoins,
    Lock,
    HeartHandshake,
  } from "recharts"
  import { cn } from "@/lib/utils"

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  type MonthlyTrendItem = {
    month: string
    cases: number

    physical?: number
    threats?: number
    property?: number
    theft?: number
    family?: number
    publicOrder?: number
    privacy?: number
    morality?: number
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
    { month: "Jan", physical: 32, threats: 48, property: 28, theft: 22, family: 34, publicOrder: 14, privacy: 8, morality: 6 },
    { month: "Feb", physical: 38, threats: 52, property: 35, theft: 28, family: 38, publicOrder: 16, privacy: 8, morality: 6 },
    { month: "Mar", physical: 55, threats: 68, property: 48, theft: 38, family: 52, publicOrder: 24, privacy: 13, morality: 8 },
    { month: "Apr", physical: 42, threats: 62, property: 45, theft: 35, family: 48, publicOrder: 20, privacy: 10, morality: 6 },
    { month: "May", physical: 60, threats: 78, property: 55, theft: 45, family: 58, publicOrder: 28, privacy: 16, morality: 10 },
    { month: "Jun", physical: 52, threats: 72, property: 50, theft: 42, family: 55, publicOrder: 26, privacy: 15, morality: 9 },
    { month: "Jul", physical: 65, threats: 85, property: 58, theft: 48, family: 68, publicOrder: 32, privacy: 22, morality: 12 },
    { month: "Aug", physical: 58, threats: 80, property: 56, theft: 45, family: 65, publicOrder: 30, privacy: 21, morality: 11 },
    { month: "Sep", physical: 72, threats: 90, property: 62, theft: 52, family: 75, publicOrder: 35, privacy: 24, morality: 13 },
    { month: "Oct", physical: 68, threats: 86, property: 60, theft: 50, family: 72, publicOrder: 34, privacy: 22, morality: 12 },
    { month: "Nov", physical: 75, threats: 95, property: 68, theft: 56, family: 80, publicOrder: 38, privacy: 26, morality: 14 },
    { month: "Dec", physical: 80, threats: 102, property: 72, theft: 60, family: 85, publicOrder: 40, privacy: 28, morality: 15 },
  ]

  type FilterMode = "cases" | "category"

  const CASES_COLOR = "var(--chart-main)"

  const categoryMeta = [
    {
      key: "physical",
      name: "Physical Injury",
      shortName: "Physical",
      gradient: "url(#physical)",
      start: "#C62828",
      end: "#E57373",
      indicator: "#C62828",
    },
    {
      key: "threats",
      name: "Threats & Coercion",
      shortName: "Threats",
      gradient: "url(#threats)",
      start: "#EF6C00",
      end: "#FFB74D",
      indicator: "#EF6C00",
    },
    {
      key: "theft",
      name: "Theft, Fraud & Financial",
      shortName: "Theft/Fraud",
      gradient: "url(#theft)",
      start: "#D4A017",
      end: "#F4C95D",
      indicator: "#D4A017",
    },
    {
      key: "publicOrder",
      name: "Public Order",
      shortName: "Public",
      gradient: "url(#publicOrder)",
      start: "#2E7D32",
      end: "#81C784",
      indicator: "#2E7D32",
    },
    {
      key: "property",
      name: "Property & Land",
      shortName: "Property",
      gradient: "url(#property)",
      start: "#1565C0",
      end: "#64B5F6",
      indicator: "#1565C0",
    },
    {
      key: "privacy",
      name: "Privacy & Reputation",
      shortName: "Privacy",
      gradient: "url(#privacy)",
      start: "#3949AB",
      end: "#9FA8DA",
      indicator: "#3949AB",
    },
    {
      key: "family",
      name: "Family & Child Custody",
      shortName: "Family",
      gradient: "url(#family)",
      start: "#6A1B9A",
      end: "#BA68C8",
      indicator: "#6A1B9A",
    },
    {
      key: "morality",
      name: "Personal & Morality",
      shortName: "Morality",
      gradient: "url(#morality)",
      start: "#C2185B",
      end: "#F48FB1",
      indicator: "#C2185B",
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
                  {/* Physical Injury */}
                  <linearGradient id="physical" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#DC2626" />
                    <stop offset="100%" stopColor="#FCA5A5" />
                  </linearGradient>

                  {/* Threats & Coercion */}
                  <linearGradient id="threats" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#EA580C" />
                    <stop offset="100%" stopColor="#FDBA74" />
                  </linearGradient>

                  {/* Property & Land */}
                  <linearGradient id="property" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#93C5FD" />
                  </linearGradient>

                  {/* Theft, Fraud & Financial */}
                  <linearGradient id="theft" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#CA8A04" />
                    <stop offset="100%" stopColor="#FDE68A" />
                  </linearGradient>

                  {/* Family & Child Custody */}
                  <linearGradient id="family" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#C4B5FD" />
                  </linearGradient>

                  {/* Public Order */}
                  <linearGradient id="publicOrder" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#16A34A" />
                    <stop offset="100%" stopColor="#BBF7D0" />
                  </linearGradient>

                  {/* Privacy & Reputation */}
                  <linearGradient id="privacy" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#DB2777" />
                    <stop offset="100%" stopColor="#FBCFE8" />
                  </linearGradient>

                  {/* Personal & Morality */}
                  <linearGradient id="morality" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="100%" stopColor="#CBD5E1" />
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

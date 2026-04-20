"use client"

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

const data = [
  { name: "Violence or Threats", shortName: "Violence/Threats", value: 24.6, color: "var(--tertiary)", dotClass: "bg-[var(--tertiary)]" },
  { name: "Harassment & Abuse", shortName: "Harassment", value: 18.2, color: "#d99e04", dotClass: "bg-[#d99e04]" },
  { name: "Fraud & Scams", shortName: "Fraud/Scams", value: 15.8, color: "var(--secondary)", dotClass: "bg-[var(--secondary)]" },
  { name: "Public Disturbance", shortName: "Public Disturb.", value: 12.1, color: "#22c55e", dotClass: "bg-[#22c55e]" },
  { name: "Property & Theft", shortName: "Property/Theft", value: 17.5, color: "#1e4fa3", dotClass: "bg-[#1e4fa3]" },
  { name: "Community Dispute", shortName: "Community Disp.", value: 7.3, color: "#7c3aed", dotClass: "bg-[#7c3aed]" },
  { name: "Child & Vulnerable", shortName: "Child/Vulnerable", value: 4.5, color: "#8b5cf6", dotClass: "bg-[#8b5cf6]" },
]

export function IncidentCategoryChart() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-md">
      <h3 className="mb-4 text-base font-semibold text-card-foreground">
        Incident Category
        <span className="ml-2 text-xs font-normal text-muted-foreground">(This Week)</span>
      </h3>
      <div className="flex-1 flex flex-col">
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
                data={data}
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
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                  <LabelList dataKey="value" position="right" formatter={(value: number) => `${value}%`} className="fill-muted-foreground text-[11px]" />
                </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <div className={`h-2.5 w-2.5 rounded-full ${item.dotClass}`} />
              <span className="text-[10px] text-muted-foreground" title={item.name}>
                {item.shortName}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

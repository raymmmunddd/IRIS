"use client"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

const data = [
  { name: "Violence or Threats", value: 24.6, color: "var(--tertiary)" },
  { name: "Harassment & Abuse", value: 18.2, color: "#d99e04" },
  { name: "Fraud & Scams", value: 15.8, color: "var(--secondary)" },
  { name: "Public Disturbance", value: 12.1, color: "#22c55e" },
  { name: "Property & Theft", value: 17.5, color: "#1e4fa3" },
  { name: "Community Dispute", value: 7.3, color: "#7c3aed" },
  { name: "Child & Vulnerable", value: 4.5, color: "#8b5cf6" },
]

export function IncidentCategoryChart() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-md">
      <h3 className="mb-4 text-base font-semibold text-card-foreground">Incident Category</h3>
      <div className="flex-1 flex flex-col">
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
                label={({ value }) => `${value}%`}
                labelLine={false}
                isAnimationActive={true}
                animationDuration={600}
              >
                {data.map((entry, index) => (
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
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[10px] text-muted-foreground">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

"use client"

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

type CategoryBreakdownItem = { name: string; value: number }

const colors = ["#D9A514", "#2563EB", "#DC2626", "#16A34A", "#7C3AED", "#0891B2", "#DB2777"]

export function CategoryBreakdown({ data = [] }: { data?: CategoryBreakdownItem[] }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border/50 bg-card p-4 shadow-sm sm:p-6">
      <h3 className="mb-3 text-sm font-semibold text-card-foreground sm:text-base">Case Categories</h3>
      {data.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">No category data available.</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%" minHeight={260}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="48%" innerRadius={50} outerRadius={85} paddingAngle={2}>
              {data.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
            </Pie>
            <Tooltip formatter={(value) => [`${value}%`, "Share of cases"]} />
            <Legend verticalAlign="bottom" align="center" iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

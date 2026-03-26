"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const data = [
  { name: "Low", value: 234, color: "#3B82F6" },      // Blue
  { name: "Moderate", value: 567, color: "#8B5CF6" }, // Purple
  { name: "High", value: 312, color: "#EC4899" },     // Pink
  { name: "Critical", value: 34, color: "#F59E0B" },  // Orange
]

export function AIPriorityDistribution() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-semibold leading-none tracking-tight">AI Priority Distribution</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip
                contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card)",
                    color: "var(--card-foreground)",
                }}
            />
            <Legend 
                verticalAlign="middle" 
                align="right"
                layout="vertical"
                iconType="circle"
                formatter={(value, entry: any) => (
                    <span className="text-sm text-muted-foreground ml-2">
                        {value}: <span className="font-semibold text-foreground">{entry.payload.value}</span>
                    </span>
                )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

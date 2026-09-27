"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

type PriorityDistributionItem = {
  name: string
  value: number
  color?: string
}

const colors = ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B"]

interface AIPriorityDistributionProps {
  data?: PriorityDistributionItem[]
}

export function AIPriorityDistribution({ data }: AIPriorityDistributionProps) {
  const chartData = (data ?? []).map((item, index) => ({
    ...item,
    color: item.color ?? colors[index % colors.length],
  }))

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-semibold leading-none tracking-tight">Case Priority Distribution</h3>
      <div className="h-[300px] w-full">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No priority data available.</div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
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
                formatter={(value, entry) => (
                    <span className="text-sm text-muted-foreground ml-2">
                        {value}: <span className="font-semibold text-foreground">{entry.payload?.value ?? 0}</span>
                    </span>
                )}
            />
          </PieChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

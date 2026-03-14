import { Clock, Timer, Users, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SideStatCardProps {
  title: string
  value: string
  subtitle: string
  period: string
  change: number
  trending: "up" | "down"
  icon: React.ReactNode
  iconColor: string
}

function SideStatCard({ title, value, subtitle, period, change, trending, icon, iconColor }: SideStatCardProps) {
  const isUp = trending === "up"

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconColor}`}>
        {icon}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-xs font-semibold text-[var(--foreground)]/80">{title}</p>
        <p className="text-xl font-bold leading-tight text-[var(--foreground)]">{value}</p>
        {subtitle && (
          <p className="text-[11px] text-[var(--foreground)]/70">{subtitle}</p>
        )}
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-[var(--foreground)]/70">{period}</span>
          <span className={cn("flex items-center gap-0.5 font-semibold", isUp ? "text-[var(--chart-accent)]" : "text-[var(--tertiary)]")}>
            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {change}%
          </span>
        </div>
      </div>
    </div>
  )
}

export function SideStatCards() {
  const stats: SideStatCardProps[] = [
    {
      title: "Pending Cases",
      value: "152",
      subtitle: "89 under review, 63 awaiting assignment",
      period: "This Week",
      change: 5.4,
      trending: "down",
      icon: <Clock className="h-4 w-4 text-white" />,
      iconColor: "bg-[var(--chart-comparison)]",
    },
    {
      title: "Average Response Time",
      value: "4.2 hrs",
      subtitle: "Target: 6 hrs | SLA compliance: 94%",
      period: "This Week",
      change: 18.7,
      trending: "up",
      icon: <Timer className="h-4 w-4 text-white" />,
      iconColor: "bg-[var(--chart-accent)]",
    },
    {
      title: "Officer Workload",
      value: "12.4",
      subtitle: "Avg cases per officer | 35 active officers",
      period: "This Week",
      change: 3.1,
      trending: "up",
      icon: <Users className="h-4 w-4 text-white" />,
      iconColor: "bg-[var(--primary)]",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4">
      {stats.map((stat) => (
        <SideStatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}

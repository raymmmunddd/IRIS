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
    <div className="flex items-center gap-3 sm:gap-4 rounded-xl border border-border bg-card px-3 sm:px-4 py-3 sm:py-3.5">
      <div className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg text-xs sm:text-sm ${iconColor}`}>
        {icon}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-[11px] sm:text-xs font-semibold text-[var(--foreground)]/80">{title}</p>
        <p className="text-lg sm:text-xl font-bold leading-tight text-[var(--foreground)]">{value}</p>
        {subtitle && (
          <p className="text-[10px] sm:text-[11px] text-[var(--foreground)]/70 line-clamp-1">{subtitle}</p>
        )}
        <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-[11px]">
          <span className="text-[var(--foreground)]/70 truncate">{period}</span>
          <span className={cn("flex items-center gap-0.5 font-semibold shrink-0", isUp ? "text-[var(--chart-accent)]" : "text-[var(--tertiary)]")}>
            {isUp ? <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> : <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
            {change}%
          </span>
        </div>
      </div>
    </div>
  )
}

interface SideStatCardsProps {
  data?: {
    pending: number
    underReview: number
    officers: number
    users: number
  }
}

export function SideStatCards({ data }: SideStatCardsProps) {
  const stats: SideStatCardProps[] = [
    {
      title: "Pending Cases",
      value: (data?.pending ?? 152).toString(),
      subtitle: `${data?.underReview ?? 89} under review`,
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
      value: data?.officers ? ((data.pending + data.underReview) / data.officers).toFixed(1) : "12.4",
      subtitle: `Avg active cases per officer | ${data?.officers ?? 35} active officers`,
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

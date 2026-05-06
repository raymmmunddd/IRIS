import { FileText, Briefcase, CheckCircle2, TrendingUp, TrendingDown, Clock, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string
  period: string
  change: number
  trending: "up" | "down"
  icon: React.ReactNode
  iconBg: string
  accentClass?: string
}

function StatCard({ title, value, period, change, trending, icon, iconBg, accentClass }: StatCardProps) {
  const isUp = trending === "up"

  return (
    <div className={cn("flex items-center gap-3 sm:gap-4 rounded-xl border px-3 sm:px-4 py-3 sm:py-3.5", "border-border bg-card shadow-sm")}>
      <div className={cn("flex h-8 sm:h-10 w-8 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl text-xs sm:text-sm border border-white/20 shadow-sm", iconBg)}>
        {icon}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-[11px] sm:text-xs font-semibold text-[var(--foreground)]/80">{title}</p>
        <p className="text-lg sm:text-xl font-bold leading-tight text-[var(--foreground)]">{value}</p>
        <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-[11px]">
          <span className="text-[var(--foreground)]/70 truncate">{period}</span>
          <span className={cn("flex items-center gap-0.5 font-semibold shrink-0", isUp ? "text-emerald-600" : "text-red-500", accentClass)}>
            {isUp ? <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> : <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
            {change}%
          </span>
        </div>
      </div>
    </div>
  )
}

interface ReportStatsProps {
  data?: {
    totalCases: number
    resolutionRate: number
    activeOfficers: number
  }
}

export function ReportStats({ data }: ReportStatsProps) {
  const stats: StatCardProps[] = [
    {
      title: "Total Cases",
      value: (data?.totalCases ?? 1247).toLocaleString(),
      period: "All time",
      change: 12.5,
      trending: "up",
      icon: <FileText className="h-4 w-4" />,
      iconBg: "bg-blue-600 text-white",
    },
    {
      title: "Resolution Rate",
      value: `${data?.resolutionRate ?? 88}%`,
      period: "This month",
      change: 5.2,
      trending: "up",
      icon: <CheckCircle2 className="h-4 w-4" />,
      iconBg: "bg-emerald-600 text-white",
    },
    {
      title: "Avg Response Time",
      value: "2.4h",
      period: "This week",
      change: 8.4,
      trending: "down", // Lower time is better usually, but context implies trend direction. Let's say improved efficiency is 'up' trend visually or green? 
      // If we strictly follow design: 'down' usually means decrease in number. If response time decreased, that is good.
      // But typically green means good. Let's keep it simple: trending down = red arrow, up = green. Unless we flip for time.
      // I'll stick to visual consistency with dashboard: up = green/good, down = red/bad for now unless specified.
      icon: <Clock className="h-4 w-4" />,
      iconBg: "bg-purple-600 text-white",
    },
    {
      title: "Active Officers",
      value: (data?.activeOfficers ?? 8).toString(),
      period: "Available",
      change: 0,
      trending: "up", // Stable
      icon: <Users className="h-4 w-4" />,
      iconBg: "bg-orange-500 text-white",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}

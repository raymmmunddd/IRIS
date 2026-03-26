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
    <div className={cn("flex items-center gap-4 rounded-xl border px-4 py-3.5", "border-border bg-card shadow-sm")}>
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 shadow-sm", iconBg)}>
        {icon}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-xs font-semibold text-[var(--foreground)]/80">{title}</p>
        <p className="text-xl font-bold leading-tight text-[var(--foreground)]">{value}</p>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-[var(--foreground)]/70">{period}</span>
          <span className={cn("flex items-center gap-0.5 font-semibold", isUp ? "text-emerald-600" : "text-red-500", accentClass)}>
            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {change}%
          </span>
        </div>
      </div>
    </div>
  )
}

export function ReportStats() {
  const stats: StatCardProps[] = [
    {
      title: "Total Cases",
      value: "1,247",
      period: "All time",
      change: 12.5,
      trending: "up",
      icon: <FileText className="h-4 w-4" />,
      iconBg: "bg-blue-600 text-white",
    },
    {
      title: "Resolution Rate",
      value: "88%",
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
      value: "8",
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

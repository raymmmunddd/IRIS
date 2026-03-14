import { FileText, Briefcase, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
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
    <div className={cn("flex items-center gap-4 rounded-xl border px-4 py-3.5", "border-border bg-card")}>
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 shadow-sm", iconBg)}>
        {icon}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-xs font-semibold text-[var(--foreground)]/80">{title}</p>
        <p className="text-xl font-bold leading-tight text-[var(--foreground)]">{value}</p>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-[var(--foreground)]/70">{period}</span>
          <span className={cn("flex items-center gap-0.5 font-semibold", isUp ? "text-[var(--chart-accent)]" : "text-[var(--tertiary)]", accentClass)}>
            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {change}%
          </span>
        </div>
      </div>
    </div>
  )
}

export function StatCards() {
  const stats: StatCardProps[] = [
    {
      title: "Total Reports",
      value: "2,847",
      period: "This Week",
      change: 12.5,
      trending: "up",
      icon: <FileText className="h-4 w-4" />,
      iconBg: "bg-[var(--primary)] text-white",
    },
    {
      title: "Active Cases",
      value: "438",
      period: "This Week",
      change: 8.2,
      trending: "up",
      icon: <Briefcase className="h-4 w-4" />,
      iconBg: "bg-[var(--secondary)] text-white",
    },
    {
      title: "Resolved Cases",
      value: "1,923",
      period: "This Week",
      change: 23.1,
      trending: "up",
      icon: <CheckCircle2 className="h-4 w-4" />,
      iconBg: "bg-[var(--chart-accent)] text-white",
    },
    {
      title: "Urgent Cases",
      value: "76",
      period: "This Week",
      change: 4.3,
      trending: "down",
      icon: <AlertTriangle className="h-4 w-4" />,
      iconBg: "bg-[var(--tertiary)] text-white",
      accentClass: "text-[var(--tertiary)]",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}

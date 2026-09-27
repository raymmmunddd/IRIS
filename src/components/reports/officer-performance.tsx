import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type OfficerPerformanceItem = {
  fullName: string
  position: string
  performance: number
}

const fallbackOfficers = [
  {
    name: "R. Augustine",
    role: "Barangay Tanod Captain",
    rating: "Excellent",
    ratingColor: "text-green-600",
  },
  {
    name: "R. Dela Cruz",
    role: "Barangay Tanod",
    rating: "Good",
    ratingColor: "text-orange-500",
  },
  {
    name: "M. Santos",
    role: "Barangay Mediator",
    rating: "Outstanding",
    ratingColor: "text-green-600",
  },
]

interface OfficerResponseAnalysisProps {
  officers?: OfficerPerformanceItem[]
}

export function OfficerResponseAnalysis({ officers }: OfficerResponseAnalysisProps) {
  const items = officers?.length
    ? officers.map((officer) => ({
        name: officer.fullName,
        role: officer.position,
        rating: `${officer.performance}%`,
        ratingColor: officer.performance >= 75 ? "text-green-600" : "text-orange-500",
      }))
    : fallbackOfficers

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-semibold leading-none tracking-tight">Officer Performance</h3>
      <div className="flex flex-col gap-4">
        {items.map((officer, index) => (
          <div key={index} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{officer.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{officer.name}</p>
                <p className="text-xs text-muted-foreground">{officer.role}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-xs font-medium ${officer.ratingColor}`}>{officer.rating}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

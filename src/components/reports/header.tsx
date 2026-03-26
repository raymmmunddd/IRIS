import { FileText, Download, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ReportsHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">Detailed governance analytics and insights</p>
      </div>
      <div className="flex items-center gap-2">
        <Select defaultValue="monthly">
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="h-4 w-4" />
          Export Excel
        </Button>
        <Button variant="default" size="sm" className="bg-black text-white hover:bg-black/90 gap-2">
           <Calendar className="h-4 w-4" />
           Quarterly Summary
        </Button>
      </div>
    </div>
  )
}

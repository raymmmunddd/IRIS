"use client"

import { useMemo, useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight, MapPin } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ListPagination } from "@/components/ui/list-pagination"
import { paginateItems } from "@/lib/pagination"

export type ResidentScheduledCase = {
  id: string
  caseId: string
  title: string
  date: string
  time: string
  location: string
}

type ResidentCalendarProps = {
  scheduledCases: ResidentScheduledCase[]
  loading?: boolean
  title?: string
  description?: string
}

function manilaDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)
  return `${parts.find((part) => part.type === "year")?.value}-${parts.find((part) => part.type === "month")?.value}-${parts.find((part) => part.type === "day")?.value}`
}

function dateFromKey(key: string) {
  const [year, month, day] = key.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function formatDateLabel(key: string) {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(dateFromKey(key))
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    month: "long",
    year: "numeric",
  }).format(date)
}

export function ResidentCalendar({
  scheduledCases,
  loading = false,
  title = "Scheduled cases",
  description = "Upcoming hearings for your cases",
}: ResidentCalendarProps) {
  const today = manilaDateKey(new Date())
  const [visibleMonth, setVisibleMonth] = useState(() => dateFromKey(today))
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedCasesPage, setSelectedCasesPage] = useState(1)

  const casesByDate = useMemo(() => {
    const grouped = new Map<string, ResidentScheduledCase[]>()
    for (const scheduledCase of scheduledCases) {
      const items = grouped.get(scheduledCase.date) ?? []
      items.push(scheduledCase)
      grouped.set(scheduledCase.date, items)
    }
    return grouped
  }, [scheduledCases])

  const days = useMemo(() => {
    const firstOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1)
    const firstGridDay = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), -firstOfMonth.getDay() + 1)
    return Array.from({ length: 42 }, (_, index) => new Date(firstGridDay.getFullYear(), firstGridDay.getMonth(), firstGridDay.getDate() + index))
  }, [visibleMonth])

  const selectedCases = casesByDate.get(selectedDate) ?? []
  const pageSize = 5
  const { page: visiblePage, pageCount, items: visibleCases } = paginateItems(selectedCases, selectedCasesPage, pageSize)

  const moveMonth = (offset: number) => {
    const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1)
    setVisibleMonth(nextMonth)
    setSelectedDate(manilaDateKey(nextMonth))
    setSelectedCasesPage(1)
  }

  const goToToday = () => {
    const todayDate = dateFromKey(today)
    setVisibleMonth(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1))
    setSelectedDate(today)
    setSelectedCasesPage(1)
  }

  return (
    <section aria-labelledby="resident-calendar-heading" className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-primary/10 p-2.5 text-primary"><CalendarDays className="h-5 w-5" /></span>
          <div>
            <h2 id="resident-calendar-heading" className="font-semibold">{title}</h2>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => moveMonth(-1)} aria-label="Previous month" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" onClick={goToToday} className="min-h-10 rounded-lg border border-border px-3 text-xs font-semibold hover:bg-muted">Today</button>
          <button type="button" onClick={() => moveMonth(1)} aria-label="Next month" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      <p aria-live="polite" className="mb-3 mt-5 text-center text-sm font-semibold">{formatMonthLabel(visibleMonth)}</p>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day} className="py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">{day}</span>)}
        {days.map((day) => {
          const dateKey = manilaDateKey(day)
          const dayCases = casesByDate.get(dateKey) ?? []
          const isCurrentMonth = day.getMonth() === visibleMonth.getMonth()
          const isSelected = selectedDate === dateKey
          const isToday = today === dateKey
          const hearingCountLabel = `${dayCases.length} ${dayCases.length === 1 ? "hearing" : "hearings"}`
          const hearingDetails = dayCases.length
            ? `: ${dayCases.map((hearing) => `#${hearing.caseId} ${hearing.title} at ${hearing.time}`).join("; ")}`
            : ""
          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => { setSelectedDate(dateKey); setSelectedCasesPage(1) }}
              aria-label={`${formatDateLabel(dateKey)}${dayCases.length ? `, ${hearingCountLabel}${hearingDetails}` : ""}`}
              title={dayCases.length ? `${hearingCountLabel}${hearingDetails}` : formatDateLabel(dateKey)}
              aria-pressed={isSelected}
              aria-current={isToday ? "date" : undefined}
              className={`relative flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 text-xs transition-colors sm:min-h-20 sm:text-sm ${isSelected ? "bg-primary text-primary-foreground" : isCurrentMonth ? "text-foreground hover:bg-muted" : "text-muted-foreground/50 hover:bg-muted/60"} ${isToday && !isSelected ? "ring-1 ring-primary" : ""}`}
            >
              <span>{day.getDate()}</span>
              {dayCases.length > 0 && <span className={`max-w-full rounded-md px-0.5 py-0.5 text-center text-[8px] font-semibold leading-tight sm:px-1 sm:text-[10px] ${isSelected ? "bg-primary-foreground/15 text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                {hearingCountLabel}
              </span>}
            </button>
          )
        })}
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <h3 className="text-sm font-semibold">{formatDateLabel(selectedDate)}</h3>
        {loading ? (
          <div aria-label="Loading scheduled cases" className="mt-3 space-y-2"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
        ) : selectedCases.length > 0 ? (
          <>
            <ul className="mt-3 space-y-2">
              {visibleCases.map((scheduledCase) => <li key={scheduledCase.id} className="rounded-xl border border-primary/15 bg-primary/5 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0"><p className="text-xs font-bold text-primary">#{scheduledCase.caseId}</p><p className="mt-1 text-sm font-semibold">{scheduledCase.title}</p></div>
                  <time className="shrink-0 rounded-full bg-card px-2.5 py-1 text-xs font-semibold text-foreground">{scheduledCase.time}</time>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5 shrink-0" />{scheduledCase.location}</p>
              </li>)}
            </ul>
            <ListPagination
              page={visiblePage}
              pageCount={pageCount}
              pageSize={pageSize}
              totalItems={selectedCases.length}
              itemLabel="hearings"
              onPageChange={setSelectedCasesPage}
            />
          </>
        ) : scheduledCases.length === 0 ? (
          <p className="mt-2 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">No upcoming hearings are scheduled for your cases. New hearing dates will appear here.</p>
        ) : (
          <p className="mt-2 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">No hearing is scheduled for this day.</p>
        )}
      </div>

    </section>
  )
}

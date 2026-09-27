const MANILA_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Manila",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

function dateOnlyUtc(value: Date | string): Date {
  if (typeof value === "string") {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
    if (match) return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
  }

  const date = value instanceof Date ? value : new Date(value)
  if (!Number.isFinite(date.getTime())) throw new RangeError("Invalid date")
  const parts = MANILA_DATE_FORMATTER.formatToParts(date)
  const part = (type: string) => Number(parts.find((item) => item.type === type)?.value)
  return new Date(Date.UTC(part("year"), part("month") - 1, part("day")))
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function todayInManila(now = new Date()): Date {
  return dateOnlyUtc(now)
}

export function isBusinessDay(date: Date | string, holidays: Date[] = []): boolean {
  const day = dateOnlyUtc(date)
  const weekday = day.getUTCDay()
  if (weekday === 0 || weekday === 6) return false

  const key = dayKey(day)
  return !holidays.some((holiday) => dayKey(dateOnlyUtc(holiday)) === key)
}

export function addBusinessDays(startDate: Date | string, numberOfDays: number, holidays: Date[] = []): Date {
  if (!Number.isInteger(numberOfDays)) throw new RangeError("Business day count must be an integer")
  const result = dateOnlyUtc(startDate)
  if (numberOfDays === 0) return result

  const direction = Math.sign(numberOfDays)
  let remaining = Math.abs(numberOfDays)
  while (remaining > 0) {
    result.setUTCDate(result.getUTCDate() + direction)
    if (isBusinessDay(result, holidays)) remaining -= 1
  }
  return result
}

export function countBusinessDaysBetween(startDate: Date | string, endDate: Date | string, holidays: Date[] = []): number {
  const start = dateOnlyUtc(startDate)
  const end = dateOnlyUtc(endDate)
  const direction = Math.sign(end.getTime() - start.getTime())
  if (direction === 0) return 0

  let count = 0
  const cursor = new Date(start)
  while (cursor.getTime() !== end.getTime()) {
    cursor.setUTCDate(cursor.getUTCDate() + direction)
    if (isBusinessDay(cursor, holidays)) count += direction
  }
  return count
}

export function businessDaysRemaining(deadline: Date | string, now = new Date(), holidays: Date[] = []): number {
  return countBusinessDaysBetween(todayInManila(now), deadline, holidays)
}

export function addCalendarMonths(startDate: Date | string, numberOfMonths: number): Date {
  if (!Number.isInteger(numberOfMonths)) throw new RangeError("Calendar month count must be an integer")
  const start = dateOnlyUtc(startDate)
  const day = start.getUTCDate()
  const targetMonth = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + numberOfMonths, 1))
  const lastDay = new Date(Date.UTC(targetMonth.getUTCFullYear(), targetMonth.getUTCMonth() + 1, 0)).getUTCDate()
  targetMonth.setUTCDate(Math.min(day, lastDay))
  return targetMonth
}

export function toDateOnlyString(date: Date | string): string {
  return dayKey(dateOnlyUtc(date))
}
